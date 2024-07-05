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
const base = 'pu6rxfhji7e5vqo'
const table_prod = 'mr15cv28fr4oo01'
const table_test = 'mcz2v39pid4bkuv'

export const addTicketRows = (tickets: any, isTest = false) => {
  const table = !isTest ? table_prod : table_test
  api.dbTableRow
    .bulkCreate(orgs, base, table, tickets)
    .then(console.log)
    .catch(console.error)
}

export const updateTicketRow = async ({
  id,
  ticket,
  isTest = false,
}: { id: string; ticket: any; isTest?: boolean }) => {
  const table = !isTest ? table_prod : table_test
  api.dbTableRow
    .findOne(orgs, base, table, {
      fields: ['Id', 'Ticket Id', 'Batch Id', 'Metadata Id', 'URL'],
      where: `(Ticket Id,eq,${id})`,
    })
    .then((row: any) => {
      api.dbTableRow
        .update(orgs, base, table, row.Id, ticket, {
          getHiddenColumn: false,
        })
        .then(console.log)
        .catch(console.error)
    })
}
