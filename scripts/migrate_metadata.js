/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')

const directoryPath = 'public/sbt/metadata/'
const outputPath = 'app/contracts/metadatas.json'
const outputTestPath = 'app/contracts/metadatas-test.json'

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err)
    return
  }

  const filePromises = files.map((file) => {
    if (path.extname(file) === '.json') {
      const filePath = path.join(directoryPath, file)
      return fs.promises.readFile(filePath, 'utf8').then((data) => {
        const content = JSON.parse(data)
        const id = path.basename(file, '.json')
        return { [id]: content }
      })
    }
    return Promise.resolve({})
  })

  // Prod
  Promise.all(filePromises)
    .then((results) => {
      const combinedJson = Object.assign({}, ...results)
      return fs.promises.writeFile(
        outputPath,
        JSON.stringify(combinedJson, null, 2)
      )
    })
    .then(() => {
      console.log('Metadatas JSON updated successfully')
    })
    .catch((err) => {
      console.error('Error updating Metadatas JSON:', err)
    })

  // Test
  Promise.all(filePromises)
    .then((results) => {
      const combinedJson = Object.assign({}, ...results)
      return fs.promises.writeFile(
        outputTestPath,
        JSON.stringify(combinedJson, null, 2).replaceAll(
          'https://claim.twentysix.cloud',
          'http://localhost:3000'
        )
      )
    })
    .then(() => {
      console.log('Metadatas-test JSON updated successfully')
    })
    .catch((err) => {
      console.error('Error updating Metadatas-test JSON:', err)
    })
})
