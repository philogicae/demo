import { QRCodeSVG } from '@akamfoad/qrcode'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

const config = {
  level: 'L' as any,
  padding: 1,
}

const generateQrCode = (data: string) => {
  const qrSVG = new QRCodeSVG(data, config)
  return qrSVG.toDataUrl()
}

const generateQrCodes = (data: string[]) => {
  return data.map((d) => generateQrCode(d))
}

async function downloadQrCodesZip(
  zipName: string,
  tickets: { id: string; data: string; url: string; qrCode: string }[]
) {
  const zip = new JSZip()
  for (let i = 0; i < tickets.length; i++) {
    const fileName = `${zipName}_ticket_${tickets[i].id}.svg`
    zip.file(
      fileName,
      tickets[i].qrCode.substring(tickets[i].qrCode.indexOf(',') + 1),
      {
        base64: true,
      }
    )
  }
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${zipName}.zip`)
}

export { generateQrCode, generateQrCodes, downloadQrCodesZip }
