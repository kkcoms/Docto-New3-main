"use node"
import {action} from "./_generated/server";
import {v} from "convex/values";

export const summarize = action({
  args: {
    text: v.string()
  },
  handler: async (ctx, { text }) => {
    try {
      if (!text)
        return null

      const messages = [
        {
          role: "system",
          content: `
            Create a clinical note only based on what is written of the clinical encounter with at least these 
            sections Chief Complaint,Past Medical History, Allergies, Medications, Assessment, Plan and Suggestions. 
            It must be short an concise but descriptive with paragraphs where needed. Do not provide a tittle 
            heading for the note just for the sections. Only focus on the information that is clinically relevant. 
            It must be succinct when possible. Format: Array of objects with 2 attributes: 
            section (plain text) and content
          `
        },
        {
          role: "user",
          content: text
        }
      ]

      const data = await chatCompletions(messages)

      return data
    } catch (e: any) {
      console.log(e)
      return null
    }
  }
})

const chatCompletions = (messages: {role: string, content: string}[]) => {
  try {
    let url = "https://api.openai.com/v1/chat/completions";
    let bearer = 'Bearer ' + process.env.OPENAI_KEY
    const fetchData = fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "model": "gpt-3.5-turbo-16k",
        "temperature": 0.2,
        "messages": messages
      })
    }).then(response => response.json())

    return fetchData
  } catch (e) {
    console.log(e)
    return null
  }
}
