/* eslint-disable @typescript-eslint/no-var-requires */
const { Deployer } = require('./deployer.js')

async function main() {
  await Deployer('TRY26')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
