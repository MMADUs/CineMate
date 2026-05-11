import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import { LoginPage } from "./pages/auth/LoginPage"
import { RegisterPage } from "./pages/auth/RegisterPage"
import { HomePage } from "./pages/HomePage" 
import { MoviePage } from './pages/MoviePage'
import { FoodBeveragePage } from './pages/FoodBeveragePage'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage registerHref="/register" />} />
        <Route path="/register" element={<RegisterPage loginHref="/login" />} />
        <Route path="/movie" element={<MoviePage />} />
        <Route path="/fnb" element={<FoodBeveragePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)