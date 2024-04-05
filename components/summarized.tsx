const Summarized = ({summary} : { summary: string }) => {
    const parsed = JSON.parse(summary)

    const result = parsed.map((el : any) => {
      return <div>
        <h3>{el.section}</h3> <br />
        <h5>{el.content}</h5>
      </div>
    })

  return result
}

export default Summarized;
