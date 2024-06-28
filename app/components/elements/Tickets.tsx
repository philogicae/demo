'use client'
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Snippet,
  useDisclosure,
} from '@nextui-org/react'
import QrSvg from '@wojtekmaj/react-qr-svg'
import { useState } from 'react'
import { FaQrcode, FaShareFromSquare } from 'react-icons/fa6'

export function Tickets({
  batchId,
  tickets,
}: {
  batchId: number
  tickets: { id: string; data: string; url: string }[]
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [currentTicket, setCurrentTicket] = useState(1)
  return (
    <Card className="w-full max-w-xs text-white bg-opacity-10 items-center justify-center">
      <CardHeader className="flex items-center justify-center">
        <Snippet
          symbol=""
          codeString={tickets.map(({ id, url }) => `${id}: ${url}`).join('\n')}
          tooltipProps={{
            color: 'foreground',
            content: 'Copy all tickets',
          }}
          classNames={{
            base: 'p-0 bg-transparent text-white',
          }}
        >
          <span className="text-lg font-bold">{`Ticket Batch #${batchId}`}</span>
        </Snippet>
      </CardHeader>
      <Divider className="bg-opacity-30 bg-white" />
      <CardBody className="flex text-sm overflow-hidden items-center justify-center">
        {tickets.map((ticket, index) => (
          <div
            key={`ticket-${ticket.id}`}
            className="flex flex-row justify-start items-center gap-2"
          >
            <Snippet
              symbol=""
              codeString={ticket.url}
              disableTooltip={true}
              classNames={{
                base: 'p-0 bg-transparent text-white',
              }}
            >
              {`${ticket.id}: ${ticket.data.slice(0, 6)}...${ticket.data.slice(-6)}`}
            </Snippet>
            <button
              type="button"
              className="flex w-5 h-5 items-center justify-center pr-1"
              onClick={() =>
                navigator.share({
                  title: `TRY26 - B${batchId}${batchId}-${ticket.id}`,
                  text: ticket.url,
                })
              }
            >
              <FaShareFromSquare className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentTicket(index + 1)
                onOpen()
              }}
              className="flex w-5 h-5 items-center justify-center"
            >
              <FaQrcode className="h-5 w-5" />
            </button>
          </div>
        ))}
      </CardBody>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        placement="center"
        classNames={{ base: 'm-2', closeButton: 'text-red-500' }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-row py-2 pr-10 items-center">
                <span className="text-xl text-black font-bold">
                  {`TRY26 - B${batchId}${tickets.at(currentTicket - 1)?.id!}`}
                </span>
              </ModalHeader>
              <ModalBody className="bg-white p-3">
                <QrSvg
                  value={tickets.at(currentTicket - 1)?.url!}
                  level="L"
                  margin={1}
                />
              </ModalBody>
              <ModalFooter className="flex flex-row p-2 items-center justify-center">
                <Pagination
                  loop
                  showControls
                  isCompact
                  size="sm"
                  color="default"
                  total={tickets.length}
                  page={currentTicket}
                  onChange={setCurrentTicket}
                />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Card>
  )
}
