// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract LockManager is Initializable, OwnableUpgradeable, EIP712Upgradeable {
    using SafeERC20 for IERC20;

    // Constants from whitepaper
    uint256 public constant CYCLE_DURATION = 29.5 days;
    uint256 public constant LOCK_CYCLES = 3;

    // State variables
    IERC20 public twoLatToken;
    address public accessPayment;

    // Lock tracking
    struct Lock {
        uint256 amount;
        uint256 unlockCycle;
        bool claimed;
    }

    mapping(address => Lock[]) public userLocks;
    mapping(uint256 => uint256) public cycleTotalLocks; // cycle => total locked amount

    // Events
    event LockCreated(address indexed user, uint256 amount, uint256 unlockCycle);
    event LockClaimed(address indexed user, uint256 amount, uint256 cycle);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _twoLatToken,
        address _accessPayment
    ) public initializer {
        __Ownable_init(msg.sender);
        __EIP712_init("LockManager", "1");

        twoLatToken = IERC20(_twoLatToken);
        accessPayment = _accessPayment;
    }

    // Core functions will be implemented here
    // - createLock
    // - claimLock
    // - getLockedAmount

    // Admin functions
    function setAccessPayment(address _newAccessPayment) external onlyOwner {
        accessPayment = _newAccessPayment;
    }

    // View functions
    function getUserLocks(address user) external view returns (Lock[] memory) {
        return userLocks[user];
    }

    function getCycleLocks(uint256 cycle) external view returns (uint256) {
        return cycleTotalLocks[cycle];
    }
} 