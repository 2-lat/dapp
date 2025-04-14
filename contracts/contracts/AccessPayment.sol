// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AccessPayment is Initializable, OwnableUpgradeable, EIP712Upgradeable {
    using SafeERC20 for IERC20;

    // Constants from whitepaper
    uint256 public constant CYCLE_DURATION = 29.5 days;
    uint256 public constant LOCK_FRACTION = 90; // 90% locked
    uint256 public constant TREASURY_FRACTION = 10; // 10% to treasury
    uint256 public constant LOCK_CYCLES = 3;
    uint256 public constant MOON_PER_PAYMENT = 100;

    // State variables
    IERC20 public twoLatToken;
    IERC20 public moonToken;
    address public treasury;
    address public lockManager;

    // Cycle tracking
    uint256 public currentCycleStart;
    uint256 public currentCycleEnd;
    uint256 public accessPrice;

    // Events
    event AccessPaid(address indexed user, uint256 amount, uint256 cycle);
    event TreasuryNotified(address indexed user, uint256 amount);
    event LockCreated(address indexed user, uint256 amount, uint256 unlockCycle);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _twoLatToken,
        address _moonToken,
        address _treasury,
        address _lockManager,
        uint256 _initialAccessPrice
    ) public initializer {
        __Ownable_init(msg.sender);
        __EIP712_init("AccessPayment", "1");

        twoLatToken = IERC20(_twoLatToken);
        moonToken = IERC20(_moonToken);
        treasury = _treasury;
        lockManager = _lockManager;
        accessPrice = _initialAccessPrice;

        currentCycleStart = block.timestamp;
        currentCycleEnd = currentCycleStart + CYCLE_DURATION;
    }

    // Basic getters
    function getCurrentCycle() public view returns (uint256) {
        return (block.timestamp - currentCycleStart) / CYCLE_DURATION;
    }

    function isCycleActive() public view returns (bool) {
        return block.timestamp < currentCycleEnd;
    }

    // Access payment functions will be implemented here
    // - payAccess
    // - payAccessWithPermit
    // - notifyTreasury
    // - createLock
    // - issueMoon

    // Admin functions
    function setAccessPrice(uint256 _newPrice) external onlyOwner {
        accessPrice = _newPrice;
    }

    function setTreasury(address _newTreasury) external onlyOwner {
        treasury = _newTreasury;
    }

    function setLockManager(address _newLockManager) external onlyOwner {
        lockManager = _newLockManager;
    }
} 