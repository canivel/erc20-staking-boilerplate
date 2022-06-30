// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./CloudCoin.sol";
import "./LiteCloudCoin.sol";

contract CloudBank {
    string public name = "Cloud Bank";
    address public owner;
    CloudCoin public cloudcoin;
    LiteCloudCoin public litecloudcoin;

    address[] public stakers;

    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    event Staking(address indexed _from, uint256 _value);
    event Unstaking(address indexed _to, uint256 _value);

    constructor(CloudCoin _cc, LiteCloudCoin _lcc) {
        cloudcoin = _cc;
        litecloudcoin = _lcc;
        owner = msg.sender;
    }

    function depositTokens(uint256 _amount) public {
        // require(
        //     cloudcoin.balanceOf(msg.sender) >= _amount,
        //     "Balance lower then amount to deposit"
        // );
        require(_amount > 0, "Amount need to be > 0");
        //Transfer Cloud Coin to this contract address for staking
        cloudcoin.transferFrom(msg.sender, owner, _amount);
        // Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        //Update Staking Balance

        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;

        emit Staking(msg.sender, _amount);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "caller must be the owner");
        _;
    }

    //issue token

    function issueTokens() public onlyOwner {
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient] / 9; // divide by 9 to create percentage incentive, needs review
            if (balance > 0) {
                litecloudcoin.transfer(recipient, balance);
            }
        }
    }

    //unstake tokens
    function unstakeTokens() public {
        uint256 balance = stakingBalance[msg.sender];
        // require the amount to be greater than zero
        require(balance > 0, "staking balance cannot be less than zero");

        // transfer the tokens to the specified contract address from our bank
        //cloudcoin.transferFrom(owner, msg.sender, balance);
        cloudcoin.transfer(msg.sender, balance);

        // reset staking balance
        stakingBalance[msg.sender] = 0;

        // Update Staking Status
        isStaking[msg.sender] = false;

        emit Unstaking(msg.sender, stakingBalance[msg.sender]);
    }
}
