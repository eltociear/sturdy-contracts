import { task } from 'hardhat/config';
import { ConfigNames, loadPoolConfig } from '../../helpers/configuration';
import { deployYearnWETHVault } from '../../helpers/contracts-deployments';
import { getLendingPoolConfiguratorProxy } from '../../helpers/contracts-getters';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { eNetwork, ICommonConfiguration } from '../../helpers/types';

const CONTRACT_NAME = 'YearnWETHVault';

task(`full:deploy-yearn-weth-vault`, `Deploys the ${CONTRACT_NAME} contract`)
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .addFlag('verify', `Verify ${CONTRACT_NAME} contract via Etherscan API.`)
  .setAction(async ({ verify, pool }, localBRE) => {
    await localBRE.run('set-DRE');

    if (!localBRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }

    const network = process.env.FORK ? <eNetwork>process.env.FORK : <eNetwork>localBRE.network.name;
    const poolConfig = loadPoolConfig(pool);
    const { ReserveFactorTreasuryAddress } = poolConfig as ICommonConfiguration;
    const treasuryAddress = getParamPerNetwork(ReserveFactorTreasuryAddress, network);

    const yearnWETHVault = await deployYearnWETHVault(verify);
    const configurator = await getLendingPoolConfiguratorProxy();
    await configurator.registerVault(yearnWETHVault.address);
    await yearnWETHVault.setTreasuryInfo(treasuryAddress, '3000'); //30% fee

    console.log(`${CONTRACT_NAME}.address`, yearnWETHVault.address);
    console.log(`\tFinished ${CONTRACT_NAME} deployment`);
  });
