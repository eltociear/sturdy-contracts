// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import {GeneralLevSwap} from '../GeneralLevSwap.sol';
import {IERC20} from '../../../dependencies/openzeppelin/contracts/IERC20.sol';
import {SafeERC20} from '../../../dependencies/openzeppelin/contracts/SafeERC20.sol';
import {CurveswapAdapter} from '../../libraries/swap/CurveswapAdapter.sol';
import {Errors} from '../../libraries/helpers/Errors.sol';

interface ICurvePool {
  function coins(uint256) external view returns (address);

  function add_liquidity(uint256[2] memory amounts, uint256 _min_mint_amount) external;

  function calc_withdraw_one_coin(uint256 _token_amount, int128 i) external view returns (uint256);

  function remove_liquidity_one_coin(
    uint256 _token_amount,
    int128 i,
    uint256 _min_amount
  ) external returns (uint256);

  function balances(uint256 _id) external view returns (uint256);
}

contract TUSDFRAXBPLevSwap is GeneralLevSwap {
  using SafeERC20 for IERC20;

  address private constant TUSDFRAXBP = 0x33baeDa08b8afACc4d3d07cf31d49FC1F1f3E893;
  address private constant FRAXUSDC = 0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2;

  address private constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
  address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
  address private constant FRAX = 0x853d955aCEf822Db058eb8505911ED77F175b99e;
  address private constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
  address private constant TUSD = 0x0000000000085d4780B73119b644AE5ecd22b376;
  address private constant FRAXUSDCLP = 0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC;

  address private constant TUSD3CRV = 0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1;

  constructor(
    address _asset,
    address _vault,
    address _provider
  ) GeneralLevSwap(_asset, _vault, _provider) {
    ENABLED_STABLE_COINS[DAI] = true;
    ENABLED_STABLE_COINS[USDC] = true;
    ENABLED_STABLE_COINS[USDT] = true;
  }

  function getAvailableStableCoins() external pure override returns (address[] memory assets) {
    assets = new address[](3);
    assets[0] = DAI;
    assets[1] = USDC;
    assets[2] = USDT;
  }

  function _swapFromTUSD(
    address _stableAsset,
    uint256 _tusd_amount,
    uint256 _slippage,
    uint256 _collateralAmount
  ) internal returns (uint256) {
    return
      CurveswapAdapter.swapExactTokensForTokens(
        PROVIDER,
        TUSD3CRV,
        TUSD,
        _stableAsset,
        _tusd_amount,
        _slippage
      );
  }

  function _swapToTUSD(
    address _stableAsset,
    uint256 _amount,
    uint256 _slippage
  ) internal returns (uint256) {
    return
      CurveswapAdapter.swapExactTokensForTokens(
        PROVIDER,
        TUSD3CRV,
        _stableAsset,
        TUSD,
        _amount,
        _slippage
      );
  }

  function _swapToFRAXBP(uint256 _amount) internal returns (uint256) {
    IERC20(USDC).safeApprove(FRAXUSDC, 0);
    IERC20(USDC).safeApprove(FRAXUSDC, _amount);

    uint256[2] memory amountsAdded;
    amountsAdded[1] = _amount;
    ICurvePool(FRAXUSDC).add_liquidity(amountsAdded, 0);
    return IERC20(FRAXUSDCLP).balanceOf(address(this));
  }

  // stable coin -> TUSDFRAXBP
  function _swapTo(
    address _stableAsset,
    uint256 _amount,
    uint256 _slippage
  ) internal override returns (uint256) {
    uint256 amountTo;
    uint256[2] memory amountsAdded;
    uint256 collateralAmount = IERC20(COLLATERAL).balanceOf(address(this));

    if (_stableAsset == USDC) {
      amountTo = _swapToFRAXBP(_amount);

      IERC20(FRAXUSDCLP).safeApprove(TUSDFRAXBP, 0);
      IERC20(FRAXUSDCLP).safeApprove(TUSDFRAXBP, amountTo);

      amountsAdded[1] = amountTo;
    } else {
      amountTo = _swapToTUSD(_stableAsset, _amount, _slippage);

      IERC20(TUSD).safeApprove(TUSDFRAXBP, 0);
      IERC20(TUSD).safeApprove(TUSDFRAXBP, amountTo);

      amountsAdded[0] = amountTo;
    }

    ICurvePool(TUSDFRAXBP).add_liquidity(amountsAdded, 0);

    amountTo = IERC20(COLLATERAL).balanceOf(address(this));
    require(
      amountTo - collateralAmount >= _getMinAmount(_stableAsset, COLLATERAL, _amount, _slippage),
      Errors.LS_SUPPLY_NOT_ALLOWED
    );

    return amountTo;
  }

  function _swapFromFRAXBP(
    uint256 _amount,
    uint256 _slippage,
    uint256 _collateralAmount
  ) internal returns (uint256) {
    int256 coinIndex = 1;
    uint256 minAmount = ICurvePool(FRAXUSDC).calc_withdraw_one_coin(_amount, int128(coinIndex));
    require(
      minAmount >= _getMinAmount(COLLATERAL, USDC, _collateralAmount, _slippage),
      Errors.LS_SUPPLY_NOT_ALLOWED
    );

    uint256 usdcAmount = ICurvePool(FRAXUSDC).remove_liquidity_one_coin(
      _amount,
      int128(coinIndex),
      minAmount
    );

    return usdcAmount;
  }

  // TUSDFRAXBP -> stable coin
  function _swapFrom(address _stableAsset, uint256 _slippage) internal override returns (uint256) {
    int256 coinIndex;

    if (_stableAsset == USDC) {
      coinIndex = 1;
    }

    uint256 collateralAmount = IERC20(COLLATERAL).balanceOf(address(this));
    uint256 minAmount = ICurvePool(TUSDFRAXBP).calc_withdraw_one_coin(
      collateralAmount,
      int128(coinIndex)
    );
    uint256 amountOut = ICurvePool(TUSDFRAXBP).remove_liquidity_one_coin(
      collateralAmount,
      int128(coinIndex),
      minAmount
    );

    if (_stableAsset == USDC) {
      return _swapFromFRAXBP(amountOut, _slippage, collateralAmount);
    }

    return _swapFromTUSD(_stableAsset, amountOut, _slippage, collateralAmount);
  }

  function _getFRAXUSDCPrice() internal view returns (uint256) {
    return
      (((ICurvePool(FRAXUSDC).balances(0) * _getAssetPrice(FRAX)) /
        1e18 +
        (ICurvePool(FRAXUSDC).balances(1) * _getAssetPrice(USDC)) /
        1e6) * 1e18) / IERC20(FRAXUSDCLP).totalSupply();
  }

  function _getTUSDFRAXBPPrice() internal view returns (uint256) {
    return
      (ICurvePool(TUSDFRAXBP).balances(0) *
        _getAssetPrice(TUSD) +
        ICurvePool(TUSDFRAXBP).balances(1) *
        _getAssetPrice(FRAXUSDCLP)) / IERC20(TUSDFRAXBP).totalSupply();
  }

  function _getAssetPrice(address _asset) internal view override returns (uint256) {
    if (_asset == FRAXUSDCLP) return _getFRAXUSDCPrice();

    if (_asset == TUSDFRAXBP) return _getTUSDFRAXBPPrice();

    return ORACLE.getAssetPrice(_asset);
  }
}
