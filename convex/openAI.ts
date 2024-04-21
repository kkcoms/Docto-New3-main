import {action} from "./_generated/server";
import {v} from "convex/values";

export const summarize = action({
  args: {
    text: v.string()
  },
  handler: async (ctx, { text }) => {
    try {

      console.log("using dev")
      if (!text)
        return null

      const messages = [
        {
          role: "system",
          content: `Output Format: Array of objects with 2 attributes: section (plain text) and content, 
          example: [{"section": "Summary", "content": "No clinically relevant information provided"}]. 
          Create a clinical note only based on what is written of the clinical encounter. 
          If there's no clinically relevant information return a short summary of the user content. 
          Otherwise the output should have these sections when the information is provided Chief Complaint,
          Past Medical History, Allergies, Medications, Assessment, Plan and Suggestions. It must be descriptive.`
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

export const getActionsPoints = action({
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
          content: `Output Format: Array of objects with content, example: [{ "content": ""], 
          content should have less than 50 characters. Formulate an action plan point based on the user content`
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
        "temperature": 0,
        "messages": messages
      })
    }).then(response => response.json())

    return fetchData
  } catch (e) {
    console.log(e)
    return null
  }
}
