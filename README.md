# Dutch Auction [Lifetime of Pot Auction]

Dutch Pot Auction
1. Any user can start an auction by depositing an ERC20 token to the Smart Contract
2. From a single user address, only one auction can be created.
3. Any user except the Auction Owner can participate in the auction. Multiple users need to participate in the auction to fill the pot.
4. In each auction, each user can only bid once.
5. Bid = Requested Number Of Tokens * Token Price at that time
6. The price of the erc20 token decreases linearly with time, until it reaches end time.
7. If auction goes past the end time, then `buying price = reserve price`
8. Auction can only be ended by Auction Owner.
9. Auction can only be ended after all tokens are reserved or after auction reaches end time.
10. At the end of auction, ERC20 tokens reserved to each bidder is sent to their address.
11. At the end of auction, if `user's buying price > last bidding price` for the ERC20 token, the extra Eth collected from bidders during bidding will be refunded.
12. At the end of auction, after distributing the refund Eth to bidders, remaining Eth is transferred to Auction Owner.
13. At the end of auction, if there are unreserved(unsold) ERC20 tokens, these tokens are sent back to Auction Owner
   
<br />

Tests Covering the Smart Contract

- MINT TOKENS & CHECK OWNER BALANCE
- CREATE AUCTION 
  - APPROVE TOKENS & CREATE 2 AUCTIONS
    - first auction has limited tokens and long enddate ---> it is ended before enddate, but all tokens are sold
    - second auction has many tokens and short enddate ---> it is ended after enddate, but has unsold tokens
  - check if auction is live
  - verify auction details
  - verify auctionOwner
  - check if erc20 tokens are transferred to contract
  - verify event
- TOTAL AUCTIONS
  - verify auctionID
- CURRENT PRICE
  - check if price decreases at intervals
  - check if price reaches reserve price after endDate
- CREATE BID
  - check if onlyNonAuctionOwners(_auctionID) can access this function
  - check if auction is live
  - check if bidder has any previous bids
  - check if auction has sufficient tokens for bidder
  - MAKE 4 BIDS
    - make 2 bids from 2 accounts to auction 1
    - make 2 bids from 2 accounts to auction 2
  - check if ether transferred is greater than bidding_price * amount
  - check if auctionDetails[_auctionID].totalAmount matches 
  - check if sender address is included in biddersList using bidIDList
  - verify event
- END AUCTION
  - check if onlyAuctionOwners can access this function
  - check if auction is live
  - END AUCTION
  - USE 2 AUCTIONS
    - ONE WITH NO REMAINING TOKENS 
      - check if refund eth has been transferred from smart contract
      - check if refund eth has been transferred to respective accounts
      - check if erc20 has been transferred from smart contract
      - check if erc20 has been transferred to respective accounts
      - check if owner receives the balance eth
      - check if auction is complete
    - ONE WITH REMAINING TOKENS BUT PAST ENDDATE - [PRICE = RESERVE PRICE, AFTER ENDDATE]
      - check if auction has remaining tokens
      - check if erc20 has been transferred from smart contract
      - check if erc20 has been transferred to respective account
      - check if refund eth has been transferred from smart contract
      - check if refund eth has been transferred to respective account
      - check if owner receives the balance erc20
      - check if owner receives the balance eth
      - check if auction is complete



Instructions To Run This Repo
```shell
git clone https://github.com/ShivaShanmuganathan/DutchAuction.git
```
```shell
npm install
```
```shell
npx hardhat --version
```
```shell
npx hardhat compile
```
```shell
npx hardhat test
```
