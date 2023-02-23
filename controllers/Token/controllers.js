const ethers = require("ethers");
const tokenAbi = require("./");
require("dotenv").config();

const chain1TokenAbi = "../../artifacts/contracts/Token.sol/Token.json";

//MUMBAI TESTNET PROVIDER
let mumbaiProvider = new ethers.providers.JsonRpcProvider(
  process.env.MUMBAI_RPC_URL
);

//BSC TESTNET PROVIDER
let bscProvider = new ethers.providers.JsonRpcProvider(
  process.env.BSC_TESTNET_RPC_URL
);

let mumbaiTokenContract = new ethers.Contract(
  process.env.CHAIN_1_TOKEN_CONTRACT,
  abi,
  mumbaiProvider
);

const contractInstance = await ethers.getContractAt(
  "contracts/Token.sol:Token",
  process.env.CHAIN_1_TOKEN_CONTRACT,
  mumbaiProvider
);

let bridge_role = await contractInstance.BRIDGE_ROLE;
console.log(bridge_role);

const pause = async function (req, res) {};

const unpause = async function (req, res) {};

module.exports = { pause, unpause };
