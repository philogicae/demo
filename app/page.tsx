'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createHashRouter, RouterProvider, redirect } from 'react-router-dom'
import Loading from '@components/frames/Loading'
import Error from '@components/frames/Error'
import Welcome from '@components/frames/Welcome'
import Create from '@components/frames/Create'
import Claim from '@components/frames/Claim'
import Token from '@components/frames/Token'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    if (window.location.pathname + window.location.hash === '/')
      router.replace('/#/')
  }, [router])
  const hashRouter = createHashRouter([
    {
      path: '',
      element: <Welcome />,
    },
    {
      path: 'create',
      element: <Create />,
    },
    {
      path: 'claim/:ticket',
      element: <Claim />,
    },
    {
      path: 'token/:id',
      element: <Token />,
    },
    { path: '404', element: <Error /> },
    { path: '*', loader: async () => redirect('404') },
  ])
  return (
    <RouterProvider
      router={hashRouter}
      fallbackElement={<Loading />}
      future={{ v7_startTransition: true }}
    />
  )
}
