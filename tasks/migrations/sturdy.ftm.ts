import { task } from 'hardhat/config';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import { printContracts } from '../../helpers/misc-utils';
import { usingTenderly } from '../../helpers/tenderly-utils';

task('sturdy:ftm', 'Deploy development environment')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .addFlag('skipRegistry', 'Skip addresses provider registration at Addresses Provider Registry')
  .setAction(async ({ verify, skipRegistry }, DRE) => {
    const POOL_NAME = ConfigNames.Fantom;
    await DRE.run('set-DRE');

    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
      checkVerification();
    }

    console.log('Migration started\n');

    console.log('1. Deploy address provider');
    await DRE.run('full:deploy-address-provider', { pool: POOL_NAME, skipRegistry });

    console.log('2. Deploy lending pool');
    await DRE.run('full:deploy-lending-pool', { pool: POOL_NAME });

    console.log('3. Deploy oracles');
    await DRE.run('full:deploy-oracles', { pool: POOL_NAME });

    console.log('4. Deploy Data Provider');
    await DRE.run('full:data-provider', { pool: POOL_NAME });

    console.log('5. Deploy Incentives impl');
    await DRE.run('full:deploy-incentives-impl', { pool: POOL_NAME });

    console.log('7. Deploy Yearn vault');
    await DRE.run('full:deploy-yearn-vault', { pool: POOL_NAME });

    // console.log('7-1. Deploy Beefy vault');
    // await DRE.run('full:deploy-beefy-vault', { pool: POOL_NAME });

    console.log('7-2. Deploy Yearn WETH vault');
    await DRE.run('full:deploy-yearn-weth-vault', { pool: POOL_NAME });

    console.log('7-3. Deploy Yearn WBTC vault');
    await DRE.run('full:deploy-yearn-wbtc-vault', { pool: POOL_NAME });

    console.log('7-4. Deploy Yearn BOO vault');
    await DRE.run('full:deploy-yearn-boo-vault', { pool: POOL_NAME });

    console.log('8. Initialize lending pool');
    await DRE.run('full:initialize-lending-pool', { pool: POOL_NAME });

    console.log('8-1. Deploy Collateral Adapter');
    await DRE.run('full:deploy-collateral-adapter', { pool: POOL_NAME });

    if (verify) {
      printContracts();
      console.log('9. Verifying contracts');
      await DRE.run('verify:general', { all: true, pool: POOL_NAME });

      console.log('10. Verifying aTokens and debtTokens');
      await DRE.run('verify:tokens', { pool: POOL_NAME });
    }

    if (usingTenderly()) {
      const postDeployHead = DRE.tenderlyNetwork.getHead();
      const postDeployFork = DRE.tenderlyNetwork.getFork();
      console.log('Tenderly Info');
      console.log('- Head', postDeployHead);
      console.log('- Fork', postDeployFork);
    }
    console.log('\nFinished migrations');
    printContracts();
  });
