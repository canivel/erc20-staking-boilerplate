const { assert } = require("chai");

const CloudCoin = artifacts.require("CloudCoin");
const LiteCloudCoin = artifacts.require("LiteCloudCoin");
const CloudBank = artifacts.require("CloudBank");

require("chai").use(require("chai-as-promised")).should();

contract("CloudBank", (accounts) => {
  let cc, lcc;

  const tokens = (n) => {
    return web3.utils.toWei(n, "ether");
  };

  before(async () => {
    // Load contracts
    cc = await CloudCoin.new();
    lcc = await LiteCloudCoin.new();
    bank = await CloudBank.new(cc.address, lcc.address);

    // Transfer all tokens to the Bank(1mi)
    await lcc.transfer(bank.address, tokens("1000000"));

    // Transfer 100 CloudCoin to our investor
    await cc.transfer(accounts[1], tokens("100"), { from: accounts[0] });
  });

  describe("Mock Cloud Coin Deployment", async () => {
    it("matches CloudCoin name", async () => {
      const name = await cc.name();
      assert.equal(name, "Cloud Coin");
    });
    it("check customer 100 CloudCoin ", async () => {
      let result = await cc.balanceOf(accounts[1]);
      assert.equal(result, tokens("100"));
    });
  });

  describe("Mock Lite Cloud Coin Deployment", async () => {
    it("matches LiteCloudCoin name", async () => {
      const name = await lcc.name();
      assert.equal(name, "Lite Cloud Coin");
    });
  });

  describe("Mock Cloud Bank Deployment", async () => {
    it("matches LiteCloudCoin name", async () => {
      const name = await bank.name();
      assert.equal(name, "Cloud Bank");
    });

    it("contract has tokens", async () => {
      let balance = await new lcc.balanceOf(bank.address);
      assert.equal(balance, tokens("1000000"));
    });
  });

  describe("Yield Farming", async () => {
    it("reward LiteCloudCoin for staking", async () => {
      let result;
      result = await cc.balanceOf(accounts[1]);
      assert.equal(
        result.toString(),
        tokens("100"),
        "customer mock wallet balance before staking"
      );

      // Check staking for Customer(Approve and deposit)
      await cc.approve(bank.address, tokens("100"), { from: accounts[1] });
      await bank.depositTokens(tokens("100"), { from: accounts[1] });

      // Check customer updated balance
      result = await cc.balanceOf(accounts[1]);
      assert.equal(
        result.toString(),
        tokens("0"),
        "customer mock wallet after staking"
      );
    });

    it("is Customer staking 100", async () => {
      // Check bank updated balance
      result = await bank.stakingBalance(accounts[1]);
      assert.equal(
        result.toString(),
        tokens("100"),
        "customer staking at the bank is 100"
      );
    });

    it("is Customer is staking True", async () => {
      let result;
      result = await bank.isStaking(accounts[1]);
      assert.equal(result, true, "customer is staking");
    });

    it("is Customer has Staked True", async () => {
      let result;
      result = await bank.hasStaked(accounts[1]);
      assert.equal(result, true, "customer has staked");
    });

    it("Issue Tokens by Owner", async () => {
      await bank.issueTokens({ from: accounts[0] });
      let result;
      result = await lcc.balanceOf(accounts[1]);
      let rewardTokens = "11111111111111111111";
      assert.equal(
        result.toString(),
        rewardTokens.toString(),
        "issue tokens work"
      );
    });

    it("Reject Issue Tokens by Customer", async () => {
      await bank.issueTokens({ from: accounts[1] }).should.be.rejected;
    });

    it("Unstake token", async () => {
      await bank.unstakeTokens({ from: accounts[1] });

      result = await cc.balanceOf(accounts[1]);
      console.log(result.toString(), "Unstake Result");
      assert.equal(
        result.toString(),
        tokens("100"),
        "customer mock wallet balance after unstaking"
      );
    });
  });
});
