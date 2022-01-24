import { eFantomNetwork, IFantomConfiguration } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategyDAI,
  strategyUSDC,
  strategyUSDT,
  strategyYVWFTM,
  strategyMOOWETH,
} from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

// noinspection SpellCheckingInspection
export const FantomConfig: IFantomConfiguration = {
  ...CommonsConfig,
  MarketId: 'Fantom market',
  ProviderId: 2,
  ReservesConfig: {
    DAI: strategyDAI,
    USDC: strategyUSDC,
    fUSDT: strategyUSDT,
    yvWFTM: strategyYVWFTM,
    mooWETH: strategyMOOWETH,
  },
  ReserveAssets: {
    [eFantomNetwork.ftm]: {
      DAI: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E',
      USDC: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
      fUSDT: '0x049d68029688eAbF473097a2fC38ef61633A3C7A',
      yvWFTM: '0x0DEC85e74A92c52b7F708c4B10207D9560CEFaf0',
      mooWETH: '0x0a03D2C1cFcA48075992d810cc69Bd9FE026384a',
    },
    [eFantomNetwork.ftm_test]: {
      DAI: '0x9440c3bB6Adb5F0D5b8A460d8a8c010690daC2E8',
      USDC: '0x8f785910e0cc96f854450DFb53be6492daff0b15',
      fUSDT: '0x211554151F2f00305f33530Fdd3a5d0354927A65',
      yvWFTM: '0xD98FeDef0308A85F30f3082F605a1DFa76437608'
    },
    [eFantomNetwork.tenderlyFTM]: {
      DAI: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E',
      USDC: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
      yvWFTM: '0x0DEC85e74A92c52b7F708c4B10207D9560CEFaf0',
      mooWETH: '0x0a03D2C1cFcA48075992d810cc69Bd9FE026384a',
      fUSDT: '0x049d68029688eAbF473097a2fC38ef61633A3C7A',
    },
  },
  YearnVaultFTM: {
    [eFantomNetwork.ftm]: '0x0DEC85e74A92c52b7F708c4B10207D9560CEFaf0',
    [eFantomNetwork.ftm_test]: '0xD98FeDef0308A85F30f3082F605a1DFa76437608',
    [eFantomNetwork.tenderlyFTM]: '0x0DEC85e74A92c52b7F708c4B10207D9560CEFaf0',
  },
  BeefyVaultFTM: {
    [eFantomNetwork.ftm]: '0x0a03D2C1cFcA48075992d810cc69Bd9FE026384a',
    [eFantomNetwork.tenderlyFTM]: '0x0a03D2C1cFcA48075992d810cc69Bd9FE026384a',
  },
  UniswapRouter: {
    [eFantomNetwork.ftm]: '0xF491e7B69E4244ad4002BC14e878a34207E38c29',
    [eFantomNetwork.ftm_test]: '0xcCAFCf876caB8f9542d6972f87B5D62e1182767d',
    [eFantomNetwork.tenderlyFTM]: '0xF491e7B69E4244ad4002BC14e878a34207E38c29',
  },
};

export default FantomConfig;
