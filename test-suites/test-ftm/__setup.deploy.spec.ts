import rawBRE from 'hardhat';
import { MockContract } from 'ethereum-waffle';
import {
  insertContractAddressInDb,
  getEthersSigners,
  registerContractInJsonDb,
  getEthersSignersAddresses,
} from '../../helpers/contracts-helpers';
import {
  deployLendingPoolAddressesProvider,
  deployMintableERC20,
  deployLendingPoolAddressesProviderRegistry,
  deployLendingPoolConfigurator,
  deployLendingPool,
  deployPriceOracle,
  deploySturdyOracle,
  deployLendingPoolCollateralManager,
  deploySturdyProtocolDataProvider,
  deployLendingRateOracle,
  deployStableAndVariableTokensHelper,
  deployATokensAndRatesHelper,
  deployWETHMocked,
  deploySturdyIncentivesController,
  deploySturdyToken,
  deployYearnVault,
  deployBeefyVault,
} from '../../helpers/contracts-deployments';
import { Signer } from 'ethers';
import { TokenContractId, eContractid, tEthereumAddress, SturdyPools } from '../../helpers/types';
import { MintableERC20 } from '../../types/MintableERC20';
import {
  ConfigNames,
  getReservesConfigByPool,
  getTreasuryAddress,
  getYieldAddress,
  loadPoolConfig,
} from '../../helpers/configuration';
import { initializeMakeSuite } from './helpers/make-suite';

import {
  setInitialAssetPricesInOracle,
  deployAllMockAggregators,
  setInitialMarketRatesInRatesOracleByHelper,
} from '../../helpers/oracles-helpers';
import { DRE, waitForTx } from '../../helpers/misc-utils';
import { initReservesByHelper, configureReservesByHelper } from '../../helpers/init-helpers';
import FantomConfig from '../../markets/ftm';
import { oneEther, ZERO_ADDRESS } from '../../helpers/constants';
import {
  getBeefyVault,
  getLendingPool,
  getLendingPoolConfiguratorProxy,
  getPairsTokenAggregator,
} from '../../helpers/contracts-getters';
import { WETH9Mocked } from '../../types/WETH9Mocked';

const MOCK_USD_PRICE_IN_WEI = FantomConfig.ProtocolGlobalParams.MockUsdPriceInWei;
const ALL_ASSETS_INITIAL_PRICES = FantomConfig.Mocks.AllAssetsInitialPrices;
const USD_ADDRESS = FantomConfig.ProtocolGlobalParams.UsdAddress;
const MOCK_CHAINLINK_AGGREGATORS_PRICES = FantomConfig.Mocks.AllAssetsInitialPrices;
const LENDING_RATE_ORACLE_RATES_COMMON = FantomConfig.LendingRateOracleRatesCommon;

const deployAllMockTokens = async (deployer: Signer) => {
  const tokens: { [symbol: string]: MockContract | MintableERC20 | WETH9Mocked } = {};

  const protoConfigData = getReservesConfigByPool(SturdyPools.proto);

  for (const tokenSymbol of Object.keys(TokenContractId)) {
    console.log(tokenSymbol);
    if (tokenSymbol === 'WETH') {
      tokens[tokenSymbol] = await deployWETHMocked();
      await registerContractInJsonDb(tokenSymbol.toUpperCase(), tokens[tokenSymbol]);
      continue;
    }
    let decimals = 18;

    let configData = (<any>protoConfigData)[tokenSymbol];
    if (!configData) {
      decimals = 18;
    }

    tokens[tokenSymbol] = await deployMintableERC20([
      tokenSymbol,
      tokenSymbol,
      configData ? configData.reserveDecimals : 18,
    ]);
    await registerContractInJsonDb(tokenSymbol.toUpperCase(), tokens[tokenSymbol]);
  }

  return tokens;
};

