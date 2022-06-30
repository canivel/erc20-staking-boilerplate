const CloudCoin = artifacts.require("CloudCoin");
const LiteCloudCoin = artifacts.require("LiteCloudCoin");
const CloudBank = artifacts.require("CloudBank");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(CloudCoin);
  const cc = await CloudCoin.deployed();
  await deployer.deploy(LiteCloudCoin);
  const lcc = await LiteCloudCoin.deployed();
  await deployer.deploy(CloudBank, lcc.address, cc.address);
  const cb = await CloudBank.deployed();

  // TRansfer all LiteCloudCoin tokens to the Bank
  await lcc.transfer(cb.address, "1000000000000000000000000");

  // TRansfer 100  CloudCoin tokens to the Second account
  await cc.transfer(accounts[1], "1000000000000000000000");
};
