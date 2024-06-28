'use client'
import Error404 from '@components/frames/Error'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Custom404() {
  const router = useRouter()
  useEffect(() => {
    if (!(window.location.pathname + window.location.hash).startsWith('/#/'))
      router.replace('/#/404')
  }, [router])
  return <Error404 />
}
