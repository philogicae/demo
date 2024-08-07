/* eslint-disable @typescript-eslint/no-var-requires */
const { ethers } = require('hardhat')
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
const fs = require('fs')
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
const path = require('path')
require('dotenv').config()

const dest = 'app/contracts'
const abis = path.join(dest, 'abis')
if (!fs.existsSync(abis)) {
  fs.mkdirSync(abis, { recursive: true })
}
const registry = path.join(dest, 'registry.json')
if (!fs.existsSync(registry)) {
  fs.writeFileSync(registry, '{}', 'utf-8')
}

function saveABI(contractName) {
  const abi = path.join(
    `artifacts/contracts/${contractName}.sol/${contractName}.json`
  )
  fs.copyFileSync(abi, path.join(abis, `${contractName}.json`))
}

function saveAddress(contractName, chainId, address) {
  const data = JSON.parse(fs.readFileSync(registry, 'utf-8'))
  if (!data[contractName]) data[contractName] = { [chainId]: address }
  else data[contractName][chainId] = address
  fs.writeFileSync(registry, JSON.stringify(data, null, 2), 'utf-8')
}

async function Deployer(contractName, ...args) {
  console.log(`Deploying ${contractName}...`)
  const contract = await ethers.deployContract(contractName, ...args)
  await contract.waitForDeployment()
  console.log(`${contractName} deployed to: ${contract.target}`)
  saveABI(contractName)
  saveAddress(
    contractName,
    (await ethers.provider.getNetwork()).chainId,
    contract.target
  )
  return contract.target
}

exports.Deployer = Deployer
