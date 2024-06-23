'use client'
import Claim from '@components/frames/Claim'
import Create from '@components/frames/Create'
import Error from '@components/frames/Error'
import Loading from '@components/frames/Loading'
import Token from '@components/frames/Token'
import Welcome from '@components/frames/Welcome'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { RouterProvider, createHashRouter, redirect } from 'react-router-dom'

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
