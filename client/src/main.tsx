import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import { LoginPage } from "./pages/auth/LoginPage"
import { RegisterPage } from "./pages/auth/RegisterPage"
import { HomePage } from "./pages/HomePage" 
import { MoviePage } from './pages/MoviePage'
import { FoodBeveragePage } from './pages/FoodBeveragePage'
import { MovieDetailsPage } from './pages/MovieDetailsPage'
import { SeatSelectionPage } from './pages/SeatSelectionPage'
import { PaymentPage } from './pages/PaymentPage'
import { ReceiptPage } from './pages/ReceiptPage'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage registerHref="/register" />} />
        <Route path="/register" element={<RegisterPage loginHref="/login" />} />
        <Route path="/movie" element={<MoviePage />} />
        <Route path="/fnb" element={<FoodBeveragePage />} />

        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/seat-selection/:movieId/:showtimeId" element={<SeatSelectionPage />} />
        <Route path="/order/:movieId/:showtimeId/:seats" element={<PaymentPage />} />
        <Route path="/receipt/:movieId/:showtimeId/:seats" element={<ReceiptPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)