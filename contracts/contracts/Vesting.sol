// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/finance/VestingWallet.sol";

contract Vesting is VestingWallet {
    constructor(address beneficiary, uint64 start, uint64 duration)
        VestingWallet(beneficiary, start, duration)
    {}
}
