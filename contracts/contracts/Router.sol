// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract Router is Initializable, OwnableUpgradeable, ERC2771ContextUpgradeable {
    using SafeERC20 for IERC20;

    // State variables
    IERC20Permit public twoLatToken;
    address public accessPayment;
    ISwapRouter public uniswapRouter;
    address public weth;

    // Events
    event SwapAndPay(address indexed user, uint256 amountIn, uint256 amountOut);
    event AccessPaid(address indexed user, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _trustedForwarder) ERC2771ContextUpgradeable(_trustedForwarder) {
        _disableInitializers();
    }

    function initialize(
        address _twoLatToken,
        address _accessPayment,
        address _uniswapRouter,
        address _weth
    ) public initializer {
        __Ownable_init(_msgSender());

        twoLatToken = IERC20Permit(_twoLatToken);
        accessPayment = _accessPayment;
        uniswapRouter = ISwapRouter(_uniswapRouter);
        weth = _weth;
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
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return ERC2771ContextUpgradeable._contextSuffixLength();
    }

    // Core functions will be implemented here
    // - swapAndPay
    // - swapAndPayWithPermit
    // - estimateSwapAmount

    // Admin functions
    function setAccessPayment(address _newAccessPayment) external onlyOwner {
        accessPayment = _newAccessPayment;
    }

    function setUniswapRouter(address _newRouter) external onlyOwner {
        uniswapRouter = ISwapRouter(_newRouter);
    }
} 