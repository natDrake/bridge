const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { BigNumber, ethers } = require("hardhat");

describe("Bridging Contract", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const ONE_GWEI = 1_000_000_000;
    let tokenName1 = "BSC Token";
    let tokenSymbol1 = "BTK";

    let _forwarderDomain = "BSCForwarder";
    let _version = "0.0.1";

    console.log(tokenName1);
    console.log(networkName);

    // let tokenSupply = ethers.BigNumber.from(10000); //keeping initial supply of stake token as 10,000
    // console.log(tokenSupply);

    // Contracts are deployed using the first signer/account by default
    const [owner, user] = await ethers.getSigners();

    //deploy forwarder contract
    const ForwarderContract = await ethers.getContractFactory("Forwarder");
    const forwarder = await ForwarderContract.deploy(
      _forwarderDomain,
      _version
    );
    console.log(`Forwarder contract deployed at: ${forwarder.address}`);

    // deploy token contract
    const TokenContract = await ethers.getContractFactory("Token");
    const tokenContract = await TokenContract.deploy(tokenName1, tokenSymbol1);
    console.log(
      `Token: ${tokenSymbol1} contract deployed at: ${tokenContract.address} on ${networkName} network`
    );

    //deploy bridge contract
    const BridgeContract = await ethers.getContractFactory("Bridge");
    const bridgeContract = await BridgeContract.deploy(
      forwarder.address,
      tokenContract.address
    );
    console.log(`Bridge contract deployed at: ${bridgeContract.address}`);

    return {
      forwarder,
      tokenContract,
      bridgeContract,
      owner,
      user,
    };
  }

  describe("Deployment", function () {
    it("Should deploy stake contract and owner should have 10000 stake tokens", async function () {
      const { stakeContract, owner, staker1, staker2 } = await loadFixture(
        deployFixture
      );
      console.log(`Stake token contract deployed at: ${stakeContract.address}`);

      let ownerBalance = await stakeContract.balanceOf(owner.address);
      console.log("Owner balance of stake tokens: ", ownerBalance);
      expect(ownerBalance).to.equal("10000");
    });
    it("Staker1 and staker2 should be able to create stake of 1000 STK", async function () {
      const { stakeContract, owner, staker1, staker2 } = await loadFixture(
        deployFixture
      );
      console.log(`Stake token contract deployed at: ${stakeContract.address}`);

      await stakeContract.transfer(
        staker1.address,
        ethers.BigNumber.from(1000)
      );
      let staker1Balance = await stakeContract.balanceOf(staker1.address);
      console.log("Staker1 balance of stake tokens: ", staker1Balance);
      expect(staker1Balance).to.equal("1000");

      await stakeContract.transfer(
        staker2.address,
        ethers.BigNumber.from(1000)
      );
      let staker2Balance = await stakeContract.balanceOf(staker2.address);
      console.log("Staker2 balance of stake tokens: ", staker2Balance);
      expect(staker2Balance).to.equal("1000");

      let ownerBalance = await stakeContract.balanceOf(owner.address);
      console.log("Owner balance of stake tokens: ", ownerBalance);
      expect(ownerBalance).to.equal("8000");

      await stakeContract.connect(staker1).createStake(1000);
      let staker1StakeBalance = await stakeContract.stakeOf(staker1.address);
      console.log(`Stake balance of staker1: ${staker1Balance}`);
      staker1Balance = await stakeContract.balanceOf(staker1.address);
      console.log("Staker1 balance of stake tokens: ", staker1Balance);
      expect(staker1StakeBalance).to.equal("1000");

      await stakeContract.connect(staker2).createStake(1000);
      let staker2StakeBalance = await stakeContract.stakeOf(staker2.address);
      console.log(`Stake balance of staker2: ${staker2Balance}`);
      expect(staker2StakeBalance).to.equal("1000");
    });
    it("Staker1 should not be able to create stake of 1000 STK as it has no STK tokens", async function () {
      const { stakeContract, staker1 } = await loadFixture(deployFixture);
      console.log(`Stake token contract deployed at: ${stakeContract.address}`);

      await expect(
        stakeContract.connect(staker1).createStake(1000)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
    it("Staker1 should not be able to create stake of 1000 STK as staking contract is paused", async function () {
      const { stakeContract, owner, staker1 } = await loadFixture(
        deployFixture
      );
      console.log(`Stake token contract deployed at: ${stakeContract.address}`);

      await stakeContract.pause();

      await expect(
        stakeContract.connect(staker1).createStake(1000)
      ).to.be.revertedWith("Pausable: paused");
    });
    it("Staker1 should be able to get reward estimate of 10STK On staking 1000 STK", async function () {
      const { stakeContract, owner, staker1, staker2 } = await loadFixture(
        deployFixture
      );
      console.log(`Stake token contract deployed at: ${stakeContract.address}`);

      await stakeContract.transfer(
        staker1.address,
        ethers.BigNumber.from(1000)
      );
      let staker1Balance = await stakeContract.balanceOf(staker1.address);
      console.log("Staker1 balance of stake tokens: ", staker1Balance);
      expect(staker1Balance).to.equal("1000");

      let ownerBalance = await stakeContract.balanceOf(owner.address);
      console.log("Owner balance of stake tokens: ", ownerBalance);
      expect(ownerBalance).to.equal("9000");

      await stakeContract.connect(staker1).createStake(1000);
      let staker1StakeBalance = await stakeContract.stakeOf(staker1.address);
      console.log(`Stake balance of staker1: ${staker1Balance}`);
      staker1Balance = await stakeContract.balanceOf(staker1.address);
      console.log("Staker1 balance of stake tokens: ", staker1Balance);
      expect(staker1StakeBalance).to.equal("1000");

      let reward = await stakeContract.calculateReward(staker1.address);
      console.log(`staker1 rewards: ${reward}`);
      expect(reward).to.equal(10);
    });
    it("Staker1 and staker2 should be able to withdraw reward of 10 STK after staking period ends", async function () {
      const { stakeContract, owner, staker1, staker2 } = await loadFixture(
        deployFixture
      );
      console.log(`Stake token contract deployed at: ${stakeContract.address}`);

      await stakeContract.transfer(
        staker1.address,
        ethers.BigNumber.from(1000)
      );
      let staker1Balance = await stakeContract.balanceOf(staker1.address);
      console.log("Staker1 balance of stake tokens: ", staker1Balance);
      expect(staker1Balance).to.equal("1000");

      await stakeContract.transfer(
        staker2.address,
        ethers.BigNumber.from(1000)
      );
      let staker2Balance = await stakeContract.balanceOf(staker2.address);
      console.log("Staker2 balance of stake tokens: ", staker2Balance);
      expect(staker2Balance).to.equal("1000");

      let ownerBalance = await stakeContract.balanceOf(owner.address);
      console.log("Owner balance of stake tokens: ", ownerBalance);
      expect(ownerBalance).to.equal("8000");

      await stakeContract.connect(staker1).createStake(1000);
      let staker1StakeBalance = await stakeContract.stakeOf(staker1.address);
      console.log(`Stake balance of staker1: ${staker1Balance}`);
      staker1Balance = await stakeContract.balanceOf(staker1.address);
      console.log("Staker1 balance of stake tokens: ", staker1Balance);
      expect(staker1StakeBalance).to.equal("1000");

      await stakeContract.connect(staker2).createStake(1000);
      let staker2StakeBalance = await stakeContract.stakeOf(staker2.address);
      console.log(`Stake balance of staker2: ${staker2Balance}`);
      expect(staker2StakeBalance).to.equal("1000");

      await stakeContract.pause();
      await stakeContract.distributeRewards();
      await stakeContract.unpause();

      expect(await stakeContract.rewardOf(staker1.address)).to.equal("10");
      await stakeContract.connect(staker1).withdrawReward();
      let staker1FinalBalance = await stakeContract.balanceOf(staker1.address);
      console.log(`staker1 final balance: ${staker1FinalBalance}`);
      expect(staker1FinalBalance).to.equal("10");
      expect(await stakeContract.rewardOf(staker1.address)).to.equal("0");

      expect(await stakeContract.rewardOf(staker2.address)).to.equal("10");
      await stakeContract.connect(staker2).withdrawReward();
      let staker2FinalBalance = await stakeContract.balanceOf(staker2.address);
      console.log(`staker1 final balance: ${staker2FinalBalance}`);
      expect(staker2FinalBalance).to.equal("10");
      expect(await stakeContract.rewardOf(staker2.address)).to.equal("0");
    });
  });
});
