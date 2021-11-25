const { expect } = require("chai");
const { ethers } = require("hardhat");
const { assert } = require("console");
const { BigNumber } = require("ethers");
const provider = waffle.provider;




const transformAuctionDetails = (auctionData) => {
  return {
    
    startDate: auctionData.startDate.toNumber(),
    endDate: auctionData.endDate.toNumber(),
    startPrice: ethers.utils.formatEther(auctionData.startPrice),
    reservePrice: ethers.utils.formatEther(auctionData.reservePrice),
    biddingPrice: ethers.utils.formatEther(auctionData.biddingPrice),
    totalTokens: auctionData.totalTokens.toNumber(),
    remainingTokens: auctionData.remainingTokens.toNumber(),
    totalBids: auctionData.totalBids.toNumber(),
    totalAmount: auctionData.totalAmount.toNumber(),
    token: auctionData.token.toString(),
    auctionComplete: auctionData.auctionComplete,
         
  };
};

describe("DutchAuction", function () {

  let owner, addr1, addr2;

  
  before(async function () {

    [owner, addr1, addr2] = await ethers.getSigners();          
    const Token = await ethers.getContractFactory('Token', owner);
    token12 = await Token.deploy();

    // let decimals = await token.decimals();
    // let obs_minted_tokens = (await token.balanceOf(owner.address)) / 10**decimals; 
    // console.log(obs_minted_tokens);
    
    DutchAuction = await ethers.getContractFactory('DutchAuction', owner);
    auctionContract = await DutchAuction.deploy();
    await auctionContract.deployed();

  });

  describe("Minting Local Tokens", function () { 

    it("Should mint tokens and check owner balance", async function () { 

      let decimals = await token12.decimals();
      let minted_tokens = (await token12.balanceOf(owner.address)) / 10**decimals; 
      expect(minted_tokens).to.be.equal(1000000);
      
    });

  });
  
  describe("CREATE AUCTION ()", function () { 

    it("Should create auction with the approved tokens", async function () {

      // first auction has limited tokens and long enddate
      await token12.connect(owner).approve(auctionContract.address, 200);
      await auctionContract.connect(owner).createAuction(
        Math.floor(Date.now() / 1000 + 3600),
        ethers.utils.parseEther("1"),
        ethers.utils.parseEther("0.5"),
        200,
        token12.address
      );
  
      // second auction has many tokens and short enddate
      await token12.connect(owner).transfer(addr1.address, 800);
      await token12.connect(addr1).approve(auctionContract.address, 800);
      await auctionContract.connect(addr1).createAuction(
        Math.floor(Date.now() / 1000 + 1800),
        ethers.utils.parseEther("1"),
        ethers.utils.parseEther("0.5"),
        800,
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
      expect(result.totalTokens).to.be.equal(200);
      expect(result.remainingTokens).to.be.equal(200);
      expect(result.totalBids).to.be.equal(0);
      expect(result.totalAmount).to.be.equal(0);
      expect(result.token).to.be.equal(token12.address);
      expect(result.auctionComplete).to.be.false;

      let auctionDetails2 = await auctionContract.auctionDetails(2);
      let result2 = transformAuctionDetails(auctionDetails2);
      console.log(result2);
      expect(result2.endDate - result2.startDate).to.be.at.most(1800);
      expect(result2.startPrice).to.be.equal('1.0');
      expect(result2.biddingPrice).to.be.equal('1.0');
      expect(result2.reservePrice).to.be.equal('0.5');
      expect(result2.totalTokens).to.be.equal(800);
      expect(result2.remainingTokens).to.be.equal(800);
      expect(result2.totalBids).to.be.equal(0);
      expect(result2.totalAmount).to.be.equal(0);
      expect(result2.token).to.be.equal(token12.address);
      expect(result2.auctionComplete).to.be.false;
  
    });

    it("Should check auction owner and auction ID", async function () { 

      let auctionID = (await auctionContract.auctionOwner(owner.address)).toNumber();
      expect(auctionID).to.equal(1);

      let auctionID2 = (await auctionContract.auctionOwner(addr1.address)).toNumber();
      expect(auctionID2).to.equal(2);

      let auctionID3 = (await auctionContract.auctionOwner(addr2.address)).toNumber();
      expect(auctionID3).to.equal(0);
      
    });

    
    it("Should check contract balance for erc20 tokens", async function () { 
      
      let contract_token_balance = (await token12.balanceOf(auctionContract.address)) ; 
      console.log(contract_token_balance.toNumber());
      // let decimals = await token12.decimals();
      let minted_tokens = (await token12.balanceOf(owner.address)); 
      console.log(minted_tokens.toString());

    });
  
    it("Should check decrease in auction price", async function () { 
  
      
      console.log((await auctionContract.currentPrice(1)).toString());
      const timeNow = (await auctionContract.checkTime()).toNumber();
      console.log(timeNow);
      
      await ethers.provider.send('evm_increaseTime', [1800]);
      await ethers.provider.send('evm_mine');
      console.log((await auctionContract.currentPrice(1)).toString());
      await ethers.provider.send('evm_increaseTime', [900]);
      await ethers.provider.send('evm_mine');
      console.log((await auctionContract.currentPrice(1)).toString());
      console.log((await auctionContract.currentPrice(2)).toString());
  
      // await ethers.provider.send('evm_setNextBlockTimestamp', [timeNow + 3600]);
      // await ethers.provider.send('evm_mine');
      // console.log((await auctionContract.checkTime()).toString());
      // console.log(ethers.utils.formatEther(await auctionContract.currentPrice(1)));
  
  
    });
  
    it("Should check reserve price", async function () { 
  
      // console.log((await auctionContract.checkTime()).toString());
      // console.log((await auctionContract.currentPrice(1)).toString());
      // await ethers.provider.send('evm_increaseTime', [176]);
      // await ethers.provider.send('evm_mine');
      // console.log((await auctionContract.checkTime()).toString());
      // console.log((await auctionContract.currentPrice(1)).toString());
      
    });
  

  });


  

  


});
