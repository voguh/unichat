import React from 'react'
import { toast } from 'react-toastify'

import { Editor, OnChange } from '@monaco-editor/react'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'

import { storageService } from '~/services/storageService'
import { defaultCSS } from '~/utils/defaultCSS'
import { defaultHTML } from '~/utils/defaultHTML'
import { defaultJS } from '~/utils/defaultJS'

import { DashboardHomeStyledContainer } from './styled'

const TABS = ['HTML', 'CSS', 'JAVASCRIPT']

interface Props {
  children?: React.ReactNode
}

export function DashboardHome(props: Props): React.ReactNode {
  const [selectedTab, setSelectedTab] = React.useState('HTML')
  const [editingText, setEditingText] = React.useState('')

  const debounceRef = React.useRef<NodeJS.Timeout>()

  async function debounceSaveData(tab: string, data: string): Promise<void> {
    await storageService.setItem(`unichat::${tab.toLowerCase()}`, data)
    debounceRef.current = null
    toast.success('Data saved!')
  }

  async function onChangeTab(newTab: string): Promise<void> {
    await storageService.setItem(`unichat::${selectedTab.toLowerCase()}`, editingText)
    setSelectedTab(newTab)
  }

  function onChangeData(value: Parameters<OnChange>[0], ev: Parameters<OnChange>[1]): void {
    setEditingText(value)

    if (debounceRef.current != null) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => debounceSaveData(selectedTab, value), 3000)
  }

  async function init(): Promise<void> {
    const html = await storageService.getItem('unichat::html')
    if (html == null) {
      await storageService.setItem('unichat::html', defaultHTML)
    }

    const css = await storageService.getItem('unichat::css')
    if (css == null) {
      await storageService.setItem('unichat::css', defaultCSS)
    }

    const js = await storageService.getItem('unichat::javascript')
    if (js == null) {
      await storageService.setItem('unichat::javascript', defaultJS)
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
    <DashboardHomeStyledContainer>
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
    </DashboardHomeStyledContainer>
  )
}
