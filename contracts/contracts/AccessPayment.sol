// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IERC20WithPermit is IERC20, IERC20Permit {}

contract AccessPayment is
    Initializable,
    OwnableUpgradeable,
    ERC2771ContextUpgradeable
{
    using SafeERC20 for IERC20WithPermit;
    using SafeERC20 for IERC20;

    // Constants from whitepaper
    uint256 public constant CYCLE_DURATION = 29.5 days;
    uint256 public constant LOCK_FRACTION = 90; // 90% locked
    uint256 public constant TREASURY_FRACTION = 10; // 10% to treasury
    uint256 public constant LOCK_CYCLES = 3;
    uint256 public constant MOON_PER_PAYMENT = 100;

    // State variables
    IERC20WithPermit public twoLatToken;
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
    event LockCreated(
        address indexed user,
        uint256 amount,
        uint256 unlockCycle
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(
        address _trustedForwarderAddress
    ) 

    ERC2771ContextUpgradeable(_trustedForwarderAddress) {
        _disableInitializers();
    }

    function initialize(
        address _twoLatToken,
        address _moonToken,
        address _treasury,
        address _lockManager,
        uint256 _initialAccessPrice
    ) public initializer {
        __Ownable_init(_msgSender());

        twoLatToken = IERC20WithPermit(_twoLatToken);
        moonToken = IERC20(_moonToken);
        treasury = _treasury;
        lockManager = _lockManager;
        accessPrice = _initialAccessPrice;

        currentCycleStart = block.timestamp;
        currentCycleEnd = currentCycleStart + CYCLE_DURATION;
    }

    // Override ERC2771Context functions
    function _msgSender()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    function _msgData()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return ERC2771ContextUpgradeable._msgData();
    }

    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return ERC2771ContextUpgradeable._contextSuffixLength();
    }

    // Basic getters
    function getCurrentCycle() public view returns (uint256) {
        return (block.timestamp - currentCycleStart) / CYCLE_DURATION;
    }

    function isCycleActive() public view returns (bool) {
        return block.timestamp < currentCycleEnd;
    }

    // Access payment functions
    function payAccess() external {
        address sender = _msgSender();
        require(isCycleActive(), "Cycle not active");

        // Transfer tokens from user to contract
        twoLatToken.safeTransferFrom(sender, address(this), accessPrice);

        // Calculate amounts for treasury and lock
        uint256 treasuryAmount = (accessPrice * TREASURY_FRACTION) / 100;
        uint256 lockAmount = accessPrice - treasuryAmount;

        // Transfer to treasury
        twoLatToken.safeTransfer(treasury, treasuryAmount);
        emit TreasuryNotified(sender, treasuryAmount);

        // Create lock
        twoLatToken.safeTransfer(lockManager, lockAmount);
        emit LockCreated(sender, lockAmount, getCurrentCycle() + LOCK_CYCLES);

        // Issue MOON tokens
        moonToken.safeTransfer(sender, MOON_PER_PAYMENT);

        emit AccessPaid(sender, accessPrice, getCurrentCycle());
    }

    function payAccessWithPermit(
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        address sender = _msgSender();
        require(isCycleActive(), "Cycle not active");

        // Approve tokens using permit
        twoLatToken.permit(
            sender,
            address(this),
            accessPrice,
            deadline,
            v,
            r,
            s
        );

        // Transfer tokens from user to contract
        twoLatToken.safeTransferFrom(sender, address(this), accessPrice);

        // Calculate amounts for treasury and lock
        uint256 treasuryAmount = (accessPrice * TREASURY_FRACTION) / 100;
        uint256 lockAmount = accessPrice - treasuryAmount;

        // Transfer to treasury
        twoLatToken.safeTransfer(treasury, treasuryAmount);
        emit TreasuryNotified(sender, treasuryAmount);

        // Create lock
        twoLatToken.safeTransfer(lockManager, lockAmount);
        emit LockCreated(sender, lockAmount, getCurrentCycle() + LOCK_CYCLES);

        // Issue MOON tokens
        moonToken.safeTransfer(sender, MOON_PER_PAYMENT);

        emit AccessPaid(sender, accessPrice, getCurrentCycle());
    }

    // Admin functions for cycle management
    function startNewCycle() external onlyOwner {
        require(!isCycleActive(), "Cycle still active");
        currentCycleStart = block.timestamp;
        currentCycleEnd = currentCycleStart + CYCLE_DURATION;
    }

    function extendCurrentCycle(uint256 additionalTime) external onlyOwner {
        require(isCycleActive(), "Cycle not active");
        currentCycleEnd += additionalTime;
    }

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
