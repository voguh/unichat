import 'react-toastify/dist/ReactToastify.css'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

const root = createRoot(document.querySelector('#root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
