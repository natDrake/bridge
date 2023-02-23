const { ethers, network } = require("hardhat");
var fs = require("fs");
require("dotenv").config();

let _forwarderDomain = "PolygonForwarder";
let _version = "0.0.1";

let encodedAbiData =
  "0x1e458bee0000000000000000000000009ce07ce5d47b371c641214c761334f87be7d518d00000000000000000000000000000000000000000000000000000000000003e880b6c704d5c61506b0210bfe8bd7e1ddb0b47df0e32bcdda6fe59ff8c0e3fbdd";

const chain1ForwarderAbi = "./artifacts/contracts/Forwarder.sol/Forwarder.json";
var abi = JSON.parse(fs.readFileSync(chain1ForwarderAbi));
//   console.log(abi.abi);

// async function eip712Signature() {
async function main() {
  //MUMBAI TESTNET PROVIDER
  let mumbaiProvider = new ethers.providers.JsonRpcProvider(
    process.env.MUMBAI_RPC_URL
  );

  //BSC TESTNET PROVIDER
  let bscProvider = new ethers.providers.JsonRpcProvider(
    process.env.BSC_TESTNET_RPC_URL
  );

  const forwarderInstance = new ethers.Contract(
    process.env.CHAIN_1_FORWARDER_CONTRACT,
    abi.abi,
    mumbaiProvider
  );

  let nonceVal = await forwarderInstance.getNonce(process.env.USER_ACCOUNT);
  console.log("nonceVal: ", nonceVal);

  // All properties on a domain are optional
  const domain = {
    name: _forwarderDomain,
    version: _version,
    chainId: process.env.CHAIN_1_ID,
    verifyingContract: process.env.CHAIN_1_FORWARDER_CONTRACT,
  };

  // The named list of all type definitions
  const types = {
    ForwardRequest: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "gas", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
  };

  // The data to sign
  const value = {
    from: process.env.USER_ACCOUNT,
    to: process.env.CHAIN_1_BRIDGE_CONTRACT,
    value: 0,
    gas: 5e9,
    nonce: nonceVal,
    data: encodedAbiData,
  };

  const userWallet = new ethers.Wallet(
    process.env.USER_PRIVATE_KEY,
    mumbaiProvider
  );

  const signature = await userWallet._signTypedData(domain, types, value);
  console.log(signature);
}

// module.exports = {
//   eip712Signature,
// };

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
