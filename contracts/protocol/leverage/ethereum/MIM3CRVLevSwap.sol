// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;
pragma abicoder v2;

import {GeneralLevSwap} from '../GeneralLevSwap.sol';
import {IERC20} from '../../../dependencies/openzeppelin/contracts/IERC20.sol';
import {IGeneralLevSwap} from '../../../interfaces/IGeneralLevSwap.sol';
import {ICurvePool} from '../../../interfaces/ICurvePool.sol';
import {SafeERC20} from '../../../dependencies/openzeppelin/contracts/SafeERC20.sol';
import {Errors} from '../../libraries/helpers/Errors.sol';

contract MIM3CRVLevSwap is GeneralLevSwap {
  using SafeERC20 for IERC20;

  address private constant POOL = 0x5a6A4D54456819380173272A5E8E9B9904BdF41B;
  address private constant THREECRV_TOKEN = 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490; // 3crv
  address private constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
  address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
  address private constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

  constructor(
    address _asset,
    address _vault,
    address _provider
  ) GeneralLevSwap(_asset, _vault, _provider) {
    ENABLED_BORROW_ASSETS[DAI] = true;
    ENABLED_BORROW_ASSETS[USDC] = true;
    ENABLED_BORROW_ASSETS[USDT] = true;
  }

  function getAvailableBorrowAssets() external pure override returns (address[] memory assets) {
    assets = new address[](3);
    assets[0] = DAI;
    assets[1] = USDC;
    assets[2] = USDT;
  }

  // MIM3CRV <-> borrowing asset
  function _processSwap(
    uint256 _amount,
    IGeneralLevSwap.MultipSwapPath memory _path,
    bool _isFrom,
    bool _checkOutAmount
  ) internal override returns (uint256) {
    if (_path.swapType > IGeneralLevSwap.SwapType.NO_SWAP) {
      return _swapByPath(_amount, _path, _checkOutAmount);
    }

    uint256 outAmount = _checkOutAmount ? _path.outAmount : 0;
    if (_isFrom) {
      // MIM3CRV -> 3CRV/MIM
      int256 coinIndex;

      if (_path.swapTo == THREECRV_TOKEN) {
        coinIndex = 1;
      }

      return
        ICurvePool(POOL).remove_liquidity_one_coin(
          _amount,
          int128(coinIndex),
          outAmount,
          address(this)
        );
    }

    // 3CRV/MIM -> MIM3CRV
    require(_path.swapTo == COLLATERAL, Errors.LS_INVALID_CONFIGURATION);

    uint256[2] memory amountsAdded;
    uint256 coinIndex;
    address from = _path.swapFrom;

    IERC20(from).safeApprove(POOL, 0);
    IERC20(from).safeApprove(POOL, _amount);

    if (from == THREECRV_TOKEN) {
      coinIndex = 1;
    }
    amountsAdded[coinIndex] = _amount;

    ICurvePool(POOL).add_liquidity(amountsAdded, outAmount);
    return IERC20(COLLATERAL).balanceOf(address(this));
  }
}
