import {TElement, Value} from "@udecode/plate-common";
import {Block} from "@blocknote/core";

const setBlockType = (obj: any, type: string) => {
  if (type === "p"){
    obj.type = "paragraph"
  } else if (type === "h1"){
    obj.type = "heading"
    obj.props.level = 1
  } else if (type === "h2"){
    obj.type = "heading"
    obj.props.level = 2
  }
  else if (type === "h3"){
    obj.type = "heading"
    obj.props.level = "3"
  }

  return obj
}

const setPlateType = (obj: any, type: string, props?: any) => {
  const level = props?.level
  if (type === "paragraph") {
    obj.type = "p"
  } else if (type === "heading" && level === 1) {
    obj.type = "h1"
  } else if (type === "heading" && level === 2) {
    obj.type = "h2"
  }
  else if (type === "heading"){
    obj.type = "h3"
  }

  return obj
}
const usePlateSerializer = () => {

  const blocksToPlate = (blocks: Block[]) : Value => {
    const values : Value = []
    for (const block of blocks) {
      let obj : TElement= {
        type: "",
        children: []
      }
      obj = setPlateType(obj, block.type, block.props)
      if (block.content) {

        if (Array.isArray(block.content)) {
          for (const content of block.content) {
            if (content.type === "text")
              obj.children.push({
                text: content.text
              })
          }
        }
      }

      if (obj.children.length === 0)
        continue

      values.push(obj)
    }
    return values
  }
  const plateToBlock = (plate: Value) : Block[] => {
    const blocks : Block[] = []
    if (!plate)
      return blocks

    let base : Block = {
      id: "0",
      type: "paragraph",
      props: {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left",
      },
      content: [],
      children: []
    }

    for (const element of plate) {
      let block = JSON.parse(JSON.stringify(base))
      block.id = element.id as string

      block = setBlockType(block, element.type)
      for (const children of element.children) {
          block.content.push({
            type: "text",
            styles: {},
            text: children.text as string
          })
      }

      blocks.push(block)
    }

    return blocks
  }

  return { plateToBlock, blocksToPlate }
}

export default usePlateSerializer
