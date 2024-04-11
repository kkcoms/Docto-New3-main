import {useContext} from "react";
import {BridgeContext, IBridgeContext} from "@/context/bridgeContext";

export const useBridge = (type: string) => {
  const { setBridgeA, setBridgeB, setUpdateA, setUpdateB } = useContext(BridgeContext) as IBridgeContext

  const setBridge : (value: string) => void = type === "A" ? setBridgeA : setBridgeB
  const setUpdate : (value: boolean) => void = type === "A" ? setUpdateA : setUpdateB
  const setUpdateAlt : (value: boolean) => void = type === "B" ? setUpdateA : setUpdateB
  const updateBridge = (text: string, update = true) => {
    setBridge(text)

    if (update === false)
      return

    setUpdate(true)
    setUpdateAlt(false)
  }

  return updateBridge
}
