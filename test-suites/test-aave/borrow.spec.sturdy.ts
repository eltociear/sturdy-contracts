import BigNumber from 'bignumber.js';
import { APPROVAL_AMOUNT_LENDING_POOL, ZERO_ADDRESS } from '../../helpers/constants';
import { convertToCurrencyDecimals } from '../../helpers/contracts-helpers';
import { makeSuite } from './helpers/make-suite';
import { RateMode } from '../../helpers/types';
import { printUserAccountData, ETHfromWei, printDivider } from './helpers/utils/helpers';
import { DRE, impersonateAccountsHardhat } from '../../helpers/misc-utils';

const chai = require('chai');
const { expect } = chai;

makeSuite('Deposit ETH as collatoral and other as for pool liquidity supplier ', (testEnv) => {
  it('User1 deposits USDC, User deposits ETH as collatoral and borrows USDC', async () => {
    const { usdc, users, pool, lidoVault, oracle } = testEnv;
    const ethers = (DRE as any).ethers;
    const usdcOwnerAddress = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503';
    const depositor = users[0];
    const borrower = users[1];
    printDivider();
    const depositUSDC = '7000';
    //Make some test USDC for depositor
    await impersonateAccountsHardhat([usdcOwnerAddress]);
    const signer = await ethers.provider.getSigner(usdcOwnerAddress);
    const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdc.address, depositUSDC);
    await usdc.connect(signer).transfer(depositor.address, amountUSDCtoDeposit);

    //approve protocol to access depositor wallet
    await usdc.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //Supplier  deposits 7000 USDC
    await pool
      .connect(depositor.signer)
      .deposit(usdc.address, amountUSDCtoDeposit, depositor.address, '0', false);

    const supplierGlobalData = await pool.getUserAccountData(depositor.address);
    printUserAccountData({
      user: `Supplier ${depositor.address}`,
      action: 'deposited',
      amount: depositUSDC,
      coin: 'USDC',
      ...supplierGlobalData,
    });

    //user 2 deposits 4 ETH
    const amountETHtoDeposit = ethers.utils.parseEther('4');
    await lidoVault
      .connect(borrower.signer)
      .depositCollateral(ZERO_ADDRESS, 0, { value: amountETHtoDeposit });
    {
      console.log(pool.address);
      const supplierGlobalData = await pool.getUserAccountData(borrower.address);
      printUserAccountData({
        user: `Borrower ${borrower.address}`,
        action: 'deposited',
        amount: ETHfromWei(amountETHtoDeposit),
        coin: 'wstETH',
        ...supplierGlobalData,
      });
    }

    //user 2 borrows
    const userGlobalData = await pool.getUserAccountData(borrower.address);
    const usdcPrice = await oracle.getAssetPrice(usdc.address);

    const amountUSDCToBorrow = await convertToCurrencyDecimals(
      usdc.address,
      new BigNumber(userGlobalData.availableBorrowsETH.toString())
        .div(usdcPrice.toString())
        .multipliedBy(0.95)
        .toFixed(0)
    );

    await pool
      .connect(borrower.signer)
      .borrow(usdc.address, amountUSDCToBorrow, RateMode.Variable, '0', borrower.address);

    const userGlobalDataAfter = await pool.getUserAccountData(borrower.address);
    printUserAccountData({
      user: `Borrower ${borrower.address}`,
      action: 'borrowed',
      amount: amountUSDCToBorrow,
      coin: 'USDC',
      ...userGlobalDataAfter,
    });

    expect(userGlobalDataAfter.currentLiquidationThreshold.toString()).to.be.bignumber.equal(
      '6500',
      'Invalid liquidation threshold'
    );
  });
});

