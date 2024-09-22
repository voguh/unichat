import React from 'react'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'

import { themeDark } from './styles/theme'

export default function App(): JSX.Element {
  return (
    <ThemeProvider theme={themeDark}>
      <CssBaseline />
    </ThemeProvider>
  )
}
