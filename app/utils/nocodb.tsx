import { Api } from 'nocodb-sdk'

if (!process.env.NEXT_PUBLIC_NOCODB_API_KEY)
  throw new Error('NEXT_PUBLIC_NOCODB_API_KEY is not defined')
export const nocodbApiKey = process.env.NEXT_PUBLIC_NOCODB_API_KEY

const api = new Api({
  baseURL: 'https://nocodb.aleph.world',
  headers: {
    'xc-token': nocodbApiKey,
  },
})
const orgs = 'noco'
const baseName = 'pu6rxfhji7e5vqo'
const tableName = 'mr15cv28fr4oo01'

export const addTicketRows = (tickets: any) => {
  api.dbTableRow
    .bulkCreate(orgs, baseName, tableName, tickets)
    .then(console.log)
    .catch(console.error)
}

export const updateTicketRow = async ({
  id,
  ticket,
}: { id: string; ticket: any }) => {
  api.dbTableRow
    .findOne(orgs, baseName, tableName, {
      fields: ['Id', 'Ticket Id', 'Batch Id', 'Metadata Id', 'URL'],
      where: `(Ticket Id,eq,${id})`,
    })
    .then((row: any) => {
      api.dbTableRow
        .update(orgs, baseName, tableName, row.Id, ticket, {
          getHiddenColumn: false,
        })
        .then(console.log)
        .catch(console.error)
    })
}
