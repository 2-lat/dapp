// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract Router is Initializable, OwnableUpgradeable, EIP712Upgradeable {
    using SafeERC20 for IERC20;

    // State variables
    IERC20 public twoLatToken;
    address public accessPayment;
    ISwapRouter public uniswapRouter;
    address public weth;

    // Events
    event SwapAndPay(address indexed user, uint256 amountIn, uint256 amountOut);
    event AccessPaid(address indexed user, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _twoLatToken,
        address _accessPayment,
        address _uniswapRouter,
        address _weth
    ) public initializer {
        __Ownable_init(msg.sender);
        __EIP712_init("Router", "1");

        twoLatToken = IERC20(_twoLatToken);
        accessPayment = _accessPayment;
        uniswapRouter = ISwapRouter(_uniswapRouter);
        weth = _weth;
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