import { task } from 'hardhat/config';
import { ConfigNames, loadPoolConfig } from '../../helpers/configuration';
import { deployYearnBOOVault } from '../../helpers/contracts-deployments';
import { getLendingPoolConfiguratorProxy } from '../../helpers/contracts-getters';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { eNetwork, ICommonConfiguration } from '../../helpers/types';

const CONTRACT_NAME = 'YearnBOOVault';

task(`testnet:deploy-yearn-boo-vault`, `Deploys the ${CONTRACT_NAME} contract`)
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .addFlag('verify', `Verify ${CONTRACT_NAME} contract via Etherscan API.`)
  .setAction(async ({ verify, pool }, localBRE) => {
    await localBRE.run('set-DRE');

    if (!localBRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }
    const yearnBOOVault = await deployYearnBOOVault(verify);
    const configurator = await getLendingPoolConfiguratorProxy();
    await configurator.registerVault(yearnBOOVault.address);
    console.log(`${CONTRACT_NAME}.address`, yearnBOOVault.address);
    console.log(`\tFinished ${CONTRACT_NAME} deployment`);
  });
