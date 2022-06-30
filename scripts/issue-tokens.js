const CloudBank = artifacts.require("CloudBank");

module.exports = async function issueRewards(callback) {
  let bank = await CloudBank.deployed();
  await bank.issueTokens();
  console.log("Tokens have been issued successfully");
  callback();
};
