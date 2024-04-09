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
const usePlateSerializer = () => {
  const plateToBlock = (plate: Value) : Block[] => {
    const blocks : Block[] = []
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

    for (const element of plate){
      let block = { ...base }
      console.log(element)
      block.id = element.id as string

      block = setBlockType(block, element.type)
      console.log(element.children)
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

  return [plateToBlock]
}

export default usePlateSerializer
