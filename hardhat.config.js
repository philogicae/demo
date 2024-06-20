/* eslint-disable @typescript-eslint/no-var-requires */
require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'hardhat',
  solidity: {
    version: '0.8.26',
    settings: {
      evmVersion: 'cancun',
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  sourcify: {
    enabled: false,
  },
  networks: {
    avalanche: {
      url:
        'https://avalanche-mainnet.infura.io/v3/' +
        process.env.NEXT_PUBLIC_INFURA_ID,
      accounts: [process.env.TEST_PRIVATE_KEY],
    },
    sepolia: {
      url: 'https://eth-sepolia.public.blastapi.io',
      accounts: [process.env.TEST_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },
}
