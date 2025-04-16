// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMoonToken is IERC20 {
    function initialize(uint256 cycle, address deployer) external;
    function mint(address to, uint256 amount) external;
}