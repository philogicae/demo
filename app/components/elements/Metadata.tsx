'use client'
//import load from '@contracts/loader'
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Image,
  Snippet,
} from '@nextui-org/react'
import { formatDate } from '@utils/convert'
import font from '@utils/fonts'
import { cn } from '@utils/tw'
//import { FaShareFromSquare } from 'react-icons/fa6'
import { useChainId } from 'wagmi'

export function Metadata({
  data,
  id,
  extra,
}: {
  data: any
  id?: string
  extra?: Record<string, any>
}) {
  //const chainId = useChainId()
  //const contract = load('TRY26', chainId)
  //const opensea_url = `https://${chainId === 43114 ? 'opensea.io/assets/avalanche' : 'testnets.opensea.io/assets/sepolia'}/${contract?.address}/${id}`
  const title = data.name.split(' - ')
  const external_url = `/#${data.external_url.split('#')[1]}`
  return (
    <Card className="w-full max-w-xs text-purple bg-grain">
      <CardHeader className="flex items-center justify-between">
        <div className="w-[90px] h-[90px] items-center justify-center overflow-visible">
          <Image
            src={`/sbt${data.image.split('sbt')[1]}`}
            alt="Cover"
            radius="sm"
            width={90}
            height={90}
          />
        </div>
        <div className="flex flex-col items-end justify-center h-[90px] pl-3 pr-1">
          <span className="text-lg font-extrabold text-right">{title[0]}</span>
          <span className="text-lg font-bold text-right max-w-36">
            {title[1]}
          </span>
        </div>
      </CardHeader>
      <Divider className="bg-white" />
      <CardBody className="flex text-sm overflow-hidden font-semibold">
        <p className="italic font-semibold text-center">{data.description}</p>
        <Divider className="bg-opacity-30 bg-white my-2" />
        <div className="flex flex-row justify-between items-center">
          <span className="font-bold">Image Ref</span>
          <span>{data.image.split('cover/')[1].split('.')[0]}</span>
        </div>
        <div className="flex flex-row justify-between items-center">
          <span className="font-bold">External URL</span>
          <span>{!id ? external_url : external_url.replace('{id}', id)}</span>
        </div>
        {data.attributes.length > 0 ? (
          <div>
            <Divider className="bg-white my-2" />
            <div className="gap-2">
              {data.attributes.map((attribute: any) => (
                <div
                  key={attribute.trait_type}
                  className="flex flex-row justify-between items-center"
                >
                  <span className="font-bold">{attribute.trait_type}</span>
                  {attribute.display_type === 'date' ? (
                    <span>{formatDate(attribute.value)}</span>
                  ) : (
                    <span>{attribute.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {extra && Object.keys(extra).length > 0 ? (
          <div>
            <Divider className="bg-white my-2" />
            <div className="gap-2">
              {Object.entries(extra).map((item: any) => (
                <div
                  key={item[0]}
                  className="flex flex-row justify-between items-center"
                >
                  <span className="font-bold">
                    {item[0].at(0).toUpperCase() + item[0].slice(1)}
                  </span>
                  {item[1].toString().length > 24 ? (
                    <Snippet
                      symbol=""
                      codeString={item[1]}
                      disableTooltip={true}
                      classNames={{
                        base: 'p-0 bg-transparent text-purple h-5 gap-0',
                        copyButton: 'justify-end !min-w-6 w-6',
                      }}
                    >
                      <span className={cn('font-semibold', font.className)}>
                        {`${item[1].toString().slice(0, 8)}...${item[1].toString().slice(-6)}`}
                      </span>
                    </Snippet>
                  ) : (
                    item[1]
                  )}
                </div>
              ))}
            </div>
            {/* TODO: Fix Opensea
            {Number(id) > 0 ? (
              <>
                <Divider className="bg-white my-2" />
                <div className="flex flex-row justify-between items-center">
                  <span className="font-bold">Opensea URL</span>
                  <a
                    className="flex w-5 h-5 items-center justify-end"
                    href={opensea_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaShareFromSquare className="h-4 w-4" />
                  </a>
                </div>
              </>
            ) : (
              ''
            )} */}
          </div>
        ) : null}
      </CardBody>
    </Card>
  )
}
