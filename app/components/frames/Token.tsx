'use client'
import { useParams } from 'react-router-dom'

export default function Token() {
    const { id } = useParams()
    return <>{id}</>}