import React from 'react'

import { Editor } from '@monaco-editor/react'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'

import { storageService } from '~/services/storageService'
import { defaultCSS } from '~/utils/defaultCSS'
import { defaultHTML } from '~/utils/defaultHTML'
import { defaultJS } from '~/utils/defaultJS'

import { DashboardStyledContainer } from './styled'

const TABS = ['HTML', 'CSS', 'JAVASCRIPT']

interface Props {
  children?: React.ReactNode
}

export function Dashboard(props: Props): React.ReactNode {
  const [selectedTab, setSelectedTab] = React.useState('HTML')

  const [editingText, setEditingText] = React.useState('')

  async function onChangeTab(newTab: string): Promise<void> {
    await storageService.setItem(`unichat::${selectedTab.toLowerCase()}`, editingText)
    setSelectedTab(newTab)
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
    <DashboardStyledContainer>
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
        <Editor theme="vs-dark" language={selectedTab.toLowerCase()} value={editingText} onChange={onChangeTab} />
      </Paper>
      <Paper className="preview"></Paper>
    </DashboardStyledContainer>
  )
}
