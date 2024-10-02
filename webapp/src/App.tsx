import React from 'react'
import { ToastContainer } from 'react-toastify'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'

import { Dashboard } from './components/Dashboard'
import { storageService } from './services/storageService'
import { themeDark } from './styles/theme'

export default function App(): JSX.Element {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function init(): Promise<void> {
      await storageService.init()
      setLoading(false)
    }

    init()
  }, [])

  if (loading) {
    return (
      <ThemeProvider theme={themeDark}>
        <CssBaseline />
        Loading...
        <ToastContainer position="bottom-center" theme="dark" />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={themeDark}>
      <CssBaseline />
      <Dashboard />
      <ToastContainer position="bottom-center" theme="dark" />
    </ThemeProvider>
  )
}
