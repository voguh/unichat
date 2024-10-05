import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { invoke } from '@tauri-apps/api/core'
import * as clipboard from '@tauri-apps/plugin-clipboard-manager'

import { storageService } from '~/services/storageService'
import { TWITCH_CHAT_URL_KEY, YOUTUBE_CHAT_URL_KEY } from '~/utils/constants'
import { Strings } from '~/utils/Strings'

import { DashboardHomeStyledContainer } from './styled'

interface FormData {
  youtubeChatUrl: string
  twitchChatUrl: string
}

const defaultValues: FormData = {
  youtubeChatUrl: '',
  twitchChatUrl: ''
}

export function DashboardHome(): React.ReactNode {
  const [selectedWidget, setSelectedWidget] = React.useState('default')
  const [widgets, setWidgets] = React.useState<string[]>([])

  const [savingStatus, setSavingStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const { control, handleSubmit, reset } = useForm({ defaultValues, mode: 'all' })

  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  function onChangeWidget(evt: SelectChangeEvent<string>): void {
    setSelectedWidget(evt.target.value)
  }

  async function reloadIframe(): Promise<void> {
    const widgets = await invoke<string[]>('list_overlay_widgets')
    setWidgets(widgets)

    iframeRef.current?.contentWindow.location.reload()
  }

  async function onSubmit(formData: FormData): Promise<void> {
    try {
      setSavingStatus('saving')

      await storageService.setItem(YOUTUBE_CHAT_URL_KEY, formData.youtubeChatUrl)
      await storageService.setItem(TWITCH_CHAT_URL_KEY, formData.twitchChatUrl)
      await storageService.save()

      if (Strings.isValidYouTubeChatUrl(formData.youtubeChatUrl)) {
        await invoke('update_webview_url', { label: `youtube-chat`, url: formData.youtubeChatUrl })
      } else {
        await invoke('update_webview_url', { label: `youtube-chat`, url: 'about:blank' })
      }

      if (Strings.isValidTwitchChatUrl(formData.twitchChatUrl)) {
        await invoke('update_webview_url', { label: `twitch-chat`, url: formData.twitchChatUrl })
      } else {
        await invoke('update_webview_url', { label: `twitch-chat`, url: 'about:blank' })
      }

      setSavingStatus('saved')
      toast.success('Successfully saved')
    } catch (err) {
      console.error(err)
      setSavingStatus('error')
      toast.error('An error occurred on save')
    }
  }

  React.useEffect(() => {
    async function init(): Promise<void> {
      const youtubeChatUrl = await storageService.getItem<string>(YOUTUBE_CHAT_URL_KEY)
      const twitchChatUrl = await storageService.getItem<string>(TWITCH_CHAT_URL_KEY)

      const widgets = await invoke<string[]>('list_overlay_widgets')
      setWidgets(widgets)

      reset({ youtubeChatUrl, twitchChatUrl })
    }

    init()
  }, [])

  return (
    <DashboardHomeStyledContainer>
      <form className="fields" onSubmit={handleSubmit(onSubmit)}>
        <Paper className="fields-actions">
          <Button
            type="submit"
            color={savingStatus === 'saving' ? 'warning' : savingStatus === 'error' ? 'error' : 'primary'}
          >
            {savingStatus === 'saving' ? 'Saving...' : savingStatus === 'error' ? 'Error' : 'Save'}
          </Button>
        </Paper>

        <Paper className="fields-values">
          <Controller
            control={control}
            name="youtubeChatUrl"
            render={function ControllerRender({ field, fieldState }): JSX.Element {
              return (
                <TextField
                  {...field}
                  error={!!fieldState.error}
                  size="small"
                  variant="outlined"
                  fullWidth
                  label="YouTube chat url"
                  placeholder="https://www.youtube.com/live_chat?v={VIDEO_ID}"
                />
              )
            }}
          />
          <Controller
            control={control}
            name="twitchChatUrl"
            render={function ControllerRender({ field, fieldState }): JSX.Element {
              return (
                <TextField
                  {...field}
                  error={!!fieldState.error}
                  size="small"
                  variant="outlined"
                  fullWidth
                  label="Twtich chat url"
                  placeholder="https://www.twitch.tv/popout/{CHANNEL_NAME}/chat"
                />
              )
            }}
          />
        </Paper>
      </form>
      <Paper className="preview">
        <Paper className="preview-header">
          <FormControl fullWidth size="small" variant="outlined">
            <InputLabel id="unichat-widget">Overlay widget</InputLabel>
            <Select labelId="unichat-widget" label="Overlay widget" value={selectedWidget} onChange={onChangeWidget}>
              {widgets.map((widget) => (
                <MenuItem key={widget} value={widget}>
                  {widget}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button onClick={reloadIframe}>
            <i className="fas fa-sync" />
          </Button>

          <Button onClick={() => clipboard.writeText(`http://localhost:9527/widgets/${selectedWidget}`)}>
            <i className="fas fa-globe" />
          </Button>
        </Paper>
        <iframe ref={iframeRef} src={`http://localhost:9527/widgets/${selectedWidget}`} sandbox="allow-scripts" />
      </Paper>
    </DashboardHomeStyledContainer>
  )
}
