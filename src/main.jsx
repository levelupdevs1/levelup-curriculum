import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import WalletContext from './contexts/WalletContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletContext>  
        <App />
    </WalletContext>
  </StrictMode>,
)
