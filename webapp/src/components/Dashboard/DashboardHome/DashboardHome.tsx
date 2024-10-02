import React from 'react'
import { toast } from 'react-toastify'

import TextField from '@mui/material/TextField'

import { storageService } from '~/services/storageService'
import { TWITCH_CHAT_URL_KEY, YOUTUBE_CHAT_URL_KEY } from '~/utils/constants'

import { DashboardHomeStyledContainer } from './styled'

interface Props {
  children?: React.ReactNode
}

export function DashboardHome(_props: Props): React.ReactNode {
  const debounceRef = React.useRef<NodeJS.Timeout>()

  const [youtubeChatUrl, setYouTubeChatUrl] = React.useState('')
  const [twitchChatUrl, setTwitchChatUrl] = React.useState('')

  async function debounceOnSave(key: string, data: string): Promise<void> {
    debounceRef.current = null
    await storageService.setItem(`unichat::${key}-url`, data)
    toast.success(`Url of ${key} saved!`)
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    event.persist()
    if (debounceRef.current != null) {
      clearTimeout(debounceRef.current)
    }

    if (event.target.name === 'youtube-chat') {
      setYouTubeChatUrl(event.target.value)
    } else {
      setTwitchChatUrl(event.target.value)
    }

    debounceRef.current = setTimeout(() => debounceOnSave(event.target.name, event.target.value), 3000)
  }

  async function init(): Promise<void> {
    const youtubeChatUrl = await storageService.getItem<string>(YOUTUBE_CHAT_URL_KEY)
    if (youtubeChatUrl != null) {
      setYouTubeChatUrl(youtubeChatUrl)
    }

    const twitchChatUrl = await storageService.getItem<string>(TWITCH_CHAT_URL_KEY)
    if (twitchChatUrl != null) {
      setTwitchChatUrl(twitchChatUrl)
    }
  }

  React.useEffect(() => {
    init()
  }, [])

  return (
    <DashboardHomeStyledContainer>
      <TextField
        size="small"
        variant="filled"
        fullWidth
        id="youtube-chat-text-field"
        name="youtube-chat"
        label="YouTube chat url"
        placeholder="https://www.youtube.com/live_chat?v={VIDEO_ID}"
        value={youtubeChatUrl}
        onChange={onChange}
      />
      <TextField
        size="small"
        variant="filled"
        fullWidth
        id="twitch-chat-text-field"
        name="twitch-chat"
        label="Twtich chat url"
        placeholder="https://www.twitch.tv/popout/{CHANNEL_NAME}/chat"
        value={twitchChatUrl}
        onChange={onChange}
      />
    </DashboardHomeStyledContainer>
  )
}
