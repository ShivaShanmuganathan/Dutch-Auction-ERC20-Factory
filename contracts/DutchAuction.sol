// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.0;

/**
 * @title Owner
 * @dev Set & change owner
 */
import "./Token.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";


contract DutchAuction is Ownable{

    struct Auction {
        uint256 startDate;
        uint256 endDate;
        uint256 startPrice;
        uint256 reservePrice;
        uint256 biddingPrice;
        uint256 totalTokens;
        uint256 remainingTokens;
        uint256 totalBids;
        uint256 totalAmount;
        address token;
        bool auctionComplete;
    }

    uint256 auctionID;
    
    // Maps user address to auctionID to reservedTokens;
    mapping (address => mapping (uint256 => uint256)) public reservedTokens;
    mapping (address => mapping (uint256 => uint256)) public moneyDeposited;
    mapping (address => mapping (uint256 => uint256)) public bidIDList;
    mapping (uint256 => mapping (uint256 => address)) public biddersList;
    
    // bidList[msg.sender][_auctionID] = bidID;
    mapping (address => uint256) public auctionOwner;
    mapping (uint256 => Auction) public auctionDetails;
    
    event AuctionCreated(uint256 auctionID, uint256 totalTokens, address tokenAddress);
    event BidCreated(uint256 bidID, uint256 auctionID, address bidder, uint256 amount, uint256 price, uint256 remainingTokens);
    
    
    function createAuction(
        uint256 _endDate,
        uint256 _startPrice,
        uint256 _reservePrice,
        uint256 _totalTokens,
        address _token
        ) 
    public
    {
        require(auctionOwner[msg.sender] == 0, "Your Auction is still on-going");
        auctionID = auctionID + 1;
        auctionDetails[auctionID] = Auction({
            startDate: block.timestamp,
            endDate: auctionDetails[auctionID].startDate + _endDate,
            startPrice : _startPrice,
            reservePrice : _reservePrice,
            biddingPrice : _startPrice,
            totalTokens : _totalTokens,
            remainingTokens : _totalTokens,
            totalBids : 0,
            totalAmount : 0,
            token : _token,
            auctionComplete: false
        });
        // auctionDetails[auctionID].startDate = block.timestamp;
        // auctionDetails[auctionID].endDate = auctionDetails[auctionID].startDate + _endDate;
        // auctionDetails[auctionID].startPrice = _startPrice;
        // auctionDetails[auctionID].reservePrice = _reservePrice;
        // auctionDetails[auctionID].totalTokens = _totalTokens;
        // auctionDetails[auctionID].remainingTokens = _totalTokens;
        // auctionDetails[auctionID].token = _token;
        auctionOwner[msg.sender] = auctionID;
        IERC20(_token).transferFrom(msg.sender, address(this), _totalTokens * 10**18);
        
        // auctionDetails[auctionID].token.transferFrom(msg.sender, address(this), _totalTokens);
        //transferToContract(msg.sender, _token, _totalTokens);
        
        emit AuctionCreated(auctionID, _totalTokens, _token);
        //return auctionID;
    }
    
    function totalAuctions() 
    public 
    view 
    returns (uint256)
    {
        return auctionID;
    }
    
    
    function currentPrice(uint256 _auctionID) 
    public 
    view 
    returns (uint256) {
        
        int256 time_diff = int(auctionDetails[_auctionID].endDate - auctionDetails[_auctionID].startDate);
        int256 price_diff = int(auctionDetails[_auctionID].startPrice - auctionDetails[_auctionID].reservePrice) * -1;
        int slope = int(price_diff/time_diff);
        int intercept = int(auctionDetails[_auctionID].startPrice) - (slope* (int(auctionDetails[_auctionID].startDate)));
        int price = int(slope * int(block.timestamp) + intercept);
        if (price < int(auctionDetails[_auctionID].reservePrice)) {
            price = int(auctionDetails[_auctionID].reservePrice);
        }
        return uint(price);

    }

    // uint256 elapse = block.timestamp - auctionDetails[_auctionID].startDate;
    // uint256 calculated = (elapse * 100) / (auctionDetails[_auctionID].endDate - auctionDetails[_auctionID].startDate);
    // uint256 deduction = (calculated * auctionDetails[_auctionID].startPrice) / 100;
    // uint256 currPrice = auctionDetails[_auctionID].startPrice - deduction;
    // if (currPrice < auctionDetails[_auctionID].reservePrice) {
    //     currPrice = auctionDetails[_auctionID].reservePrice;
    // }
    // return currPrice;
    
    
    function createBid(uint256 _auctionID, uint256 _amount) 
    payable
    external
    onlyNonAuctionOwners(_auctionID)
    {
        // Check if auction is still on-going
        
        require(auctionDetails[_auctionID].auctionComplete == false, "Auction is over");
        require(reservedTokens[msg.sender][_auctionID] == 0, "One can only bid once");
        require(_amount <= auctionDetails[_auctionID].remainingTokens, "Auction does not have sufficient tokens");
        uint256 price = currentPrice(_auctionID);
        uint tokensRequested = _amount / 10**18;
        require(msg.value >= price * tokensRequested, "more money required");
        auctionDetails[_auctionID].biddingPrice = price;
        reservedTokens[msg.sender][_auctionID] = _amount;
        moneyDeposited[msg.sender][_auctionID] = msg.value;
        auctionDetails[_auctionID].remainingTokens = auctionDetails[_auctionID].remainingTokens - _amount;
        auctionDetails[_auctionID].totalBids = auctionDetails[_auctionID].totalBids + 1;
        uint256 bidID = auctionDetails[_auctionID].totalBids;
        auctionDetails[_auctionID].totalAmount = auctionDetails[_auctionID].totalAmount + msg.value;
        bidIDList[msg.sender][_auctionID] = bidID;
        biddersList[_auctionID][bidID] = msg.sender;

        emit BidCreated(bidID, _auctionID, msg.sender, _amount, price, auctionDetails[_auctionID].remainingTokens);
    }

    function endAuction(uint256 _auctionID) 
    external
    onlyAuctionOwners(_auctionID) 
    {
        // check if auction is still on-going
        // bool auctionComplete = true
        // require(auctionComplete == false, "Auction was ended");
        require(auctionDetails[_auctionID].auctionComplete == false, "Auction is over");
        if (auctionDetails[_auctionID].remainingTokens == 0) {
            
            uint256 bidding_price = auctionDetails[_auctionID].biddingPrice;
            address tokenAddress = auctionDetails[_auctionID].token;

            for (uint i = 1; i<=auctionDetails[_auctionID].totalBids; i++){
                
                address bidder = biddersList[_auctionID][i];
                uint256 bidderTokens = reservedTokens[bidder][_auctionID];
                uint256 amountPaid = moneyDeposited[bidder][_auctionID];
                IERC20(tokenAddress).transfer(bidder, bidderTokens);
                reservedTokens[bidder][_auctionID] = 0;
                uint256 refundAmt = amountPaid - (bidding_price*bidderTokens);
                (bool token_success, ) = payable(bidder).call{value: refundAmt}("");
                require(token_success, "Transfer failed.");
                moneyDeposited[bidder][_auctionID] = 0;
                auctionDetails[_auctionID].totalAmount = auctionDetails[_auctionID].totalAmount - refundAmt;

            }
            uint256 ownerWithdrawBalance = auctionDetails[_auctionID].totalAmount;
            auctionDetails[_auctionID].totalAmount = 0;
            (bool eth_success, ) = msg.sender.call{value: ownerWithdrawBalance}("");
            require(eth_success, "Transfer failed.");
            ownerWithdrawBalance = 0;
            auctionOwner[msg.sender] = 0;
            auctionDetails[_auctionID].auctionComplete = true;

        }
        else if (block.timestamp > auctionDetails[_auctionID].endDate) {

            uint256 bidding_price = auctionDetails[_auctionID].biddingPrice;
            // change to reservePrice if auction owner should only receive the reserve price for tokens
            // uint256 bidding_price = auctionDetails[_auctionID].reservePrice;
            address tokenAddress = auctionDetails[_auctionID].token;
            for (uint i = 1; i<=auctionDetails[_auctionID].totalBids; i++){
                
                address bidder = biddersList[_auctionID][i];
                uint256 bidderTokens = reservedTokens[bidder][_auctionID];
                uint256 amountPaid = moneyDeposited[bidder][_auctionID];
                IERC20(tokenAddress).transfer(bidder, bidderTokens);
                reservedTokens[bidder][_auctionID] = 0;
                uint256 refundAmt = amountPaid - (bidding_price*bidderTokens);
                (bool token_success2, ) = payable(bidder).call{value: refundAmt}("");
                require(token_success2, "Transfer failed.");
                moneyDeposited[bidder][_auctionID] = 0;
                auctionDetails[_auctionID].totalAmount = auctionDetails[_auctionID].totalAmount - refundAmt;

            }
            IERC20(tokenAddress).transfer(msg.sender, auctionDetails[_auctionID].remainingTokens * 10**18);
            auctionDetails[_auctionID].remainingTokens = 0;
            uint256 ownerWithdrawBalance = auctionDetails[_auctionID].totalAmount;
            auctionDetails[_auctionID].totalAmount = 0;
            (bool eth_success2, ) = msg.sender.call{value: ownerWithdrawBalance}("");
            require(eth_success2, "Transfer failed.");
            ownerWithdrawBalance = 0;
            auctionOwner[msg.sender] = 0;
            auctionDetails[_auctionID].auctionComplete = true;
        }

        else {
            revert("AUCTION IS ON-GOING, YOU CAN END AUCTION AFTER AUCTION TIME IS OVER OR AFTER ALL TOKENS ARE SOLD");
        }
        
    }

    function checkTime()
    public
    view 
    returns (uint256) {

        return block.timestamp;

    }

    modifier onlyAuctionOwners(uint256 _auctionID){

        require(auctionOwner[msg.sender] == _auctionID, "You are not the Auction Owner");
        _;

    }

    modifier onlyNonAuctionOwners(uint256 _auctionID){

        require(auctionOwner[msg.sender] != _auctionID, "Auction Owner cannot make a bid");
        _;

    }
}