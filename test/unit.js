const { expect } = require("chai");
const { ethers } = require("hardhat");
const { assert } = require("console");
const { BigNumber } = require("ethers");
const provider = waffle.provider;
//const bre = require("@nomiclabs/buidler");


const transformAuctionDetails = (auctionData) => {
  return {
    startDate: auctionData.startDate.toNumber(),
    endDate: auctionData.endDate.toNumber(),
    startPrice: ethers.utils.formatEther(auctionData.startPrice),
    reservePrice: ethers.utils.formatEther(auctionData.reservePrice),
    totalTokens: auctionData.totalTokens.toNumber(),
    remainingTokens: auctionData.remainingTokens.toNumber(),
    token: auctionData.token.toString(),
     
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

  it("Should create custom tokens", async function () { 
    let decimals = await token12.decimals();
    let obs_minted_tokens = (await token12.balanceOf(owner.address)) / 10**decimals; 
    console.log(obs_minted_tokens);
    
  });


  it("Should create auction with the custom tokens", async function () {

    //console.log(token12.address);
    await token12.connect(owner).approve(auctionContract.address, 1000);
    
    await auctionContract.connect(owner).createAuction(
      Math.floor(Date.now() / 1000 + 3600),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("0.5"),
      500,
      token12.address
    );

    console.log((await auctionContract.totalAuctions()).toString());
    await token12.connect(owner).transfer(addr1.address, 400);
    await token12.connect(addr1).approve(auctionContract.address, 400);

    await auctionContract.connect(addr1).createAuction(
      Math.floor(Date.now() / 1000 + 3600),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("0.5"),
      400,
      token12.address
    );

    
  });


  it("Should check auction details", async function () { 
    
    let auctionDetails = await auctionContract.auctionDetails(1);
    let result = transformAuctionDetails(auctionDetails);
    console.log(result);

    let auctionDetails2 = await auctionContract.auctionDetails(2);
    let result2 = transformAuctionDetails(auctionDetails2);
    console.log(result2);


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
