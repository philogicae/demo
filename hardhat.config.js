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
    sepolia: {
      url: 'https://eth-sepolia.public.blastapi.io',
      accounts: [process.env.TEST_PRIVATE_KEY],
    },
    avalanche: {
      url: 'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc',
      accounts: [process.env.TEST_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },
}
