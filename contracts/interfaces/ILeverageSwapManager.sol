// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

interface ILeverageSwapManager {
  function getLevSwapper(address collateral) external view returns (address);
}
