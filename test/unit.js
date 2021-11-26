const { expect } = require("chai");
const { ethers } = require("hardhat");
const { assert } = require("console");
const { BigNumber } = require("ethers");
const { type } = require("os");
const provider = waffle.provider;




const transformAuctionDetails = (auctionData) => {
  return {
    
    startDate: auctionData.startDate.toNumber(),
    endDate: auctionData.endDate.toNumber(),
    startPrice: ethers.utils.formatEther(auctionData.startPrice),
    reservePrice: ethers.utils.formatEther(auctionData.reservePrice),
    biddingPrice: ethers.utils.formatEther(auctionData.biddingPrice),
    totalTokens: auctionData.totalTokens.toNumber(),
    // ethers.utils.formatEther(auctionData.totalTokens),
    remainingTokens: auctionData.remainingTokens.toNumber(),
    totalBids: auctionData.totalBids.toNumber(),
    totalAmount: ethers.utils.formatEther(auctionData.totalAmount),
    token: auctionData.token.toString(),
    auctionComplete: auctionData.auctionComplete,
         
  };
};

describe("DutchAuction", function () {

  let owner, addr1, addr2;
  let ownerBalance;
  
  before(async function () {

    [owner, addr1, addr2] = await ethers.getSigners();          
    const Token = await ethers.getContractFactory('Token', owner);
    token12 = await Token.deploy();
    decimals = await token12.decimals();
    // let decimals = await token.decimals();
    // let obs_minted_tokens = (await token.balanceOf(owner.address)) / 10**decimals; 
    // console.log(obs_minted_tokens);
    
    DutchAuction = await ethers.getContractFactory('DutchAuction', owner);
    auctionContract = await DutchAuction.deploy();
    await auctionContract.deployed();

  });

  describe("Minting Local Tokens", function () { 

    it("Should mint tokens & check owner balance", async function () { 

      
      ownerBalance = (await token12.balanceOf(owner.address)) / 10**decimals; 
      expect(ownerBalance).to.be.equal(1000000);
      console.log(decimals);
    });

  });
  
  describe("CREATE AUCTION ()", function () { 

    it("Should create auction with the approved tokens", async function () {

      // first auction has limited tokens and long enddate
      await token12.connect(owner).approve(auctionContract.address, ethers.utils.parseEther("20"));
      await auctionContract.connect(owner).createAuction(
        Math.floor(Date.now() / 1000 + 3600),
        ethers.utils.parseEther("1"),
        ethers.utils.parseEther("0.5"),
        20,
        token12.address
      );
  
      // second auction has many tokens and short enddate
      await token12.connect(owner).transfer(addr1.address, ethers.utils.parseEther("80"));
      await token12.connect(addr1).approve(auctionContract.address, ethers.utils.parseEther("80"));
      await auctionContract.connect(addr1).createAuction(
        Math.floor(Date.now() / 1000 + 1800),
        ethers.utils.parseEther("1"),
        ethers.utils.parseEther("0.5"),
        80,
        token12.address
      );
  
      
    });

    it("Should check if created auctions are live", async function () { 
      let auctionDetails = await auctionContract.auctionDetails(1);
      let auctionStatus = transformAuctionDetails(auctionDetails).auctionComplete;  
      expect(auctionStatus).to.be.false;

      let auctionDetails2 = await auctionContract.auctionDetails(2);
      let auctionStatus2 = transformAuctionDetails(auctionDetails2).auctionComplete;  
      expect(auctionStatus2).to.be.false;
    });

    it("Should check auction details", async function () { 
    
      let auctionDetails = await auctionContract.auctionDetails(1);
      let result = transformAuctionDetails(auctionDetails);
      console.log(result);
      expect(result.endDate - result.startDate).to.be.at.most(3600);
      expect(result.startPrice).to.be.equal('1.0');
      expect(result.biddingPrice).to.be.equal('1.0');
      expect(result.reservePrice).to.be.equal('0.5');
      // console.log(result.totalTokens);
      // expect(result.totalTokens).to.be.equal(ethers.utils.parseEther("2000"));
      // expect(result.remainingTokens).to.be.equal(ethers.utils.parseEther("2000"));
      
      expect(result.totalBids).to.be.equal(0);
      expect(result.totalAmount).to.be.equal('0.0');
      expect(result.token).to.be.equal(token12.address);
      expect(result.auctionComplete).to.be.false;

      let auctionDetails2 = await auctionContract.auctionDetails(2);
      let result2 = transformAuctionDetails(auctionDetails2);
      console.log(result2);
      expect(result2.endDate - result2.startDate).to.be.at.most(1800);
      expect(result2.startPrice).to.be.equal('1.0');
      expect(result2.biddingPrice).to.be.equal('1.0');
      expect(result2.reservePrice).to.be.equal('0.5');
      
      // expect(result2.totalTokens).to.be.equal(800);
      // expect(result2.remainingTokens).to.be.equal(800);
      
      expect(result2.totalBids).to.be.equal(0);
      expect(result2.totalAmount).to.be.equal('0.0');
      expect(result2.token).to.be.equal(token12.address);
      expect(result2.auctionComplete).to.be.false;
  
    });

    it("Should check auction owner & auction ID", async function () { 

      let auctionID = (await auctionContract.auctionOwner(owner.address)).toNumber();
      expect(auctionID).to.equal(1);

      let auctionID2 = (await auctionContract.auctionOwner(addr1.address)).toNumber();
      expect(auctionID2).to.equal(2);

      let auctionID3 = (await auctionContract.auctionOwner(addr2.address)).toNumber();
      expect(auctionID3).to.equal(0);
      
    });

    
    it("Should check owner & contract balance for erc20 tokens", async function () { 
      
      let contract_token_balance = (await token12.balanceOf(auctionContract.address)) / 10**decimals; 
      // console.log(contract_token_balance);
      // console.log(ownerBalance);
      ownerNewBalance = (await token12.balanceOf(owner.address)) / 10**decimals; 
      expect(ownerBalance - contract_token_balance).to.be.equal(ownerNewBalance);

    });

  
    // it("Should check decrease in auction price", async function () { 
  
    //   console.log((await auctionContract.currentPrice(1)).toString());
    //   const timeNow = (await auctionContract.checkTime()).toNumber();
    //   console.log(timeNow);
      
    //   await ethers.provider.send('evm_increaseTime', [1800]);
    //   await ethers.provider.send('evm_mine');
    //   console.log((await auctionContract.currentPrice(1)).toString());

    //   await ethers.provider.send('evm_increaseTime', [900]);
    //   await ethers.provider.send('evm_mine');
    //   console.log((await auctionContract.currentPrice(1)).toString());
    //   console.log((await auctionContract.currentPrice(2)).toString());
  
    // });
  
    // it("Should check reserve price", async function () { 
  
    //   console.log((await auctionContract.checkTime()).toString());
    //   console.log((await auctionContract.currentPrice(1)).toString());
    //   await ethers.provider.send('evm_increaseTime', [176]);
    //   await ethers.provider.send('evm_mine');
    //   console.log((await auctionContract.checkTime()).toString());
    //   console.log((await auctionContract.currentPrice(1)).toString());
      
    // });
  

  });

  describe("CREATE BID ()", function () { 

    it("Should check if only nonAuctionOwners can access this bid", async function () { 

      await expect(auctionContract.connect(owner).createBid(1, 10)).to.be.revertedWith('Auction Owner cannot make a bid');
      // await expect(auctionContract.connect(addr1).createBid(1, 10)).to.not.be.revertedWith('Auction Owner cannot make a bid');

    });

    it("Should check if auction is live", async function () { 

      expect(transformAuctionDetails(await auctionContract.connect(owner).auctionDetails(1)).auctionComplete).to.be.false;
      //await expect(auctionContract.connect(addr1).createBid(1, 10)).to.not.be.revertedWith('Auction Owner cannot make a bid');

    });

    it("Should check if bidder has any previous bids in this auction", async function () { 
      
      expect(await auctionContract.reservedTokens(addr1.address,1)).to.be.equal(0);

    });

    //check if auction has sufficient tokens for bidder
    it("Should check if auction has sufficient tokens for bidder", async function () { 

      expect(transformAuctionDetails(await auctionContract.auctionDetails(1)).remainingTokens).to.not.be.equal(0);

    });

    it("Should create 1st bid in auction 1 with adddress 1 & check the created bid details", async function () {
      let price = parseFloat(ethers.utils.formatEther(await auctionContract.currentPrice(1)));
      // console.log(price);
      let token_amount = 10;
      let cost = (price * token_amount).toString();
      // console.log("cost", cost);
      let requestTokens = 10;
      let auctionDetailsBefore = await auctionContract.auctionDetails(1);
      let auctionDataBefore = transformAuctionDetails(auctionDetailsBefore);
      let totalAmountBefore = parseFloat(auctionDataBefore.totalAmount);
      
      await auctionContract.connect(addr1).createBid(1, requestTokens, {value: ethers.utils.parseEther(cost)});
      // await expect(auctionContract.connect(addr1).createBid(1, 10)).to.not.be.revertedWith('Auction Owner cannot make a bid');
      
      let auctionDetails = await auctionContract.auctionDetails(1);
      let auctionData = transformAuctionDetails(auctionDetails);
      let totalTokens = auctionData.totalTokens;
      let remainingTokens = auctionData.remainingTokens;
      let totalAmount = parseFloat(auctionData.totalAmount);
      let reservedTokens = parseInt(await auctionContract.reservedTokens(addr1.address,1));
      let moneyDeposited = parseFloat(ethers.utils.formatEther(await auctionContract.moneyDeposited(addr1.address,1)));
      
      expect(moneyDeposited.toString()).to.be.equal(cost);
      expect(totalTokens - 10).to.be.equal(remainingTokens);
      expect(totalAmount - totalAmountBefore).to.be.equal(moneyDeposited);
      expect(reservedTokens).to.be.equal(requestTokens);

      // console.log("biddingPrice",auctionData.biddingPrice);
      // console.log("totalTokens",auctionData.totalTokens);
      // console.log("remainingTokens",auctionData.remainingTokens);
      // console.log("totalBids",auctionData.totalBids);
      // console.log("totalAmount",auctionData.totalAmount);
      // console.log("reservedTokens",(await auctionContract.reservedTokens(addr1.address,1)).toString());
      // console.log("moneyDeposited",ethers.utils.formatEther(await auctionContract.moneyDeposited(addr1.address,1)));

    });

    it("Should check bidIDList & biddersList details", async function () { 

      // console.log((await auctionContract.currentPrice(1)).toString());
      // console.log((await auctionContract.auctionDetails(1)).biddingPrice.toString());
      
      let bidID = (await auctionContract.bidIDList(addr1.address,1)).toNumber();
      let bidder = await auctionContract.biddersList(1,bidID);
      expect(bidder).to.be.equal(addr1.address);

      // console.log(addr1.address);
      // console.log((await auctionContract.bidIDList(addr1.address,1)).toNumber());
      // console.log((await auctionContract.biddersList(1,bidID)));
      

    });

    it("Should create 2nd Bid in Auction 1 with address 2 after increasing time & check bid details", async function () { 

      // INCREASE TIME AND MAKE BIDS
      // await ethers.provider.send('evm_increaseTime', [1800]);
      // await ethers.provider.send('evm_mine');
      

    });
    




  });


  

  


});
