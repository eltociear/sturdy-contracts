import { IEthConfiguration, eEthereumNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategyAURAWSTETH_WETH,
  strategyCVXETH_STETH,
  strategyWETH,
} from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const EthConfig: IEthConfiguration = {
  ...CommonsConfig,
  MarketId: 'Sturdy_eth genesis market',
  ProviderId: 3,
  ReservesConfig: {
    WETH: strategyWETH,
    cvxETH_STETH: strategyCVXETH_STETH,
    auraWSTETH_WETH: strategyAURAWSTETH_WETH,
  },
  ReserveAssets: {
    [eEthereumNetwork.main]: {
      WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      cvxETH_STETH: '',
      auraWSTETH_WETH: '',
    },
    [eEthereumNetwork.tenderly]: {
      WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      cvxETH_STETH: '',
      auraWSTETH_WETH: '',
    },
  },
  CRV: {
    [eEthereumNetwork.main]: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    [eEthereumNetwork.tenderly]: '0xD533a949740bb3306d119CC777fa900bA034cd52',
  },
  CVX: {
    [eEthereumNetwork.main]: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
    [eEthereumNetwork.tenderly]: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
  },
  BAL: {
    [eEthereumNetwork.main]: '0xba100000625a3754423978a60c9317c58a424e3D',
    [eEthereumNetwork.tenderly]: '0xba100000625a3754423978a60c9317c58a424e3D',
  },
  ETH_STETH_LP: {
    [eEthereumNetwork.main]: '0x06325440D014e39736583c165C2963BA99fAf14E',
    [eEthereumNetwork.tenderly]: '0x06325440D014e39736583c165C2963BA99fAf14E',
  },
  BAL_WSTETH_WETH_LP: {
    [eEthereumNetwork.main]: '0x32296969Ef14EB0c6d29669C550D4a0449130230',
    [eEthereumNetwork.tenderly]: '0x32296969Ef14EB0c6d29669C550D4a0449130230',
  },
  UniswapRouter: {
    [eEthereumNetwork.main]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    [eEthereumNetwork.tenderly]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  },
};

export default EthConfig;
