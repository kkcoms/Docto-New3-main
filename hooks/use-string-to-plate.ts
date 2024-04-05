export interface IPlateElement {
  id: string
  type: string

  children: any
}
const useStringToPlate = () : (summary: string) => IPlateElement[] => {

  return (summary) => {

    if (!summary) {
      return []
    }

    const parsed : { section: string, content: string }[] = JSON.parse(summary)
    const result : IPlateElement[] = []

    for (const data of parsed){
      if (data.section){
        result.push({
          id: result.length.toString(),
          type: "h3",
          children: [{
            text: data.section
          }]
        })
      }
      if (data.content){
        result.push({
          id: result.length.toString(),
          type: "p",
          children: [{
            text: data.content
          }]
        })
      }
    }

    return result
  }
}

export default useStringToPlate
