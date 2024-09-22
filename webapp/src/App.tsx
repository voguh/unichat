import React from 'react'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'

import { ContextMenu } from './components/ContextMenu'
import { themeDark } from './styles/theme'
import { Position } from './types'
import { contextMenuItems } from './utils/contextMenu'

export default function App(): JSX.Element {
  const [contextMenuPosition, setContextMenuPosition] = React.useState<Position>(null)

  function onContextMenuClose(): void {
    setContextMenuPosition(null)
  }

  React.useEffect(() => {
    function onContextMenu(event: MouseEvent): void {
      event.preventDefault()

      setContextMenuPosition({ left: event.pageX, top: event.pageY })
    }

    window.addEventListener('contextmenu', onContextMenu)

    return () => {
      window.removeEventListener('contextmenu', onContextMenu)
    }
  }, [])

  return (
    <ThemeProvider theme={themeDark}>
      <CssBaseline />
      <ContextMenu handleClose={onContextMenuClose} items={contextMenuItems} pos={contextMenuPosition} />
    </ThemeProvider>
  )
}
