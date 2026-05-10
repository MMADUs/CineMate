import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import { LoginPage } from "./pages/auth/LoginPage"
import { RegisterPage } from "./pages/auth/RegisterPage"
import { HomePage } from "./pages/HomePage" 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage registerHref="/register" />} />
        <Route path="/register" element={<RegisterPage loginHref="/login" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)