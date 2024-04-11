"use client"
import {createContext, FC, ReactNode, useState} from "react";

export interface IBridgeContext {
  bridgeA: string
  bridgeB: string
  setBridgeA: (value: string) => void
  setBridgeB: (value: string) => void
  updateA: boolean
  updateB: boolean
  setUpdateA: (value: boolean) => void
  setUpdateB: (value: boolean) => void
}

export const BridgeContext = createContext<IBridgeContext | null>(null)

const ContextProvider: FC<{children: ReactNode}> = ({children}) => {
  const [bridgeA, setBridgeA] = useState<string>("")
  const [bridgeB, setBridgeB] = useState<string>("")

  const [updateA, setUpdateA] = useState<boolean>(false)
  const [updateB, setUpdateB] = useState<boolean>(false)

  const setUpdate = (type: boolean) => (value: boolean) => {
    if (type){
      setUpdateA(value)
      return
    }

    setUpdateB(value)
  }

  const setBridge = (type: boolean) => (value: string) => {
    if (type) {
      setBridgeA(value)
      return
    }

    setBridgeB(value)
  }
  return <BridgeContext.Provider value={
  {
    bridgeA,
    bridgeB,
    setBridgeA: setBridge(true),
    setBridgeB: setBridge(false),
    updateA,
    updateB,
    setUpdateA: setUpdate(true),
    setUpdateB: setUpdate(false)
  }
}>
  {children}
  </BridgeContext.Provider>
}

export default ContextProvider
