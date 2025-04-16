// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

contract MinimalForwarder is ERC2771Forwarder {
    constructor() ERC2771Forwarder("Second Latitude Forwarder") {}
}