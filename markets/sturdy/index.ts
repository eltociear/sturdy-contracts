import { ISturdyConfiguration, eEthereumNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategyDAI,
  strategyUSDC,
  strategySTETH,
  strategyYVRETH_WSTETH,
  strategyCVXRETH_WSTETH,
  strategyCVXFRAX_3CRV,
  strategyCVXSTECRV,
  strategyCVXDOLA_3CRV,
  strategyUSDT,
  strategyCVXMIM_3CRV,
  strategyCVXDAI_USDC_USDT_SUSD,
  strategyCVXHBTC_WBTC,
} from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const SturdyConfig: ISturdyConfiguration = {
  ...CommonsConfig,
  MarketId: 'Sturdy genesis market',
  ProviderId: 1,
  ReservesConfig: {
    DAI: strategyDAI,
    USDC: strategyUSDC,
    USDT: strategyUSDT,
    stETH: strategySTETH,
    yvRETH_WSTETH: strategyYVRETH_WSTETH,
    cvxRETH_WSTETH: strategyCVXRETH_WSTETH,
    cvxFRAX_3CRV: strategyCVXFRAX_3CRV,
    cvxSTECRV: strategyCVXSTECRV,
    cvxDOLA_3CRV: strategyCVXDOLA_3CRV,
    cvxMIM_3CRV: strategyCVXMIM_3CRV,
    cvxDAI_USDC_USDT_SUSD: strategyCVXDAI_USDC_USDT_SUSD,
    cvxHBTC_WBTC: strategyCVXHBTC_WBTC,
  },
  ReserveAssets: {
    [eEthereumNetwork.buidlerevm]: {},
    [eEthereumNetwork.hardhat]: {},
    [eEthereumNetwork.geth]: {},
    [eEthereumNetwork.localhost]: {},
    [eEthereumNetwork.coverage]: {},
    [eEthereumNetwork.kovan]: {
      DAI: '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD',
      USDC: '0xe22da380ee6B445bb8273C81944ADEB6E8450422',
    },
    [eEthereumNetwork.ropsten]: {
      DAI: '0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108',
      USDC: '0x851dEf71f0e6A903375C1e536Bd9ff1684BAD802',
    },
    [eEthereumNetwork.main]: {
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      stETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      // yvRETH_WSTETH: '0x5c0A86A32c129538D62C106Eb8115a8b02358d57',      
      // cvxRETH_WSTETH: '', //'0xA22B79730CBEA3426CA0AA9597Cbe053460667E3',
      cvxFRAX_3CRV: '0x001dfC794bf68c47fEC0A3F031c710E71318FA2a',
      // cvxSTECRV: '', //'0xA22B79730CBEA3426CA0AA9597Cbe053460667E3',
      // cvxDOLA_3CRV: '', //'0xA0ecbe4a0e87b1559C962bb6E1F46286D41394Bf',
      cvxMIM_3CRV: '0xA0ecbe4a0e87b1559C962bb6E1F46286D41394Bf',
      cvxDAI_USDC_USDT_SUSD: '0xE72aAEEFA3821594c1D7fe2aB81361F0eC9e6e3e',
      cvxHBTC_WBTC: '',
    },
    [eEthereumNetwork.tenderly]: {
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      stETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      // yvRETH_WSTETH: '0x5c0A86A32c129538D62C106Eb8115a8b02358d57',
      // cvxRETH_WSTETH: '', //'0xA22B79730CBEA3426CA0AA9597Cbe053460667E3',
      cvxFRAX_3CRV: '0x001dfC794bf68c47fEC0A3F031c710E71318FA2a',
      // cvxSTECRV: '', //'0xA22B79730CBEA3426CA0AA9597Cbe053460667E3',
      // cvxDOLA_3CRV: '', //'0xA0ecbe4a0e87b1559C962bb6E1F46286D41394Bf',
      cvxMIM_3CRV: '0xA0ecbe4a0e87b1559C962bb6E1F46286D41394Bf',
      cvxDAI_USDC_USDT_SUSD: '0xE72aAEEFA3821594c1D7fe2aB81361F0eC9e6e3e',
      cvxHBTC_WBTC: '',
    },
    [eEthereumNetwork.goerli]: {
      DAI: '0x3c189008333eeDA351Df6C601cf6Da7C1BC4Df1A',
      USDC: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
      stETH: '0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F',
    },
  },
  Lido: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    [eEthereumNetwork.tenderly]: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    [eEthereumNetwork.goerli]: '0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F',
  },
  WSTETH: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    [eEthereumNetwork.tenderly]: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    [eEthereumNetwork.goerli]: '',
  },
  CRV: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    [eEthereumNetwork.tenderly]: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    [eEthereumNetwork.goerli]: '',
  },
  CVX: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
    [eEthereumNetwork.tenderly]: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
    [eEthereumNetwork.goerli]: '',
  },
  RETH_WSTETH_LP: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0x447Ddd4960d9fdBF6af9a790560d0AF76795CB08',
    [eEthereumNetwork.tenderly]: '0x447Ddd4960d9fdBF6af9a790560d0AF76795CB08',
    [eEthereumNetwork.goerli]: '',
  },
  FRAX_3CRV_LP: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
    [eEthereumNetwork.tenderly]: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
    [eEthereumNetwork.goerli]: '',
  },
  STECRV_LP: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0x06325440D014e39736583c165C2963BA99fAf14E',
    [eEthereumNetwork.tenderly]: '0x06325440D014e39736583c165C2963BA99fAf14E',
    [eEthereumNetwork.goerli]: '',
  },
  DOLA_3CRV_LP: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0xAA5A67c256e27A5d80712c51971408db3370927D',
    [eEthereumNetwork.tenderly]: '0xAA5A67c256e27A5d80712c51971408db3370927D',
    [eEthereumNetwork.goerli]: '',
  },
  MIM_3CRV_LP: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
    [eEthereumNetwork.tenderly]: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
    [eEthereumNetwork.goerli]: '',
  },
  DAI_USDC_USDT_SUSD_LP: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0xC25a3A3b969415c80451098fa907EC722572917F',
    [eEthereumNetwork.tenderly]: '0xC25a3A3b969415c80451098fa907EC722572917F',
    [eEthereumNetwork.goerli]: '',
  },
  HBTC_WBTC_LP: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0xb19059ebb43466C323583928285a49f558E572Fd',
    [eEthereumNetwork.tenderly]: '0xb19059ebb43466C323583928285a49f558E572Fd',
    [eEthereumNetwork.goerli]: '',
  },
  YearnRETHWstETHVault: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0x5c0A86A32c129538D62C106Eb8115a8b02358d57',
    [eEthereumNetwork.tenderly]: '0x5c0A86A32c129538D62C106Eb8115a8b02358d57',
    [eEthereumNetwork.goerli]: '',
  },
  CurveswapLidoPool: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    [eEthereumNetwork.tenderly]: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    [eEthereumNetwork.goerli]: '0xCEB67769c63cfFc6C8a6c68e85aBE1Df396B7aDA',
  },
  UniswapRouter: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    [eEthereumNetwork.tenderly]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    [eEthereumNetwork.goerli]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  },
  CurveswapAddressProvider: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0x0000000022D53366457F9d5E68Ec105046FC4383',
    [eEthereumNetwork.tenderly]: '0x0000000022D53366457F9d5E68Ec105046FC4383',
    [eEthereumNetwork.goerli]: '0x0000000022D53366457F9d5E68Ec105046FC4383',
  },
  AavePool: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.geth]: '',
    [eEthereumNetwork.localhost]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '0x7937D4799803FbBe595ed57278Bc4cA21f3bFfCB',
    [eEthereumNetwork.tenderly]: '0x7937D4799803FbBe595ed57278Bc4cA21f3bFfCB',
    [eEthereumNetwork.goerli]: '',
  },
};

export default SturdyConfig;
