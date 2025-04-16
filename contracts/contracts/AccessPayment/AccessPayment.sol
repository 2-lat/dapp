// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./mixins/ERC20LockingMixing.sol";
import "../MoonToken/IMoonToken.sol";

interface IERC20Burnable is IERC20 {
    function burn(uint256 amount) external;
}

contract AccessPayment is
    Initializable,
    OwnableUpgradeable,
    ERC2771ContextUpgradeable,
    ERC20LockingMixing
{
    using SafeERC20 for IERC20;
    using SafeERC20 for IERC20Burnable;
    using SafeERC20 for IMoonToken;

    error NotStarted();
    error CycleNotCreated(uint256 cycle);
    error CycleAlreadyCreated(uint256 cycle);

    error VestingNotCreated(address beneficiary, uint256 cycle);
    error VestingAlreadyCreated(address beneficiary, uint256 cycle);

    error AlreadyPaid();
    error NotPaidForNextCycle();

    event CycleCreated(uint256 indexed cycle, address moonTokenAddress, ProtocolConfig protocolConfig);
    event VestingCreated(address indexed beneficiary, uint256 indexed cycle, address vestingAddress);
    event TreasuryFunded(address indexed payer, uint256 amount, uint256 indexed cyclePaidFor);

    event MoonTokensMinted(address indexed recipient, address indexed moonToken, uint256 amount, uint256 indexed cyclePaidFor);
    
    uint256 public constant CYCLE_DURATION = 2548800; // 29.5 days in seconds

    struct ProtocolConfig {
        uint16 lockCycles;
        uint16 lockFraction;
        uint16 treasuryFraction;
        uint16 moonPerPayment;
        uint128 accessPrice;
    }

    struct Cycle {
        uint256 locked;
        IMoonToken moonToken;
        ProtocolConfig protocolConfig;
    }

    struct UserInCycle {
        uint32 lastCycleIndex;
        uint32 cyclesInRow;
    }

    ProtocolConfig public currentProtocolConfig;

    uint256 public startTimestamp;
    IERC20Burnable public twoLatToken;
    address public treasury;
    IMoonToken public moonTokenImplementation;

    mapping(uint256 => Cycle) internal _cycles;
    mapping(address => UserInCycle) internal _users;
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _trustedForwarder) ERC2771ContextUpgradeable(_trustedForwarder) {
        _disableInitializers();
    }

    function initialize(
        uint256 _startTimestamp,
        address _twoLatToken,
        address _treasury,
        address _moonTokenImplementation,
        ProtocolConfig calldata _protocolConfig
    ) public initializer {
        require(_protocolConfig.lockFraction + _protocolConfig.treasuryFraction == 1000, "Lock and treasury fractions must be 100% (1000)");

        __Ownable_init(_msgSender());
        __ERC20LockingMixing_init(_twoLatToken);


        currentProtocolConfig = _protocolConfig;
        startTimestamp = _startTimestamp;
        twoLatToken = IERC20Burnable(_twoLatToken);
        treasury = _treasury;
        moonTokenImplementation = IMoonToken(_moonTokenImplementation);
    }

    function hasAccess(address user) public view returns (bool) {
        return _users[user].lastCycleIndex == getCurrentCycleIndex() && _users[user].lastCycleIndex != 0;
    }

    function getCycle(uint256 cycle) public view returns (Cycle memory) {
        if (address(_cycles[cycle].moonToken) == address(0)) {
            revert CycleNotCreated(cycle);
        }
        return _cycles[cycle];
    }

    function getUser(address user) public view returns (UserInCycle memory) {
        return _users[user];
    }

    function getCycleStartTimestamp(uint256 cycle) public view returns (uint256) {
        return startTimestamp + cycle * CYCLE_DURATION;
    }

    function getCurrentCycleIndex() public view returns (uint256) {
        if (block.timestamp < startTimestamp) {
            revert NotStarted();
        }
        return (block.timestamp - startTimestamp) / CYCLE_DURATION;
    }

    function getNextCycleIndex() public view returns (uint256) {
        return getCurrentCycleIndex() + 1;
    }

    function getCurrentCycleStartTimestamp() public view returns (uint256) {
        return getCycleStartTimestamp(getCurrentCycleIndex());
    }

    function getCurrentCycleEndTimestamp() public view returns (uint256) {
        return getCycleStartTimestamp(getNextCycleIndex());
    }

    function getNextCycleEndTimestamp() public view returns (uint256) {
        return getCycleStartTimestamp(getNextCycleIndex() + 1);
    }

    function getNextCycleStartTimestamp() public view returns (uint256) {
        return getCycleStartTimestamp(getNextCycleIndex());
    }

    function getMoonTokenSalt(uint256 cycle) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(cycle));
    }

    function createCycle(uint256 cycle) public returns (Cycle memory) {
        if (address(_cycles[cycle].moonToken) != address(0)) {
            revert CycleAlreadyCreated(cycle);
        }

        bytes32 salt = getMoonTokenSalt(cycle);
        IMoonToken moonToken = IMoonToken(Clones.cloneDeterministic(address(moonTokenImplementation), salt));
        moonToken.initialize(cycle, address(this));
        _cycles[cycle] = Cycle({
            moonToken: moonToken,
            protocolConfig: currentProtocolConfig,
            locked: 0
        });
        emit CycleCreated(cycle, address(moonToken), currentProtocolConfig);
        return _cycles[cycle];
    }

    function getMoonTokenAddress(uint256 cycle) public view returns (address) {
        return address(_cycles[cycle].moonToken);
    }

    function getOrCreateCurrentCycle() public returns (Cycle memory cycle, uint256 index) {
        index = getCurrentCycleIndex();
        if (address(_cycles[index].moonToken) == address(0)) {
            return (createCycle(index), index);
        }
        return (_cycles[index], index);
    }

    function getOrCreateNextCycle() public returns (Cycle memory cycle, uint256 index) {
        index = getNextCycleIndex();
        if (address(_cycles[index].moonToken) == address(0)) {
            return (createCycle(index), index);
        }
        return (_cycles[index], index);
    }

    function payAccessForNextCycle() public {
        _payAccess(_msgSender());
    }

    function burnLocked(address _payer) public {
        uint256 index = getCurrentCycleIndex();
        if (_users[_payer].lastCycleIndex < index) {
            // Burn 2LAT
            uint256 amount = _release(_payer, true);
            if (amount > 0) {
                twoLatToken.burn(amount);
            }
            _users[_payer].cyclesInRow = 0;
        }
    }

    function _payAccess(address _payer) private {
        (Cycle memory cycle, uint256 index) = getOrCreateNextCycle();

        if (_users[_payer].lastCycleIndex >= index) {
            revert AlreadyPaid();
        }

        if (_users[_payer].lastCycleIndex < index - 1) {
            // Burn 2LAT
            uint256 amount = _release(_payer, true);
            if (amount > 0) {
                twoLatToken.burn(amount);
            }
            _users[_payer].cyclesInRow = 0;
        } else {
            uint256 amount = _release(_payer, false);
            if (amount > 0) {
                twoLatToken.safeTransfer(_payer, amount);
            }
        }

        uint256 paymentAmount = uint256(cycle.protocolConfig.accessPrice);
        // 1. Transfer 2LAT from payer
        twoLatToken.safeTransferFrom(_payer, address(this), paymentAmount);

        // 2. Calculate and distribute funds
        uint256 treasuryAmount = (paymentAmount * cycle.protocolConfig.treasuryFraction) / 1000;
        uint256 lockAmount = paymentAmount - treasuryAmount; // Remainder goes to lock

        // 2a. Fund Treasury
        twoLatToken.safeTransfer(treasury, treasuryAmount);
        emit TreasuryFunded(_payer, treasuryAmount, index);

        // 2b. Lock Funds
        cycle.locked += lockAmount;
        _lock(
            keccak256(abi.encodePacked(
                _payer, 
                index)),
            _payer,
            _payer,
            uint208(lockAmount),
            uint48(getCycleStartTimestamp(index + currentProtocolConfig.lockCycles - 1)),
            false
        );

        // 3. Mint MOON Tokens from the correct cycle's deployed contract
        cycle.moonToken.mint(_payer, cycle.protocolConfig.moonPerPayment); 
        emit MoonTokensMinted(_payer, address(cycle.moonToken), cycle.protocolConfig.moonPerPayment, index);

        // 4. Record Payment
        _users[_payer].lastCycleIndex = uint32(index);
        _users[_payer].cyclesInRow++;
    }
    
    // --- ERC2771Context Overrides ---
    // Re-add overrides to resolve inheritance ambiguity
    function _msgSender()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address sender)
    {
        sender = ERC2771ContextUpgradeable._msgSender();
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
}
