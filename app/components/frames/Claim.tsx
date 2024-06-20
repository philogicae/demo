'use client'
import { useParams } from 'react-router-dom'

export default function Claim() {
    const { ticket } = useParams()
    return <>{ticket}</>}