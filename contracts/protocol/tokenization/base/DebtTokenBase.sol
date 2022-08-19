// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import {ILendingPool} from '../../../interfaces/ILendingPool.sol';
import {ICreditDelegationToken} from '../../../interfaces/ICreditDelegationToken.sol';
import {VersionedInitializable} from '../../libraries/sturdy-upgradeability/VersionedInitializable.sol';
import {IncentivizedERC20} from '../IncentivizedERC20.sol';
import {Errors} from '../../libraries/helpers/Errors.sol';

/**
 * @title DebtTokenBase
 * @notice Base contract for different types of debt tokens, like StableDebtToken or VariableDebtToken
 * @author Sturdy, inspiration from Aave
 */

abstract contract DebtTokenBase is
  IncentivizedERC20('DEBTTOKEN_IMPL', 'DEBTTOKEN_IMPL', 0),
  VersionedInitializable,
  ICreditDelegationToken
{
  mapping(address => mapping(address => uint256)) internal _borrowAllowances;

  /**
   * @dev Only lending pool can call functions marked by this modifier
   **/
  modifier onlyLendingPool() {
    require(_msgSender() == address(_getLendingPool()), Errors.CT_CALLER_MUST_BE_LENDING_POOL);
    _;
  }

  /**
   * @dev delegates borrowing power to a user on the specific debt token
   * - Caller is anyone
   * @param delegatee the address receiving the delegated borrowing power
   * @param amount the maximum amount being delegated. Delegation will still
   * respect the liquidation constraints (even if delegated, a delegatee cannot
   * force a delegator HF to go below 1)
   **/
  function approveDelegation(address delegatee, uint256 amount) external override {
    _borrowAllowances[_msgSender()][delegatee] = amount;
    emit BorrowAllowanceDelegated(_msgSender(), delegatee, _getUnderlyingAssetAddress(), amount);
  }

  /**
   * @dev returns the borrow allowance of the user
   * @param fromUser The user to giving allowance
   * @param toUser The user to give allowance to
   * @return the current allowance of toUser
   **/
  function borrowAllowance(address fromUser, address toUser)
    external
    view
    override
    returns (uint256)
  {
    return _borrowAllowances[fromUser][toUser];
  }

  /**
   * @dev the debt token does not implement any of the
   * standard ERC20 functions for transfer and allowance.
   * - Caller is anyone
   * @param recipient The address of receiving user
   * @param amount The amount of transfer
   * @return No return because always revert
   **/
  function transfer(address recipient, uint256 amount) external virtual override returns (bool) {
    recipient;
    amount;
    revert('TRANSFER_NOT_SUPPORTED');
  }

  /**
   * @dev the debt token does not implement any of the
   * standard ERC20 functions for transfer and allowance.
   * @param owner The address of token owner
   * @param spender The address of token spender
   * @return No return because always revert
   **/
  function allowance(address owner, address spender)
    public
    view
    virtual
    override
    returns (uint256)
  {
    owner;
    spender;
    revert('ALLOWANCE_NOT_SUPPORTED');
  }

  /**
   * @dev the debt token does not implement any of the
   * standard ERC20 functions for transfer and allowance.
   * - Caller is anyone
   * @param spender The address of token spender
   * @param amount The amount of token to spend
   * @return No return because always revert
   **/
  function approve(address spender, uint256 amount) external virtual override returns (bool) {
    spender;
    amount;
    revert('APPROVAL_NOT_SUPPORTED');
  }

  /**
   * @dev the debt token does not implement any of the
   * standard ERC20 functions for transfer and allowance.
   * - Caller is anyone
   * @param sender The address of token sender
   * @param recipient The address of token recipient
   * @param amount The amount of transfer
   * @return No return because always revert
   **/
  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) external virtual override returns (bool) {
    sender;
    recipient;
    amount;
    revert('TRANSFER_NOT_SUPPORTED');
  }

  /**
   * @dev the debt token does not implement any of the
   * standard ERC20 functions for transfer and allowance.
   * - Caller is anyone
   * @param spender The address of token spender
   * @param addedValue The increasing amount to spend token
   **/
  function increaseAllowance(address spender, uint256 addedValue)
    public
    virtual
    override
    returns (bool)
  {
    spender;
    addedValue;
    revert('ALLOWANCE_NOT_SUPPORTED');
  }

  /**
   * @dev the debt token does not implement any of the
   * standard ERC20 functions for transfer and allowance.
   * - Caller is anyone
   * @param spender The address of token spender
   * @param subtractedValue The decreasing amount to spend token
   **/
  function decreaseAllowance(address spender, uint256 subtractedValue)
    public
    virtual
    override
    returns (bool)
  {
    spender;
    subtractedValue;
    revert('ALLOWANCE_NOT_SUPPORTED');
  }

  /**
   * @dev decrease the allowed amount of borrowing
   * @param delegator The address of borrower
   * @param delegatee The address of user who is borrowing behalf of borrower
   * @param amount The decreasing allowed amount
   **/
  function _decreaseBorrowAllowance(
    address delegator,
    address delegatee,
    uint256 amount
  ) internal {
    uint256 newAllowance = _borrowAllowances[delegator][delegatee] - amount;

    _borrowAllowances[delegator][delegatee] = newAllowance;

    emit BorrowAllowanceDelegated(delegator, delegatee, _getUnderlyingAssetAddress(), newAllowance);
  }

  function _getUnderlyingAssetAddress() internal view virtual returns (address);

  function _getLendingPool() internal view virtual returns (ILendingPool);
}
