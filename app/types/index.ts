export interface Word {
  word: string;
  punctuated_word: string;
  start: number;
  end: number;
}

export interface INote {
  audioFileUrl: string
  content: string

  icon: string
  coverImage: string
  isArchived:boolean
  isPublished: boolean
  noteCreationDateTime: string
  summarizationResult: string
  summaryNote: string
  title: string
  userId: string
  _creationTime: Number
  _id: string
}
export interface Transcription {
  transcript: string;
  words: Word[];
  speaker: number;
  start: number;
  end: number;
  timestamp: string;
}

export interface ActionPoint {
  content: string

  checked: boolean

  id: string
}
