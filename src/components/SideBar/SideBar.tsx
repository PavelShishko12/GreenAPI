import { useMemo } from 'react'
import './styles.css'
import { Icon } from '../Icon'
import type { ChatData } from '../../types'

type SideBarProps = {
  chats: ChatData[]
  activeId: string
  search: string
  isPolling: boolean
  onSearchChange: (value: string) => void
  onSelectChat: (id: string) => void
  onSettings: () => void
  onNewChat: () => void
}

export const SideBar = ({
  chats,
  activeId,
  search,
  isPolling,
  onSearchChange,
  onSelectChat,
  onSettings,
  onNewChat,
}: SideBarProps) => {
  const filteredChats = useMemo(() => chats.filter((chat) => `${chat.name} ${chat.phone}`.toLowerCase().includes(search.toLowerCase())), [chats, search])

  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="brand-mark">G</div>
        <div>
          <strong>green
            <span>chat</span>
          </strong>
          <small>MESSENGER</small>
        </div>
      </div>
      <div className="profile-row">
        <div className="avatar avatar-profile">User</div>
        <div className="profile-copy">
          <strong>Добро пожаловать</strong>
        </div>
      </div>
      <div className="search-box">
        <Icon name="search" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Поиск по чатам"
        />
      </div>
      <div className="chat-heading">
        <span>Чаты</span>
        <button className="new-chat" aria-label="Добавить чат" onClick={onNewChat}>
          <Icon name="plus" />
        </button>
      </div>
      <nav className="chat-list">
        {filteredChats.map((chat) => (
          <button
            className={`chat-preview ${chat.id === activeId ? 'active' : ''}`}
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className={`avatar avatar-${chat.tone}`}>{chat.initials}</div>
            <div className="chat-preview-copy">
              <div>
                <strong>{chat.name}</strong>
                <time>{chat.lastTime}</time>
              </div>
              <div>
                <span>{chat.lastMessage}</span>
                {chat.unread > 0 && <b>{chat.unread}</b>}
              </div>
            </div>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className={isPolling ? 'connected' : ''}>
          <i /> {isPolling ? 'Green-API подключен' : 'Демо-режим'}
        </span>
        <button onClick={onSettings}>Настроить <span>→</span></button>
      </div>
    </aside>
  );
}