const { ethers, network } = require("hardhat");
var fs = require("fs");
require("dotenv").config();

async function main() {
  //   const address = "0x1d9b166fec6e1828f18ed5c0692a01b0287912ef";
  //   const [operator] = await ethers.getSigners();
  //   const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  //   const simpleStorage = SimpleStorage.attach(address);
  //   const owner = await simpleStorage.owner();
  //   console.log(owner);
  // Load Contract
  const chain1TokenAbi = "./artifacts/contracts/Token.sol/Token.json";
  var abi = JSON.parse(fs.readFileSync(chain1TokenAbi));
  //   console.log(abi.abi);

  //MUMBAI TESTNET PROVIDER
  let mumbaiProvider = new ethers.providers.JsonRpcProvider(
    process.env.MUMBAI_RPC_URL
  );

  //BSC TESTNET PROVIDER
  let bscProvider = new ethers.providers.JsonRpcProvider(
    process.env.BSC_TESTNET_RPC_URL
  );

  const contractInstance = new ethers.Contract(
    process.env.CHAIN_1_TOKEN_CONTRACT,
    abi.abi,
    mumbaiProvider
  );

  let bridge_role = await contractInstance.BRIDGE_ROLE();
  let defaultAdmin = await contractInstance.DEFAULT_ADMIN_ROLE();
  console.log(bridge_role);
  console.log(defaultAdmin);

  let tokenName = await contractInstance.name();
  console.log(tokenName);
  let tokenSymbol = await contractInstance.symbol();
  console.log(tokenSymbol);

  //send tx using a signer account
  const adminWallet = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY,
    mumbaiProvider
  );
  console.log("Address: " + adminWallet.address);

  const txSigner = contractInstance.connect(adminWallet);
  const transaction = await txSigner.unpause();
  console.log(transaction);

  console.log(await txSigner.paused());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
