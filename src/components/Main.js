import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { Button, Stack, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

function Main(props) {
  const [transactionAmount, setTransactionAmount] = useState("");

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));

  const onAmountChange = (e) => {
    setTransactionAmount(e.target.value);
  };
  const handleDeposit = () => {
    let amount = props.web3.utils.toWei(transactionAmount, "Ether");
    console.log(props.cloudCoinBalance, transactionAmount);
    if (props.cloudCoinBalance < transactionAmount) {
      alert("You dont have that unstake");
    } else {
      props.stakeTokens(amount);
    }
  };
  const handleWithdraw = () => {
    if (props.stakingBalance === 0) {
      alert("You dont have anything stake to unstake");
    } else {
      props.unstakeTokens();
    }
  };

  return (
    <>
      {!props.loading && props.address !== "0x0" ? (
        <>
          <Grid container spacing={2} rowSpacing={1}>
            <Grid item xs={3}>
              <Item>
                <Typography variant="h8">Staking Balance</Typography>
              </Item>
            </Grid>
            <Grid item xs={3}>
              <Item>
                <Typography variant="h8">Lite Cloud Balance</Typography>
              </Item>
            </Grid>
            <Grid item xs={3}>
              <Item>
                <Typography variant="h8">Cloud Coin Balance</Typography>
              </Item>
            </Grid>
            <Grid item xs={3}>
              <Item>
                <Typography variant="h8">ETH Balance</Typography>
              </Item>
            </Grid>
            <Grid item xs={3}>
              <Item>
                <Typography variant="h6">{props.stakingBalance} CC</Typography>
              </Item>
            </Grid>
            <Grid item xs={3}>
              <Item>
                <Typography variant="h6">
                  {props.liteCloudCoinBalance} LCC
                </Typography>
              </Item>
            </Grid>
            <Grid item xs={3}>
              <Item>
                <Typography variant="h6">
                  {props.cloudCoinBalance} CC
                </Typography>
              </Item>
            </Grid>
            <Grid item xs={3}>
              <Item>
                <Typography variant="h6">{props.balance} LCC</Typography>
              </Item>
            </Grid>
            <Grid item xs={6}>
              <Grid item xs={3}>
                <Box
                  component="form"
                  sx={{
                    "& > :not(style)": { m: 1, width: "25ch" },
                  }}
                  noValidate
                  autoComplete="off"
                >
                  <TextField
                    id="transactionAmount"
                    onChange={onAmountChange}
                    label="Amount"
                    variant="filled"
                  />
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Button
                  onClick={handleDeposit}
                  variant="contained"
                  color="success"
                >
                  Stake
                </Button>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Button
                onClick={handleWithdraw}
                variant="contained"
                color="warning"
              >
                Unstake All
              </Button>
            </Grid>
          </Grid>
          <Stack spacing={2}>
            <Typography variant="h6">
              Balance: {props.balance} {props.balance ? "ETH" : null}
            </Typography>
            <Typography variant="h6">
              Balance Cloud Coin: {props.cloudCoinBalance}{" "}
              {props.cloudCoinBalance ? "CC" : null}
            </Typography>
          </Stack>
        </>
      ) : (
        <></>
      )}
    </>
  );
}

export default Main;
