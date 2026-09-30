import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Icon } from '../Icon'
import './styles.css'

type GreenApiSettingsProps = {
  initialIdInstance: string
  initialApiToken: string
  onClose: () => void
  onSaved: (idInstance: string, apiToken: string) => void
}

export function GreenApiSettings({ initialIdInstance, initialApiToken, onClose, onSaved }: GreenApiSettingsProps) {
  const [idInstance, setIdInstance] = useState(initialIdInstance)
  const [apiToken, setApiToken] = useState(initialApiToken)

  const saveSettings = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    localStorage.setItem('greenapi_id', idInstance)
    localStorage.setItem('greenapi_token', apiToken)
    onSaved(idInstance, apiToken)
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.currentTarget === event.target && onClose()}
    >
      <form className="settings-modal" onSubmit={saveSettings}>
        <div className="modal-heading">
          <div>
            <span className="eyebrow">Подключение</span>
            <h2>Green-API</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Закрыть" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <p>Укажите данные инстанса, чтобы отправлять и получать сообщения MAX.</p>
        <label>
          idInstance
          <input
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
            placeholder="1101XXXXXX"
          />
        </label>
        <label>
          apiTokenInstance
          <input
            type="password"
            value={apiToken}
            onChange={(event) => setApiToken(event.target.value)}
            placeholder="Ваш токен инстанса"
          />
        </label>
        <button className="primary-button" type="submit">Сохранить подключение</button>
        <small>Данные сохраняются только в локальном хранилище браузера.</small>
      </form>
    </div>
  )
}