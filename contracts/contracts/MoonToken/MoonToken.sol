// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

/**
 * @title MoonToken
 * @dev Simple ERC20 token for a specific cycle.
 * Non-transferable, mintable only by the contract deployer (AccessPayment).
 * Ownable is used here to restrict minting to the deployer.
 */
contract MoonToken is
    ERC2771ContextUpgradeable,
    ERC20Upgradeable,
    OwnableUpgradeable,
    ERC20BurnableUpgradeable
{
    error NonTransferable();

    uint256 public cycle;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _forwarder) ERC2771ContextUpgradeable(_forwarder) {
        _disableInitializers();
    }

    function initialize(
        uint256 _cycle,
        address _deployer
    ) public initializer {
        __ERC20_init(
            string(abi.encodePacked("Moon Cycle ", _toString(_cycle))),
            string(abi.encodePacked("MOON", _toString(_cycle)))
        );
        __Ownable_init(_deployer);
        cycle = _cycle;
    }

    function decimals() public pure override returns (uint8) {
        return 1;
    }

    /**
     * @notice Mints tokens to a specified address.
     * @dev Only the owner (AccessPayment contract) can call this.
     * @param to The address to mint tokens to.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Override to prevent transfers. Moon tokens are soulbound to the cycle.
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        if (from != address(0) && to != address(0)) {
            revert NonTransferable();
        }
        super._update(from, to, value);
    }

    /**
     * @dev Helper function to convert uint to string for token name/symbol.
     * Requires Solidity 0.8.0+.
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        // Base case
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Override ERC2771Context functions to allow for the forwarder to be used
    // This is necessary because the ERC2771Context is not a parent of the ERC20 contract
    function _msgSender()
        internal
        view
        override(ERC2771ContextUpgradeable, ContextUpgradeable)
        returns (address)
    {
        return super._msgSender();
    }

    function _msgData()
        internal
        view
        override(ERC2771ContextUpgradeable, ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    function _contextSuffixLength()
        internal
        view
        override(ERC2771ContextUpgradeable, ContextUpgradeable)
        returns (uint256)
    {
        return ERC2771ContextUpgradeable._contextSuffixLength();
    }
}
