import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import axios from 'axios'

// During development, point axios to the backend directly to avoid proxy issues
if (import.meta.env.DEV) {
  axios.defaults.baseURL = 'http://127.0.0.1:5000'
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
