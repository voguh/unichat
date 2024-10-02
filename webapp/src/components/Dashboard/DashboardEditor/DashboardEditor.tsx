import React from 'react'
import { toast } from 'react-toastify'

import { Editor } from '@monaco-editor/react'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'

import { storageService } from '~/services/storageService'
import { CUSTOM_CSS_KEY, CUSTOM_HTML_KEY } from '~/utils/constants'
import { defaultCSS } from '~/utils/defaultCSS'
import { defaultHTML } from '~/utils/defaultHTML'

import { DashboardEditorStyledContainer } from './styled'

const TABS = ['HTML', 'CSS']

interface Props {
  children?: React.ReactNode
}

export function DashboardEditor(_props: Props): React.ReactNode {
  const [selectedTab, setSelectedTab] = React.useState('HTML')
  const [editingText, setEditingText] = React.useState('')

  const debounceRef = React.useRef<NodeJS.Timeout>()

  async function debounceOnChangeData(tab: string, data: string): Promise<void> {
    debounceRef.current = null
    await storageService.setItem(`unichat::${tab.toLowerCase()}`, data)
    toast.success('Data saved!')
  }

  function onChangeData(value: string): void {
    setEditingText(value)

    if (debounceRef.current != null) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => debounceOnChangeData(selectedTab, value), 3000)
  }

  async function onChangeTab(newTab: string): Promise<void> {
    await storageService.setItem(`unichat::${selectedTab.toLowerCase()}`, editingText)
    setSelectedTab(newTab)
  }

  async function init(): Promise<void> {
    const html = await storageService.getItem<string>(CUSTOM_HTML_KEY)
    if (html == null || html.trim().length === 0) {
      await storageService.setItem(CUSTOM_HTML_KEY, defaultHTML)
      setEditingText(defaultHTML)
    }

    const css = await storageService.getItem<string>(CUSTOM_CSS_KEY)
    if (css == null || css.trim().length === 0) {
      await storageService.setItem(CUSTOM_CSS_KEY, defaultCSS)
    }
  }

  React.useEffect(() => {
    init()
  }, [])

  React.useEffect(() => {
    async function getTextToEdit(): Promise<void> {
      const data = await storageService.getItem<string>(`unichat::${selectedTab.toLowerCase()}`)
      setEditingText(data)
    }

    getTextToEdit()
  }, [selectedTab])

  return (
    <DashboardEditorStyledContainer>
      <Paper className="top-bar">
        {TABS.map((tab) => (
          <Button
            key={tab}
            size="small"
            variant={tab === selectedTab ? 'contained' : 'text'}
            onClick={() => onChangeTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </Paper>
      <Paper className="editor">
        <Editor theme="vs-dark" language={selectedTab.toLowerCase()} value={editingText} onChange={onChangeData} />
      </Paper>
      <Paper className="preview"></Paper>
    </DashboardEditorStyledContainer>
  )
}
