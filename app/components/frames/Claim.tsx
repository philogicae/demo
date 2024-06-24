'use client'
import { ActionButton } from '@components/elements/Buttons'
import LoaderPage, { Loader } from '@components/elements/Loader'
import { Metadata } from '@components/elements/Metadata'
import Invalid from '@components/frames/Invalid'
import load from '@contracts/loader'
import metadatas from '@contracts/metadatas.json'
import { useCall } from '@hooks/useCall'
import { useTransact } from '@hooks/useTransact'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Snippet,
  useDisclosure,
} from '@nextui-org/react'
import { formatDate } from '@utils/convert'
import { extractFromTicketHash } from '@utils/packing'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import QrSvg from '@wojtekmaj/react-qr-svg'
import { useEffect, useState } from 'react'
import {
  FaArrowLeftLong,
  FaArrowRightLong,
  FaCheck,
  FaLink,
  FaQrcode,
  FaRegCircleCheck,
  FaShareFromSquare,
  FaWallet,
} from 'react-icons/fa6'
import { useNavigate, useParams } from 'react-router-dom'
import { Address, Hex, Signature, encodePacked, keccak256 } from 'viem'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'

const prepare = (obj: any) => {
  return {
    metadataId: Number(obj.metadataId),
    createdAt: formatDate(Number(obj.createdAt)),
    creator: obj.creator,
  }
}

const defaultTicket = {
  chainId: 0,
  content: {
    batchId: BigInt(0),
    batchSecret: '' as Hex,
    ticketSecret: '' as Hex,
    signature: { v: BigInt(0), r: '' as Hex, s: '' as Hex } as Omit<
      Signature,
      'yParity'
    >,
  },
  reservation: '' as Hex,
  ticketId: '' as Hex,
}

