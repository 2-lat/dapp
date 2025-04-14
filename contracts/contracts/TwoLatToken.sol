// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TwoLatToken is ERC20, Ownable {
    constructor() ERC20("2LAT", "2LAT") Ownable(msg.sender) {
        // Mint total supply to the deployer
        _mint(msg.sender, 1_000_000_000 * 10 ** decimals());
    }
} 