import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Icon } from '../Icon'
import './styles.css'

type NewChatModalProps = {
  onClose: () => void
  onCreate: (phone: string) => void
}

export function NewChatModal({ onClose, onCreate }: NewChatModalProps) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  const createChat = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedPhone = phone.replace(/\D/g, '')

    if (normalizedPhone.length < 10) {
      setError('Введите номер телефона полностью')
      return
    }

    onCreate(normalizedPhone.startsWith('8') ? `7${normalizedPhone.slice(1)}` : normalizedPhone)
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <form className="settings-modal new-chat-modal" onSubmit={createChat}>
        <div className="modal-heading">
          <div>
            <span className="eyebrow">Новый диалог</span>
            <h2>Добавить чат</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Закрыть" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <p>Введите номер получателя, чтобы начать переписку в WhatsApp.</p>
        <label>
          Номер телефона
          <input
            autoFocus
            type="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value)
              setError('')
            }}
            placeholder="+7 999 123-45-67"
          />
        </label>
        {error && <span className="form-error">{error}</span>}
        <button className="primary-button" type="submit">Создать чат</button>
      </form>
    </div>
  )
}