export default function Claim() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { open } = useWeb3Modal()
  const { isConnected, address } = useAccount()
  const { switchChain } = useSwitchChain()
  const chainId = useChainId()
  const navigate = useNavigate()
  const { ticket } = useParams()

  useEffect(() => {
    if (ticket)
      extractFromTicketHash(ticket, address).then((decoded) => {
        if (decoded) setLoadedTicket(decoded)
        else
          setLoadedTicket({
            ...defaultTicket,
            chainId: -1,
          })
      })
  }, [ticket, address])

  const [loadedTicket, setLoadedTicket] = useState(defaultTicket)
  const contract = load('TRY26', loadedTicket.chainId)
  const [metadata, setMetadata] = useState({
    data: { name: '' },
    extra: { metadataId: 0 },
  })
  const [reservation, setReservation] = useState('' as Hex | number | boolean)
  const [seconds, setSeconds] = useState(0)
  const [tokenId, setTokenId] = useState(0)

  const { fetch, result } = useCall({
    calls: [
      {
        chainId: loadedTicket.chainId,
        contract: contract!,
        functionName: 'getBatch',
        args: [loadedTicket.content.batchId],
      },
      {
        chainId: loadedTicket.chainId,
        contract: contract!,
        functionName: 'tokenIdByTicketId',
        args: [loadedTicket.ticketId],
      },
      {
        chainId: loadedTicket.chainId,
        contract: contract!,
        functionName: 'getReservation',
        args: [loadedTicket.reservation],
      },
    ],
    initData: [
      {
        getBatch: {
          metadataId: BigInt(0),
          createdAt: BigInt(0),
          creator: '' as Address,
          totalTickets: BigInt(0),
        },
        tokenIdByTicketId: BigInt(0),
        getReservation: BigInt(0),
      },
    ],
  })

  useEffect(() => {
    if (loadedTicket.content.batchId)
      fetch()
        .then((result) => {
          const batch = result.data?.getBatch
          setMetadata(
            !batch.metadataId
              ? {
                  data: { name: 'bad' },
                  extra: { metadataId: 0 },
                }
              : {
                  data: (metadatas as Record<string, any>)[
                    Number(batch.metadataId)
                  ],
                  extra: prepare(batch),
                }
          )
          const timestamp = Number(result.data?.getReservation)
          if (timestamp > 0) {
            const chrono = Math.floor(timestamp - new Date().getTime() / 1000)
            if (chrono > 0) {
              setReservation(timestamp)
              setSeconds(chrono)
            } else if (timestamp > 0) setReservation(true)
          }
        })
        .catch((err) => {
          console.error('Error during call:', err)
        })
  }, [loadedTicket])

  const handleReserve = () => {
    if (!isConnected) open()
    else if (loadedTicket.chainId > 0 && chainId !== loadedTicket.chainId)
      switchChain({ chainId: loadedTicket.chainId })
    else setReservation(loadedTicket.reservation)
  }

  const {
    sendTx: sendTxReserve,
    txLink: txLinkReserve,
    txLogs: txLogsReserve,
    isReadyTx: isReadyTxReserve,
    isLoadingTx: isLoadingTxReserve,
    isPendingTx: isPendingTxReserve,
    isSuccessTx: isSuccessTxReserve,
  } = useTransact({
    chainId: loadedTicket.chainId,
    contract,
    method: 'reserve',
    args: [reservation as Hex],
    enabled: !!reservation && typeof reservation === 'string',
    onSuccess: () => {
      const timestamp = Number((txLogsReserve?.[0].args as any)?.unlock)
      const chrono = Math.floor(timestamp - new Date().getTime() / 1000)
      if (chrono > 0) {
        setReservation(timestamp)
        setSeconds(chrono)
      } else if (timestamp > 0) setReservation(true)
    },
    onError: () => setReservation('' as Hex),
  })

  useEffect(() => {
    if (isReadyTxReserve) sendTxReserve()
  }, [isReadyTxReserve])

  useEffect(() => {
    if (typeof reservation === 'number') {
      if (seconds > 0) {
        const timer = setInterval(() => {
          setSeconds((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(timer)
      } else if (seconds <= 1) {
        setReservation(true)
      }
    }
  }, [reservation, seconds])

  const {
    sendTx,
    txLink,
    txLogs,
    isReadyTx,
    isLoadingTx,
    isPendingTx,
    isSuccessTx,
  } = useTransact({
    chainId: loadedTicket.chainId,
    contract,
    method: 'claim',
    args: [loadedTicket.content],
    enabled: !!address && !!reservation && typeof reservation === 'boolean',
    onSuccess: () => {
      setTokenId(Number((txLogs?.[0].args as any)?.tokenId))
    },
  })

  const handleClaim = () => {
    if (!isConnected) open()
    else if (loadedTicket.chainId > 0 && chainId !== loadedTicket.chainId)
      switchChain({ chainId: loadedTicket.chainId })
    else sendTx()
  }

  if (
    loadedTicket.chainId < 0 ||
    metadata.data?.name === 'bad' ||
    !!result?.tokenIdByTicketId
  )
    return <Invalid />
  if (!loadedTicket.chainId || !metadata.data?.name) return <LoaderPage />

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-4 gap-2">
      {!tokenId ? (
        <div className="flex flex-row bg-white bg-opacity-30 px-3 gap-2 pb-0.5 rounded-lg items-center justify-center">
          <div className="pr-1.5 pt-0.5 text-black">
            <FaRegCircleCheck className="w-5 h-5" />
          </div>
          <Snippet
            symbol=""
            codeString={window.location.href}
            disableTooltip={true}
            classNames={{
              base: 'p-0 bg-transparent text-white',
            }}
          >
            <span className="text-center text-xl text-gray-950 font-bold">
              Valid Ticket
            </span>
          </Snippet>
          <button
            onClick={() => {
              onOpen()
            }}
            className="flex w-5 h-5 items-center justify-center"
          >
            <FaQrcode className="h-5 w-5" />
          </button>
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            classNames={{ base: 'm-2', closeButton: 'text-red-500' }}
          >
            <ModalContent>
              {() => (
                <>
                  <ModalHeader />
                  <ModalBody className="bg-white p-3">
                    <QrSvg value={window.location.href} level="L" margin={1} />
                  </ModalBody>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
      ) : (
        <button
          className="flex flex-row text-center text-xl rounded-lg text-gray-950 bg-white bg-opacity-30 px-2 pb-0.5 font-bold hover:underline button-halo"
          onClick={() => navigate(`/token/${tokenId}`)}
        >
          <div className="pt-1 pr-2 text-black">
            <FaLink />
          </div>
          Token Claimed #{tokenId}
        </button>
      )}
      <div className="flex flex-row py-1 items-center justify-between w-full max-w-xs">
        <ActionButton
          label={
            !isSuccessTxReserve ? (
              seconds > 0 ||
              (typeof reservation === 'boolean' && reservation) ? (
                <div className="flex flex-row">
                  <FaCheck className="mr-1 w-4 h-4" />
                  <span className="text-xs">Reserved</span>
                </div>
              ) : (
                '1. Reserve'
              )
            ) : (
              <a
                className="flex flex-row hover:underline"
                href={txLinkReserve}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLink className="mr-1 w-4 h-4" />
                <span className="text-xs">Confirmed</span>
              </a>
            )
          }
          isActive={
            !!metadata?.extra.metadataId &&
            !isLoadingTxReserve &&
            !isPendingTxReserve &&
            !isSuccessTxReserve &&
            !reservation
          }
          isIdle={
            isSuccessTxReserve ||
            seconds > 0 ||
            (typeof reservation === 'boolean' && reservation)
          }
          isLoading={isLoadingTxReserve}
          onClick={!isSuccessTxReserve ? handleReserve : () => {}}
        />
        {isLoadingTxReserve ||
        isLoadingTx ||
        (typeof reservation === 'boolean' && reservation && !isReadyTx) ? (
          <FaWallet className="w-5 h-5" />
        ) : isPendingTxReserve || isPendingTx ? (
          <Loader size={30} color="white" />
        ) : isSuccessTx ? (
          <div className="px-1 text-white">
            <FaRegCircleCheck className="w-5 h-5" />
          </div>
        ) : isReadyTx ? (
          <FaArrowRightLong />
        ) : seconds > 0 ? (
          <span className="text-xl font-bold border-1 rounded-3xl px-1 border-black bg-white text-black w-8 text-center">
            {seconds}
          </span>
        ) : (
          <FaArrowLeftLong />
        )}
        <ActionButton
          label={
            !isSuccessTx ? (
              '2. Claim'
            ) : (
              <a
                className="flex flex-row hover:underline"
                href={txLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLink className="mr-1 w-4 h-4" />
                <span className="text-xs">Confirmed</span>
              </a>
            )
          }
          isActive={
            typeof reservation === 'boolean' &&
            reservation &&
            !isLoadingTx &&
            !isPendingTx &&
            !isSuccessTx
          }
          isIdle={isSuccessTx}
          isLoading={isLoadingTx}
          onClick={() => (!isSuccessTx ? handleClaim() : () => {})}
        />
      </div>
      <Metadata
        data={metadata.data}
        id={tokenId ? `${tokenId}` : undefined}
        extra={{
          owner: !tokenId ? '-' : address,
          batchId: Number(loadedTicket.content.batchId),
          ticketId: `${loadedTicket.ticketId.slice(0, 20)}...${loadedTicket.ticketId.slice(-21, -1)}`,
          ...metadata.extra,
        }}
      ></Metadata>
    </div>
  )
}
