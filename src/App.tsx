import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { Chat } from './components/Chat/Chat'
import { GreenApiSettings } from './components/GreenApiSettings/GreenApiSettings'
import { NewChatModal } from './components/NewChatModal/NewChatModal'
import { SideBar } from './components/SideBar/SideBar'
import type { ChatData } from './types'
import './App.css'

const initialChats: ChatData[] = []

const formatTime = () => new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date())

function App() {
  const [chats, setChats] = useState(initialChats)
  const [activeId, setActiveId] = useState('')
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [showSettings, setShowSettings] = useState(() => (
    !localStorage.getItem('greenapi_id') || !localStorage.getItem('greenapi_token')
  ))
  const [showNewChat, setShowNewChat] = useState(false)
  const [idInstance, setIdInstance] = useState(() => localStorage.getItem('greenapi_id') ?? '')
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('greenapi_token') ?? '')
  const [notice, setNotice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const activeChat = chats.find((chat) => chat.id === activeId) ?? chats[0]
  const isPolling = Boolean(idInstance && apiToken)

  useEffect(() => {
    if (!isPolling) return
    let cancelled = false
    const controller = new AbortController()
    const pause = (milliseconds: number) => new Promise<void>((resolve) => {
      window.setTimeout(resolve, milliseconds)
    })

    const receiveLoop = async () => {
      while (!cancelled) {
        try {
          const response = await fetch(
            `https://api.green-api.com/waInstance${idInstance}/receiveNotification/${apiToken}?receiveTimeout=5`,
            { signal: controller.signal },
          )
          if (!response.ok) throw new Error('receive failed')

          const payload = await response.json()
          const receiptId = payload?.receiptId as number | undefined
          const text = payload?.body?.messageData?.textMessageData?.textMessage as string | undefined
          const sender = payload?.body?.senderData?.sender as string | undefined
          const chatId = sender?.replace('@c.us', '')

          if (text && chatId) {
            const time = formatTime()
            setChats((current) => current.map((chat) => {
              if (chat.id !== chatId) return chat

              return {
                ...chat,
                lastMessage: text,
                lastTime: time,
                messages: [
                  ...chat.messages,
                  { id: String(Date.now()), text, time, outgoing: false },
                ],
              }
            }))
          }

          if (receiptId !== undefined) {
            await fetch(
              `https://api.green-api.com/waInstance${idInstance}/deleteNotification/${apiToken}/${receiptId}`,
              { method: 'DELETE', signal: controller.signal },
            )
          }
        } catch {
          if (!cancelled) await pause(2000)
        }
      }
    }

    void receiveLoop()
    return () => { cancelled = true; controller.abort() }
  }, [apiToken, idInstance, isPolling])

  const sendMessage = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    if (!activeId) return
    const message = {
      id: String(Date.now()),
      text,
      time: formatTime(),
      outgoing: true as const,
      status: 'sent' as const,
    }
    setChats((current) => current.map((chat) => {
      if (chat.id !== activeId) return chat

      return {
        ...chat,
        lastMessage: text,
        lastTime: message.time,
        messages: [...chat.messages, message],
      }
    }))
    setDraft('')
    if (!isPolling) {
      setNotice('Сообщение добавлено в демо-чат. Подключите Green-API, чтобы отправлять его реально.')
      window.setTimeout(() => setNotice(''), 4500)
      return
    }
    try {
      const response = await fetch(
        `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: `${activeId}@c.us`, message: text }),
        },
      )
      if (!response.ok) throw new Error('send failed')
      setChats((current) => current.map((chat) => {
        if (chat.id !== activeId) return chat

        return {
          ...chat,
          messages: chat.messages.map((item) => (
            item.id === message.id ? { ...item, status: 'read' } : item
          )),
        }
      }))
    } catch {
      setNotice('Не удалось отправить сообщение. Проверьте данные Green-API и доступность инстанса.')
    }
  }

  const selectChat = (id: string) => {
    setActiveId(id)
    setChats((current) => current.map((chat) => (
      chat.id === id ? { ...chat, unread: 0 } : chat
    )))
  }

  const handleSettingsSaved = (nextId: string, nextToken: string) => {
    setIdInstance(nextId)
    setApiToken(nextToken)
    setShowSettings(false)
    setNotice(
      nextId && nextToken
        ? 'Подключение Green-API сохранено.'
        : 'Демо-режим включен',
    )
    window.setTimeout(() => setNotice(''), 3500)
  }

  const createChat = (phone: string) => {
    const existingChat = chats.find((chat) => chat.id === phone)
    if (existingChat) {
      selectChat(existingChat.id)
      setShowNewChat(false)
      return
    }

    const formattedPhone = phone.length === 11 && phone.startsWith('7')
      ? `+7 ${phone.slice(1, 4)} ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`
      : `+${phone}`
    const newChat: ChatData = {
      id: phone,
      name: formattedPhone,
      phone: formattedPhone,
      initials: 'НЧ',
      tone: 'blue',
      lastMessage: 'Новый чат',
      lastTime: 'Сейчас',
      unread: 0,
      messages: [],
    }

    setChats((current) => [...current, newChat])
    setActiveId(phone)
    setShowNewChat(false)
  }

  return (
    <main className="app-shell">
      <SideBar
        chats={chats}
        activeId={activeId}
        search={search}
        isPolling={isPolling}
        onSearchChange={setSearch}
        onSelectChat={selectChat}
        onSettings={() => setShowSettings(true)}
        onNewChat={() => setShowNewChat(true)}
      />
      {activeChat ? (
        <Chat
          activeChat={activeChat}
          draft={draft}
          onDraftChange={setDraft}
          onSend={sendMessage}
          inputRef={inputRef}
        />
      ) : (
        <section className="conversation empty-conversation" aria-label="Нет открытых чатов" />
      )}
      {notice && <div className="notice">{notice}</div>}
      {showSettings && (
        <GreenApiSettings
          initialIdInstance={idInstance}
          initialApiToken={apiToken}
          onClose={() => setShowSettings(false)}
          onSaved={handleSettingsSaved}
        />
      )}
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreate={createChat}
        />
      )}
    </main>
  )
}

export default App