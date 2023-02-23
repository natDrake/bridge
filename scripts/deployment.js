const { ethers, network } = require("hardhat");

require("dotenv").config();

async function main() {
  console.log(`Deployment to ${network.name} network STARTED`);
  if (await deployToNetwork(network.name)) {
    console.log(`Deployment to ${network.name} network FINISHED`);
  } else {
    console.log(`Deployment to ${network.name} network FAILED`);
  }
}

const deployToNetwork = async (networkName) => {
  let tokenName1 = "Polygon Token";
  let tokenSymbol1 = "PTK";

  let _forwarderDomain = "PolygonForwarder";
  let _version = "0.0.1";

  console.log(tokenName1);
  console.log(networkName);

  // let tokenSupply = ethers.BigNumber.from(10000); //keeping initial supply of stake token as 10,000
  // console.log(tokenSupply);

  // Contracts are deployed using the first signer/account by default
  const [owner] = await ethers.getSigners();

  //deploy forwarder contract
  const ForwarderContract = await ethers.getContractFactory("Forwarder");
  const forwarder = await ForwarderContract.deploy(_forwarderDomain, _version);
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

  return true;
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