const buildTestEnv = async (deployer: Signer, secondaryWallet: Signer) => {
  console.time('setup');
  const sturdyAdmin = await deployer.getAddress();
  const mockTokens = await deployAllMockTokens(deployer);
  console.log('Deployed mocks');
  const addressesProvider = await deployLendingPoolAddressesProvider(FantomConfig.MarketId);
  await waitForTx(await addressesProvider.setPoolAdmin(sturdyAdmin));

  //setting users[1] as emergency admin, which is in position 2 in the DRE addresses list
  const addressList = await getEthersSignersAddresses();

  await waitForTx(await addressesProvider.setEmergencyAdmin(addressList[2]));

  const addressesProviderRegistry = await deployLendingPoolAddressesProviderRegistry();
  await waitForTx(
    await addressesProviderRegistry.registerAddressesProvider(addressesProvider.address, 1)
  );

  const lendingPoolImpl = await deployLendingPool();

  await waitForTx(await addressesProvider.setLendingPoolImpl(lendingPoolImpl.address));

  const lendingPoolAddress = await addressesProvider.getLendingPool();
  const lendingPoolProxy = await getLendingPool(lendingPoolAddress);

  await insertContractAddressInDb(eContractid.LendingPool, lendingPoolProxy.address);

  const lendingPoolConfiguratorImpl = await deployLendingPoolConfigurator();
  await waitForTx(
    await addressesProvider.setLendingPoolConfiguratorImpl(lendingPoolConfiguratorImpl.address)
  );
  const lendingPoolConfiguratorProxy = await getLendingPoolConfiguratorProxy(
    await addressesProvider.getLendingPoolConfigurator()
  );
  await insertContractAddressInDb(
    eContractid.LendingPoolConfigurator,
    lendingPoolConfiguratorProxy.address
  );

  // Deploy deployment helpers
  await deployStableAndVariableTokensHelper([lendingPoolProxy.address, addressesProvider.address]);
  await deployATokensAndRatesHelper([
    lendingPoolProxy.address,
    addressesProvider.address,
    lendingPoolConfiguratorProxy.address,
  ]);

  const fallbackOracle = await deployPriceOracle();
  await waitForTx(await fallbackOracle.setEthUsdPrice(MOCK_USD_PRICE_IN_WEI));
  await setInitialAssetPricesInOracle(
    ALL_ASSETS_INITIAL_PRICES,
    {
      WETH: mockTokens.WETH.address,
      DAI: mockTokens.DAI.address,
      USDC: mockTokens.USDC.address,
      fUSDT: mockTokens.fUSDT.address,
      USD: USD_ADDRESS,
      stETH: mockTokens.stETH.address,
      yvWFTM: mockTokens.yvWFTM.address,
      mooWETH: mockTokens.mooWETH.address,
    },
    fallbackOracle
  );

  const mockAggregators = await deployAllMockAggregators(MOCK_CHAINLINK_AGGREGATORS_PRICES);
  console.log('Mock aggs deployed');
  const allTokenAddresses = Object.entries(mockTokens).reduce(
    (accum: { [tokenSymbol: string]: tEthereumAddress }, [tokenSymbol, tokenContract]) => ({
      ...accum,
      [tokenSymbol]: tokenContract.address,
    }),
    {}
  );
  const allAggregatorsAddresses = Object.entries(mockAggregators).reduce(
    (accum: { [tokenSymbol: string]: tEthereumAddress }, [tokenSymbol, aggregator]) => ({
      ...accum,
      [tokenSymbol]: aggregator.address,
    }),
    {}
  );

  const [tokens, aggregators] = getPairsTokenAggregator(allTokenAddresses, allAggregatorsAddresses, FantomConfig.OracleQuoteCurrency);

  await deploySturdyOracle([tokens, aggregators, fallbackOracle.address, mockTokens.WETH.address, oneEther.toString()]);
  await waitForTx(await addressesProvider.setPriceOracle(fallbackOracle.address));

  const lendingRateOracle = await deployLendingRateOracle();
  await waitForTx(await addressesProvider.setLendingRateOracle(lendingRateOracle.address));

  const { USD, ...tokensAddressesWithoutUsd } = allTokenAddresses;
  const allReservesAddresses = {
    ...tokensAddressesWithoutUsd,
  };
  await setInitialMarketRatesInRatesOracleByHelper(
    LENDING_RATE_ORACLE_RATES_COMMON,
    allReservesAddresses,
    lendingRateOracle,
    sturdyAdmin
  );

  const reservesParams = getReservesConfigByPool(SturdyPools.proto);

  const testHelpers = await deploySturdyProtocolDataProvider(addressesProvider.address);

  await insertContractAddressInDb(eContractid.SturdyProtocolDataProvider, testHelpers.address);
  const admin = await deployer.getAddress();

  console.log('Incentive controller and token');

  const EMISSION_EXECUTOR = await deployer.getAddress();
  const incentives = await deploySturdyIncentivesController([EMISSION_EXECUTOR]);
  console.log(`- Incentives proxy address ${incentives.address}`);

  const sturdyToken = await deploySturdyToken();
  console.log(`- Incentives sturdy token proxy address ${sturdyToken.address}`);

  console.log('Initialize configuration');

  const config = loadPoolConfig(ConfigNames.Sturdy);

  const { ATokenNamePrefix, StableDebtTokenNamePrefix, VariableDebtTokenNamePrefix, SymbolPrefix } =
    config;
  const treasuryAddress = await getTreasuryAddress(config);
  const yieldAddress = await getYieldAddress(config);

  await initReservesByHelper(
    reservesParams,
    allReservesAddresses,
    ATokenNamePrefix,
    StableDebtTokenNamePrefix,
    VariableDebtTokenNamePrefix,
    SymbolPrefix,
    admin,
    treasuryAddress,
    {
      // TODO @bshevchenko: refactor
      DAI: yieldAddress,
      USDC: yieldAddress,
      yvWFTM: yieldAddress,
      mooWETH: (await getBeefyVault()).address,
    },
    false
  );

  await configureReservesByHelper(reservesParams, allReservesAddresses, testHelpers, admin);

  const collateralManager = await deployLendingPoolCollateralManager();
  await waitForTx(
    await addressesProvider.setLendingPoolCollateralManager(collateralManager.address)
  );

  console.log('Yearn Vault');
  const yearnVault = await deployYearnVault();
  const configurator = await getLendingPoolConfiguratorProxy();
  await configurator.registerVault(yearnVault.address);
  console.log('Yearn Vault', yearnVault.address);
  console.log(`\tFinished Yearn Vault deployment`);

  console.log('Beefy Vault');
  const beefyVault = await deployBeefyVault();
  await configurator.registerVault(beefyVault.address);
  console.log('Beefy Vault', beefyVault.address);
  console.log(`\tFinished Beefy Vault deployment`);

  console.timeEnd('setup');
};

before(async () => {
  await rawBRE.run('set-DRE');
  const [deployer, secondaryWallet] = await getEthersSigners();
  const FORK = process.env.FORK;
  const SKIP_DEPLOY = process.env.SKIP_DEPLOY;

  if (!SKIP_DEPLOY) {
    if (FORK) {
      await rawBRE.run('sturdy:ftm');
    } else {
      console.log('-> Deploying test environment...');
      await buildTestEnv(deployer, secondaryWallet);
    }
  }

  await initializeMakeSuite();
  console.log('\n***************');
  console.log('Setup and snapshot finished');
  console.log('***************\n');
});
