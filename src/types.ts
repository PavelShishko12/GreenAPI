export type Message = {
  id: string
  text: string
  time: string
  outgoing: boolean
  status?: 'sent' | 'read'
}

export type ChatData = {
  id: string
  name: string
  phone: string
  initials: string
  tone: string
  lastMessage: string
  lastTime: string
  unread: number
  messages: Message[]
}