// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Treasury is Initializable, OwnableUpgradeable, EIP712Upgradeable {
    using SafeERC20 for IERC20;

    // State variables
    IERC20 public twoLatToken;
    address public accessPayment;

    // Treasury tracking
    uint256 public totalFunds;
    mapping(uint256 => uint256) public cycleFunds; // cycle => amount

    // Events
    event FundsReceived(address indexed from, uint256 amount, uint256 cycle);
    event FundsDistributed(address indexed to, uint256 amount, uint256 cycle);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _twoLatToken,
        address _accessPayment
    ) public initializer {
        __Ownable_init(msg.sender);
        __EIP712_init("Treasury", "1");

        twoLatToken = IERC20(_twoLatToken);
        accessPayment = _accessPayment;
    }

    // Core functions will be implemented here
    // - receiveFunds
    // - distributeFunds
    // - calculateQuadraticFunding

    // Admin functions
    function setAccessPayment(address _newAccessPayment) external onlyOwner {
        accessPayment = _newAccessPayment;
    }

    // View functions
    function getCycleFunds(uint256 cycle) external view returns (uint256) {
        return cycleFunds[cycle];
    }
} 