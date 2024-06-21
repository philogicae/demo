import { Image, Divider, Card, CardHeader, CardBody } from '@nextui-org/react'
import { cn } from '@utils/tw'
import { formatDate } from '@utils/convert'

export function Metadata({
  data,
  id,
  extra,
}: {
  data: any
  id?: string
  extra?: Record<string, any>
}) {
  const title = data.name.split(' - ')
  const external_url = '/#' + data.external_url.split('#')[1]
  return (
    <Card className="w-full max-w-xs !h-full text-white bg-opacity-10">
      <CardHeader className="flex items-center justify-between">
        <div className="w-[90px] h-[90px] items-center justify-center overflow-visible">
          <Image
            src={'/sbt' + data.image.split('sbt')[1]}
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
      <Divider className="bg-opacity-30 bg-white" />
      <CardBody className="flex text-sm overflow-hidden">
        <p className="italic font-semibold">{data.description}</p>
        <Divider className="bg-opacity-30 bg-white my-2" />
        <div className="flex flex-row justify-between items-center">
          <span className="font-bold">Image ID</span>
          <span>{data.image.split('cover/')[1].split('.')[0]}</span>
        </div>
        <div className="flex flex-row justify-between items-center">
          <span className="font-bold">External URL</span>
          <span>{!id ? external_url : external_url.replace('{id}', id)}</span>
        </div>
        {data.attributes.length > 0 ? (
          <div>
            <Divider className="bg-opacity-30 bg-white my-2" />
            <div className="gap-2">
              {data.attributes.map((attribute: any, index: number) => (
                <div
                  key={`attribute-${index}`}
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
            <Divider className="bg-opacity-30 bg-white my-2" />
            <div className="gap-2">
              {Object.entries(extra).map((item: any, index: number) => (
                <div
                  key={`extra-${index}`}
                  className="flex flex-row justify-between items-center"
                >
                  <span className="font-bold">
                    {item[0].at(0).toUpperCase() + item[0].slice(1)}
                  </span>
                  <span
                    className={cn(
                      typeof item[1] !== 'number' && item[1].length > 30
                        ? 'text-[10px]'
                        : ''
                    )}
                  >
                    {item[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  )
}
