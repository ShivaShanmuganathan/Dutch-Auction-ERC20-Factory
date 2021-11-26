# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:
FUNCTION TO BE TESTED:

- MINT TOKENS & CHECK OWNER BALANCE
- CREATE AUCTION 
  - APPROVE TOKENS & CREATE 2 AUCTIONS
    - first auction has limited tokens and long enddate
    - second auction has many tokens and short enddate
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
    - ONE WITH REMAINING TOKENS BUT PAST ENDDATE
      - check if auction has remaining tokens
      - check if erc20 has been transferred from smart contract
      - check if erc20 has been transferred to respective account
      - check if refund eth has been transferred from smart contract
      - check if refund eth has been transferred to respective account
      - check if owner receives the balance erc20
      - check if owner receives the balance eth
      - check if auction is complete
- CHECK TIME

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
