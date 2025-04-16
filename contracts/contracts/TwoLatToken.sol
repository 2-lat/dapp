// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC1363} from "@openzeppelin/contracts/token/ERC20/extensions/ERC1363.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

contract TwoLatToken is ERC2771Context, ERC20, ERC20Burnable, ERC1363, ERC20Permit {
    constructor(address forwarder) 
        ERC2771Context(forwarder)
        ERC20("2LAT", "2LAT") 
        ERC20Permit("2LAT")
    {
        // Mint total supply to the deployer
        _mint(msg.sender, 1_000_000_000 * 10 ** decimals());
    }

    // Override ERC2771Context functions to allow for the forwarder to be used
    // This is necessary because the ERC2771Context is not a parent of the ERC20 contract
    function _msgSender() internal view override(ERC2771Context, Context) returns (address) {
        return super._msgSender();
    }

    function _msgData() internal view override(ERC2771Context, Context) returns (bytes calldata) {
        return super._msgData();
    }

    function _contextSuffixLength() internal view override(ERC2771Context, Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
} 