/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

type AppStateType = {
  mobile: boolean
  setMobile: Dispatch<SetStateAction<boolean>>
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
}

const defaultAppState: AppStateType = {
  mobile: false,
  setMobile: (value: SetStateAction<boolean>) => {},
  loading: false,
  setLoading: (value: SetStateAction<boolean>) => {},
}

const AppContext = createContext(defaultAppState)

export default function AppState({ children }: { children: React.ReactNode }) {
  const layout = useRef<HTMLDivElement>(null)
  const [mobile, setMobile] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  useEffect(() => {
    const updatedWidth = () => setMobile(layout.current!.offsetWidth < 560)
    updatedWidth()
    return () => window.removeEventListener('resize', updatedWidth)
  }, [])
  return (
    <div ref={layout} className="w-full h-full">
      <AppContext.Provider
        value={{
          mobile,
          setMobile,
          loading,
          setLoading,
        }}
      >
        {children}
      </AppContext.Provider>
    </div>
  )
}

export const useAppState = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState was called outside AppState')
  }
  return context
}
