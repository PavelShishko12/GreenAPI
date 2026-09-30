import type { RefObject, SubmitEvent } from 'react'
import './styles.css'
import { Icon } from '../Icon'
import type { ChatData } from '../../types'

type ChatProps = {
  activeChat: ChatData
  draft: string
  onDraftChange: (value: string) => void
  onSend: (event: SubmitEvent<HTMLFormElement>) => void | Promise<void>
  inputRef: RefObject<HTMLInputElement | null>
}

export const Chat = ({ activeChat, draft, onDraftChange, onSend, inputRef }: ChatProps) => {
  return (
    <section className="conversation">
      <header className="conversation-header">
        <div className={`avatar avatar-${activeChat.tone}`}>
          {activeChat.initials}
        </div>
        <div className="conversation-title">
          <strong>{activeChat.name}</strong>
          <span>
            {activeChat.phone} <i className="verified">✓</i>
          </span>
        </div>
        <div className="conversation-actions">
          <button className="icon-button" aria-label="Позвонить">
            <Icon name="phone" />
          </button>
          <button className="icon-button" aria-label="Дополнительно">
            <Icon name="more" />
          </button>
        </div>
      </header>
      <div className="message-area">
        <div className="day-label">
          <span>Сегодня</span>
        </div>
        {activeChat.messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-icon">✦</div>
            <strong>Начните разговор</strong>
            <span>Отправьте первое сообщение {activeChat.name.split(' ')[0]}</span>
          </div>
        ) : (
          activeChat.messages.map((message) => (
            <div className={`message-row ${message.outgoing ? 'outgoing' : ''}`} key={message.id}>
              <div className="message-bubble">
                <p>{message.text}</p>
                <small>
                  {message.time}
                  {message.outgoing && (
                    <span className={`message-status ${message.status}`}>
                      <Icon name="check" />
                      <Icon name="check" />
                    </span>
                  )}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
      <form className="composer" onSubmit={onSend}>
        <button type="button" className="icon-button" aria-label="Прикрепить файл">
          <Icon name="paperclip" />
        </button>
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Напишите сообщение..."
        />
        <button type="button" className="icon-button" aria-label="Добавить эмодзи">
          <Icon name="smile" />
        </button>
        <button className="send-button" type="submit" aria-label="Отправить">
          <Icon name="send" />
        </button>
      </form>
    </section>
  );
}