import { task } from 'hardhat/config';
import { ConfigNames, loadPoolConfig } from '../../helpers/configuration';
import {
  deployAuraWSTETHWETHVault,
  deployBALWSTETHWETHOracle,
} from '../../helpers/contracts-deployments';
import { getLendingPoolConfiguratorProxy, getSturdyOracle } from '../../helpers/contracts-getters';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { waitForTx } from '../../helpers/misc-utils';
import { eNetwork, IEthConfiguration } from '../../helpers/types';

const CONTRACT_NAME = 'AuraWSTETHWETHVault';

task(`full:eth:deploy-aura-wsteth-weth-vault`, `Deploys the ${CONTRACT_NAME} contract`)
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .addFlag('verify', `Verify ${CONTRACT_NAME} contract via Etherscan API.`)
  .setAction(async ({ verify, pool }, localBRE) => {
    await localBRE.run('set-DRE');

    if (!localBRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }
    console.log(localBRE.network.name);

    const network = process.env.FORK ? <eNetwork>process.env.FORK : <eNetwork>localBRE.network.name;
    const poolConfig = loadPoolConfig(pool);
    const {
      ReserveAssets,
      ReserveFactorTreasuryAddress,
      ChainlinkAggregator,
      BAL_WSTETH_WETH_LP,
      BAL,
    } = poolConfig as IEthConfiguration;
    const treasuryAddress = getParamPerNetwork(ReserveFactorTreasuryAddress, network);

    const vault = await deployAuraWSTETHWETHVault(verify);
    const configurator = await getLendingPoolConfiguratorProxy();
    await configurator.registerVault(vault.address);
    await vault.setTreasuryInfo(treasuryAddress, '1000'); //10% fee
    await vault.setConfiguration(getParamPerNetwork(BAL_WSTETH_WETH_LP, network), 3); // set balancer lp token & aura pool id
    await vault.setIncentiveRatio('7500');

    const internalAssetAddress = await vault.getInternalAsset();
    ReserveAssets[network].auraWSTETH_WETH = internalAssetAddress;
    console.log(`internal token: ${internalAssetAddress}`);

    // Deploy BALWSTETHWETHOracle oracle
    let BALWSTETHWETHOracleAddress = getParamPerNetwork(
      ChainlinkAggregator,
      network
    ).auraDAI_USDC_USDT;
    if (!BALWSTETHWETHOracleAddress) {
      const BALWSTETHWETHOracle = await deployBALWSTETHWETHOracle(verify);
      BALWSTETHWETHOracleAddress = BALWSTETHWETHOracle.address;
    }

    // Register
    const sturdyOracle = await getSturdyOracle();
    await waitForTx(
      await sturdyOracle.setAssetSources(
        [
          internalAssetAddress,
          getParamPerNetwork(BAL_WSTETH_WETH_LP, network),
          getParamPerNetwork(BAL, network),
        ],
        [
          BALWSTETHWETHOracleAddress,
          BALWSTETHWETHOracleAddress,
          getParamPerNetwork(ChainlinkAggregator, network).BAL,
        ]
      )
    );
    console.log((await sturdyOracle.getAssetPrice(internalAssetAddress)).toString());

    console.log(`${CONTRACT_NAME}.address`, vault.address);
    console.log(`\tFinished ${CONTRACT_NAME} deployment`);
  });
