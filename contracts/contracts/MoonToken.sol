// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MoonToken is ERC20, Ownable {
    constructor() ERC20("MOON", "MOON") Ownable(msg.sender) {}

    // Override decimals to return 1
    function decimals() public pure override returns (uint8) {
        return 1;
    }

    // Override transfer functions to make token non-transferable
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        revert("MOON: token is non-transferable");
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        revert("MOON: token is non-transferable");
    }

    // Only owner can mint tokens
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Only owner can burn tokens
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
} 