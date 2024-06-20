/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')

const directoryPath = 'public/sbt/metadata/'
const outputPath = 'app/contracts/metadatas.json'

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err)
    return
  }

  const filePromises = files.map((file) => {
    if (path.extname(file) === '.json') {
      const filePath = path.join(directoryPath, file)
      return fs.promises.readFile(filePath, 'utf8').then((data) => {
        const id = path.basename(file, '.json')
        return { [id]: JSON.parse(data) }
      })
    }
    return Promise.resolve({})
  })

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
})
