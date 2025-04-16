// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ERC20LockingMixing is Initializable {
    using SafeERC20 for IERC20;

    IERC20 public token;

    error InvalidTokenAddress(address token);
    error InvalidSpender(address spender);
    error InvalidBeneficiary(address beneficiary);
    error InvalidAmount(uint256 amount);
    error InvalidUnlockTime(uint48 unlockTime);
    error LockAlreadyExists(bytes32 lockId);
    error LockDoesNotExist(bytes32 lockId);
    error LockNotUnlocked(bytes32 lockId);

    event LockCreated(
        address indexed beneficiary,
        uint256 amount,
        uint256 indexed unlockTime
    );
    event LockReleased(
        address indexed beneficiary,
        uint256 amount,
        uint256 indexed claimedAt
    );

    struct Lock {
        address beneficiary;
        uint208 amount;
        uint48 unlockTime;
        bytes32 next;
        bytes32 previous;
    }

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    function __ERC20LockingMixing_init(
        address _token
    ) internal onlyInitializing {
        __ERC20LockingMixing_init_unchained(_token);
    }

    function __ERC20LockingMixing_init_unchained(
        address _token
    ) internal onlyInitializing {
        if (_token == address(0)) {
            revert InvalidTokenAddress(address(0));
        }
        token = IERC20(_token);
    }

    mapping(address => bytes32) public lastUserlock;
    mapping(bytes32 => Lock) public locks;
    mapping(address => uint256) public lockedAmount;

    function getLocks(address beneficiary, uint256 max) public view returns (Lock[] memory) {
        Lock[] memory result = new Lock[](max);
        bytes32 lockId = lastUserlock[beneficiary];
        if (lockId == bytes32(0)) {
            return new Lock[](0);
        }
        
        uint256 count = 0;
        for (uint256 i = 0; i < max; i++) {
            if (lockId == bytes32(0)) {
                break;
            }
            result[i] = locks[lockId];
            lockId = locks[lockId].previous;
            count++;
        }

        Lock[] memory finalResult = new Lock[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResult[i] = result[count - i - 1];
        }
        return finalResult;
    }

    function _release(
        address beneficiary,
        bool force
    ) internal returns (uint256 amount) {
        bytes32 lockId = lastUserlock[beneficiary];
        while (lockId != bytes32(0)) {
            bytes32 nextLockId = locks[lockId].previous;
            amount += _releaseLock(lockId, force);
            lockId = nextLockId;
        }
        return amount;
    }

    function _releaseLock(bytes32 lockId, bool force) internal returns (uint256 amount) {
        if (lockId == bytes32(0) || locks[lockId].amount == 0) {
            revert LockDoesNotExist(lockId);
        }

        if (block.timestamp <= locks[lockId].unlockTime && !force) {
            return 0;
        }

        amount = locks[lockId].amount;

        lockedAmount[locks[lockId].beneficiary] -= locks[lockId].amount;
        _unchain(lockId);

        emit LockReleased(
            locks[lockId].beneficiary,
            locks[lockId].amount,
            block.timestamp
        );

        return amount;
    }

    function _lock(
        bytes32 lockId,
        address spender,
        address beneficiary,
        uint208 amount,
        uint48 unlockTime,
        bool isSafe
    ) internal returns (bool success) {
        if (spender == address(0)) {
            if (isSafe) {
                return false;
            } else {
                revert InvalidSpender(address(0));
            }
        }
        if (beneficiary == address(0)) {
            if (isSafe) {
                return false;
            } else {
                revert InvalidBeneficiary(address(0));
            }
        }
        if (amount == 0) {
            if (isSafe) {
                return false;
            } else {
                revert InvalidAmount(amount);
            }
        }
        if (unlockTime < block.timestamp) {
            if (isSafe) {
                return false;
            } else {
                revert InvalidUnlockTime(unlockTime);
            }
        }
        if (locks[lockId].amount > 0) {
            if (isSafe) {
                return false;
            } else {
                revert LockAlreadyExists(lockId);
            }
        }

        lockedAmount[beneficiary] += amount;
        locks[lockId] = Lock({
            beneficiary: beneficiary,
            amount: amount,
            unlockTime: unlockTime,
            next: bytes32(0),
            previous: bytes32(0)
        });

        _chain(lockId, beneficiary);

        emit LockCreated(beneficiary, amount, unlockTime);
        return true;
    }

    function _chain(bytes32 lockId, address beneficiary) internal {
        bytes32 previousLockId = lastUserlock[beneficiary];
        if (previousLockId != bytes32(0)) {
            locks[previousLockId].next = lockId;
            locks[lockId].previous = previousLockId;
        }

        lastUserlock[beneficiary] = lockId;
    }

    function _unchain(bytes32 lockId) internal {
        Lock storage unchainLock = locks[lockId];
        bytes32 previousLockId = unchainLock.previous;
        bytes32 nextLockId = unchainLock.next;

        if (previousLockId != bytes32(0)) {
            locks[previousLockId].next = nextLockId;
        }
        if (nextLockId != bytes32(0)) {
            locks[nextLockId].previous = previousLockId;
        }

        if (lockId == lastUserlock[unchainLock.beneficiary]) {
            lastUserlock[unchainLock.beneficiary] = previousLockId;
        }

        delete locks[lockId];
    }
}
