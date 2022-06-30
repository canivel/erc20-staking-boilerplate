import React, { useState, useEffect } from "react";
import { Button, Paper, Stack, Typography } from "@mui/material";
import ResponsiveAppBar from "./ResponsiveAppBar";
import Web3 from "web3/dist/web3.min.js";

import CloudCoin from "../abis/CloudCoin.json";
import LiteCloudCoin from "../abis/LiteCloudCoin.json";
import CloudBank from "../abis/CloudBank.json";
import Main from "./Main";

function App() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [address, setAddress] = useState("0x0");
  const [balance, setBalance] = useState(0);
  const [web3, setWeb3] = useState();
  const [cloudCoin, setCloudCoin] = useState({});
  const [cloudCoinBalance, setCloudCoinBalance] = useState(0);
  const [liteCloudCoin, setLiteCloudCoin] = useState({});
  const [liteCloudCoinBalance, setLiteCloudCoinBalance] = useState(0);
  const [cloudBank, setCloudBank] = useState({});
  const [stakingBalance, setStakingBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask");
    } else {
      setWeb3(new Web3(ethereum));
      console.log("Wallet installed let's proceed!");
    }
  };

  // invoke to connect to wallet account
  const connectHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask");
    }
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        await loadBlockchainData(accounts[0]);
      }
    } catch (err) {
      console.log("user did not add account...", err);
    }
  };

  const loadBlockchainData = async (addr) => {
    setLoading(true);
    const balance = await web3.eth.getBalance(addr);
    setBalance(web3.utils.fromWei(balance, "ether"));
    const netId = await web3.eth.net.getId();

    //Load CloudCoin Data
    const ccData = CloudCoin.networks[netId];
    if (ccData) {
      const cc = new web3.eth.Contract(CloudCoin.abi, ccData.address);
      setCloudCoin(cc);
      let ccBalance = await cc.methods.balanceOf(addr).call();
      setCloudCoinBalance(web3.utils.fromWei(ccBalance.toString(), "ether"));
    } else {
      alert(
        "Error: Cloud Coin Contract not detected in the network connected in Metamask"
      );
    }

    //Load Reward LiteCloudCoin Data
    const lccData = LiteCloudCoin.networks[netId];
    if (lccData) {
      const lcc = new web3.eth.Contract(LiteCloudCoin.abi, lccData.address);
      setLiteCloudCoin(lcc);
      let lccBalance = await lcc.methods.balanceOf(addr).call();
      setLiteCloudCoinBalance(lccBalance.toString());
    } else {
      alert(
        "Error: Lite Cloud Coin Contract not detected in the network connected in Metamask"
      );
    }

    //Load CloudBank Data
    const bankData = CloudBank.networks[netId];
    if (bankData) {
      const bank = new web3.eth.Contract(CloudBank.abi, bankData.address);
      setCloudBank(bank);
      let stakingBalance = await bank.methods.stakingBalance(addr).call();
      setStakingBalance(stakingBalance.toString());
    } else {
      alert(
        "Error: Cloud Bank Contract not detected in the network connected in Metamask"
      );
    }
    setLoading(false);
  };

  const disconnectHandler = async () => {
    setAddress("0x0");
    setBalance(0);
    setCloudCoinBalance(0);
    setLiteCloudCoinBalance(0);
    setStakingBalance(0);
  };

  //Staking
  /*
      - Approve tokens
      - depositeTokens

    */

  const stakeTokens = async (amount) => {
    setLoading(true);
    await cloudCoin.methods
      .approve(cloudBank._address, amount)
      .send({ from: address })
      .on("transactionHash", (hash) => {
        setLoading(false);
      });
    await cloudBank.methods
      .depositTokens(amount)
      .send({ from: address })
      .on("transactionHash", (hash) => {
        setLoading(false);
      });
    setLoading(false);
  };

  const unstakeTokens = async () => {
    setLoading(true);
    await cloudBank.methods
      .unstakeTokens()
      .send({ from: address })
      .on("transactionHash", (hash) => {
        setLoading(false);
      });
    setLoading(false);
  };

  return (
    <>
      <ResponsiveAppBar address={address} balance={balance} />
      <Paper elevation={3} sx={{ p: 3 }}>
        {loading ? (
          <Typography variant="h6">Loading</Typography>
        ) : (
          <Main
            loading={loading}
            address={address}
            balance={balance}
            cloudCoinBalance={cloudCoinBalance}
            liteCloudCoinBalance={liteCloudCoinBalance}
            stakingBalance={stakingBalance}
            stakeTokens={stakeTokens}
            unstakeTokens={unstakeTokens}
            web3={web3}
          />
        )}
        {address === "0x0" ? (
          <Button onClick={connectHandler} variant="contained" color="success">
            Connect Wallet
          </Button>
        ) : (
          <Button onClick={disconnectHandler} variant="contained" color="error">
            Disconnect Wallet
          </Button>
        )}
      </Paper>
    </>
  );
}

export default App;
