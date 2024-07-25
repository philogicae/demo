const { encodePacked, keccak256 } = require('viem')
const { decode } = require('base64-compressor')
const cryptojs = require('crypto-js')
const fs = require('node:fs')
const Papa = require('papaparse')

const old_tickets_csv = './app/utils/migrator/tickets.csv'
const new_tickets_txt = './app/utils/migrator/newTickets.txt'
const legacy_tickets_json = './app/utils/migrator/legacyTickets.json'

function encrypt(message, secretKey) {
  return cryptojs.AES.encrypt(message, secretKey).toString()
}

/* function decrypt(encryptedMessage, secretKey) {
  return cryptojs.AES.decrypt(encryptedMessage, secretKey).toString(
    cryptojs.enc.Utf8
  )
} */

async function extractFromTicketHash(ticket) {
  const decoded = await decode(ticket)
  const unwrapped = decoded.split(':')
  const chainId = Number(unwrapped[0])
  const data = unwrapped[1].split('.')
  const batchId = Number(data[0])
  const batchSecret = `0x${data[1].slice(0, 64)}`
  const ticketSecret = `0x${data[1].slice(64, 128)}`
  const id = keccak256(
    encodePacked(['bytes32', 'bytes32'], [batchSecret, ticketSecret])
  )
  return {
    id,
    chainId,
    batchId,
    batchSecret,
    ticketSecret,
  }
}

async function extract_old_tickets() {
  console.log('Extracting old tickets...')
  try {
    const data = fs.readFileSync(old_tickets_csv, 'utf8')
    const content = Papa.parse(data)
    const filteredPromises = content.data.slice(1).map(async (row) => {
      try {
        const ticket = row[4].split('#/ticket/')[1]
        const decoded = await extractFromTicketHash(ticket)
        if (row[0] === decoded.id) return { ...decoded, ticket }
      } catch (error) {
        console.error(`Error decoding ticket ${row[0]}:`, error)
      }
    })
    const filtered = (await Promise.all(filteredPromises)).filter(
      (item) => item !== undefined
    )
    const mapped = {}
    filtered.map((item) => {
      const { id, batchId, batchSecret, ticketSecret, ticket } = item
      if (!mapped[batchId])
        mapped[batchId] = {
          batchSecret,
          ticketSecrets: [],
          tickets: {},
        }
      mapped[batchId].ticketSecrets.push(ticketSecret)
      mapped[batchId].tickets[id] = { oldCode: ticket }
    })
    fs.writeFileSync(legacy_tickets_json, JSON.stringify(mapped))
    console.log('Total processed: ', filtered.length)
  } catch (error) {
    console.error('Error while processing CSV data:', error)
  }
}

async function extract_new_tickets() {
  console.log('Extracting new tickets...')
  try {
    const data = fs.readFileSync(new_tickets_txt, 'utf8')
    const content = data.split('\r\n').map((row) => row.split('#/ticket/')[1])
    const filteredPromises = content.map(async (ticket) => {
      try {
        const decoded = await extractFromTicketHash(ticket)
        return { ...decoded, ticket }
      } catch (error) {
        console.error(`Error decoding ticket ${row[0]}:`, error)
      }
    })
    const filtered = (await Promise.all(filteredPromises)).filter(
      (item) => item !== undefined
    )
    const legacyTickets = fs.readFileSync(legacy_tickets_json, 'utf8')
    const mapped = JSON.parse(legacyTickets)
    filtered.map((item) => {
      const { id, batchId, batchSecret, ticketSecret, ticket } = item
      if (!mapped[batchId])
        mapped[batchId] = {
          batchSecret,
          ticketSecrets: [],
          tickets: {},
        }
      mapped[batchId].ticketSecrets.push(ticketSecret)
      mapped[batchId].tickets[id] = {
        ...mapped[batchId].tickets[id],
        newCode: ticket,
      }
    })
    fs.writeFileSync(legacy_tickets_json, JSON.stringify(mapped))
    console.log('Total processed: ', filtered.length)
  } catch (error) {
    console.error('Error while processing TXT data:', error)
  }
}

function build_legacy_tickets() {
  console.log('Building legacy tickets...')
  try {
    const data = fs.readFileSync(legacy_tickets_json, 'utf8')
    const content = JSON.parse(data)
    const result = {}
    for (const [_batchId, batch] of Object.entries(content)) {
      const { tickets } = batch
      for (const [id, ticket] of Object.entries(tickets)) {
        const { newCode, oldCode } = ticket
        if (!newCode || !oldCode) continue
        result[id] = encrypt(newCode, oldCode)
      }
    }
    fs.writeFileSync(legacy_tickets_json, JSON.stringify(result))
    console.log('Total processed: ', Object.keys(result).length)
  } catch (error) {
    console.error('Error while processing JSON data:', error)
  }
}

function showMenu() {
  console.log('Select an option:')
  console.log('1. Extract old tickets')
  console.log('2. Extract new tickets')
  console.log('3. Build legacy tickets\n')
  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', async (choice) => {
    c = choice.trim()
    switch (c) {
      case '1':
        await extract_old_tickets()
        break
      case '2':
        await extract_new_tickets()
        break
      case '3':
        build_legacy_tickets()
        break
      default:
        console.log('Invalid choice. Please try again.')
        break
    }
    process.stdin.pause()
    process.exit()
  })
}
showMenu()
