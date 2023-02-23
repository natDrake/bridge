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
  const chain1ForwarderAbi =
    "./artifacts/contracts/Forwarder.sol/Forwarder.json";
  var abi = JSON.parse(fs.readFileSync(chain1ForwarderAbi));

  const chain1BridgeAbi = "./artifacts/contracts/Bridge.sol/Bridge.json";
  var bridgeAbi = JSON.parse(fs.readFileSync(chain1BridgeAbi));

  const chain1TokenAbi = "./artifacts/contracts/Token.sol/Token.json";
  var tokenAbi = JSON.parse(fs.readFileSync(chain1TokenAbi));

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

  let bridgeInstance = new ethers.Contract(
    process.env.CHAIN_1_BRIDGE_CONTRACT,
    bridgeAbi.abi,
    mumbaiProvider
  );

  const tokenInstance = new ethers.Contract(
    process.env.CHAIN_1_TOKEN_CONTRACT,
    tokenAbi.abi,
    mumbaiProvider
  );

  const adminWallet = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY,
    mumbaiProvider
  );

  let tokenSigner = tokenInstance.connect(adminWallet);
  let bridgeRole = await tokenInstance.BRIDGE_ROLE();
  console.log("bridgeRole:", bridgeRole);
  await tokenSigner.grantRole(bridgeRole, process.env.CHAIN_1_BRIDGE_CONTRACT);
  console.log(
    await tokenInstance.hasRole(bridgeRole, process.env.CHAIN_1_BRIDGE_CONTRACT)
  );
  console.log(await tokenInstance.paused());
  console.log(await bridgeInstance.token());

  //send tx using a signer account(relayer)
  console.log("Address: " + adminWallet.address);

  const userWallet = new ethers.Wallet(
    process.env.USER_PRIVATE_KEY,
    mumbaiProvider
  );
  console.log("Address: " + userWallet.address);

  let nonceVal = await forwarderInstance.getNonce(process.env.USER_ACCOUNT);
  console.log("nonceVal: ", nonceVal);

  console.log(await bridgeInstance.trustedForwarder());
  let txid = ethers.utils.id("TX123");
  console.log(ethers.utils.parseEther("1000"));

  let bridgeInterface = new ethers.utils.Interface(bridgeAbi.abi);
  let encodedAbi = bridgeInterface.encodeFunctionData("mint", [
    process.env.USER_ACCOUNT,
    ethers.utils.parseEther("1000"),
    txid,
  ]);
  // let encodedAbi = bridgeInstance.interface.encodefunctiondata("mint", [
  //   process.env.USER_ACCOUNT,
  //   ethers.utils.parseEther("1000"),
  //   txid,
  // ]);
  console.log("encodedAbi:", encodedAbi);
  // SimpleStorage.interface.encodeDeploy([initialData]).slice(2);

  //create tx proposal
  let request = {
    from: process.env.USER_ACCOUNT,
    to: process.env.CHAIN_1_BRIDGE_CONTRACT,
    value: 0,
    gas: 5e9,
    nonce: nonceVal,
    data: encodedAbi,
  };
  console.log("request:", request);
  let txSigner = forwarderInstance.connect(adminWallet);
  let signature =
    "0x29fc1d1fe03c36a5defcde4cfe657beded6f0138ddf64f3932288d572f8bd30002a3939bd39c4ed187a98e8ea442d8d58ad9046d4a3b5708729668d825ce4ebb1c";
  let tx = await txSigner.execute(request, signature, { gasLimit: 300000 });
  // let tx = await userWallet.sendTransaction(request);

  console.log("tx:", tx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