makeSuite('Deposit stETH as collatoral and other as for pool liquidity supplier ', (testEnv) => {
  it('User1 deposits USDC, User deposits stETH as collatoral and borrows USDC', async () => {
    const { usdc, users, pool, lidoVault, lido, oracle } = testEnv;
    const ethers = (DRE as any).ethers;
    const usdcOwnerAddress = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503';
    const depositor = users[0];
    const borrower = users[1];
    printDivider();
    const depositUSDC = '7000';
    //Make some test USDC for depositor
    await impersonateAccountsHardhat([usdcOwnerAddress]);
    let signer = await ethers.provider.getSigner(usdcOwnerAddress);
    const amountUSDCtoDeposit = await convertToCurrencyDecimals(usdc.address, depositUSDC);
    await usdc.connect(signer).transfer(depositor.address, amountUSDCtoDeposit);

    //approve protocol to access depositor wallet
    await usdc.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //Supplier  deposits 7000 USDC
    await pool
      .connect(depositor.signer)
      .deposit(usdc.address, amountUSDCtoDeposit, depositor.address, '0', false);

    const supplierGlobalData = await pool.getUserAccountData(depositor.address);
    printUserAccountData({
      user: `Supplier ${depositor.address}`,
      action: 'deposited',
      amount: depositUSDC,
      coin: 'USDC',
      ...supplierGlobalData,
    });

    //user 2 deposits 4 stETH
    const stETHOwnerAddress = '0x06920C9fC643De77B99cB7670A944AD31eaAA260';
    const depositStETH = '4';
    const amountStETHtoDeposit = await convertToCurrencyDecimals(lido.address, depositStETH);
    //Make some test stETH for borrower
    await impersonateAccountsHardhat([stETHOwnerAddress]);
    signer = await ethers.provider.getSigner(stETHOwnerAddress);
    await lido.connect(signer).transfer(borrower.address, amountStETHtoDeposit);
    //approve protocol to access depositor wallet
    await lido.connect(borrower.signer).approve(lidoVault.address, APPROVAL_AMOUNT_LENDING_POOL);

    await lidoVault.connect(borrower.signer).depositCollateral(lido.address, amountStETHtoDeposit);
    {
      const supplierGlobalData = await pool.getUserAccountData(borrower.address);
      printUserAccountData({
        user: `Borrower ${borrower.address}`,
        action: 'deposited',
        amount: ETHfromWei(amountStETHtoDeposit),
        coin: 'stETH',
        ...supplierGlobalData,
      });
    }

    //user 2 borrows
    const userGlobalData = await pool.getUserAccountData(borrower.address);
    const usdcPrice = await oracle.getAssetPrice(usdc.address);

    const amountUSDCToBorrow = await convertToCurrencyDecimals(
      usdc.address,
      new BigNumber(userGlobalData.availableBorrowsETH.toString())
        .div(usdcPrice.toString())
        .multipliedBy(0.95)
        .toFixed(0)
    );

    await pool
      .connect(borrower.signer)
      .borrow(usdc.address, amountUSDCToBorrow, RateMode.Variable, '0', borrower.address);

    const userGlobalDataAfter = await pool.getUserAccountData(borrower.address);
    printUserAccountData({
      user: `Borrower ${borrower.address}`,
      action: 'borrowed',
      amount: amountUSDCToBorrow,
      coin: 'USDC',
      ...userGlobalDataAfter,
    });

    expect(userGlobalDataAfter.currentLiquidationThreshold.toString()).to.be.bignumber.equal(
      '6500',
      'Invalid liquidation threshold'
    );
  });
});

makeSuite('borrow wstETH', (testEnv) => {
  it('Should revert if borrow wstETH. User1 deposits wstETH, User2 deposits ETH as collatoral and borrows wstETH', async () => {
    const { wstETH, users, pool, lidoVault, oracle } = testEnv;
    const ethers = (DRE as any).ethers;
    const depositor = users[0];
    const borrower = users[1];
    printDivider();
    const wstETHOwnerAddress = '0x73d1937bd68a970030b2ffda492860cfb87013c4';
    const depositWstETH = '10';
    //Make some test wstETH for depositor
    await impersonateAccountsHardhat([wstETHOwnerAddress]);
    const signer = await ethers.provider.getSigner(wstETHOwnerAddress);
    await wstETH
      .connect(signer)
      .transfer(depositor.address, ethers.utils.parseEther(depositWstETH));

    //approve protocol to access depositor wallet
    await wstETH.connect(depositor.signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    //user 1 deposits 5 wstETH
    const amountWstETHtoDeposit = await convertToCurrencyDecimals(wstETH.address, '5');

    await expect(
      pool
        .connect(depositor.signer)
        .deposit(wstETH.address, amountWstETHtoDeposit, depositor.address, '0', false)
    ).to.not.be.reverted;

    //Make 5ETH deposit for collatoral
    await lidoVault
      .connect(borrower.signer)
      .depositCollateral(ZERO_ADDRESS, 0, { value: ethers.utils.parseEther('5') });

    const borrowerGlobalData = await pool.getUserAccountData(borrower.address);
    printUserAccountData({
      user: `Borrower ${borrower.address}`,
      action: 'deposits',
      amount: 5,
      coin: 'swtETH',
      ...borrowerGlobalData,
    });
    //user 2 borrows

    const userGlobalData = await pool.getUserAccountData(borrower.address);
    const wstETHPrice = await oracle.getAssetPrice(wstETH.address);

    const amountWstETHToBorrow = await convertToCurrencyDecimals(
      wstETH.address,
      new BigNumber(userGlobalData.availableBorrowsETH.toString())
        .div(wstETHPrice.toString())
        .multipliedBy(0.95)
        .toFixed(0)
    );
    await expect(
      pool
        .connect(borrower.signer)
        .borrow(wstETH.address, amountWstETHToBorrow, RateMode.Stable, '0', borrower.address)
    ).to.be.reverted;
  });
});
