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
import { OrderHistoryPage } from './pages/HistoryOrderPage'
import { TicketDetailsPage } from './pages/TicketDetailsPage'
import { ProfilePage } from './pages/ProfilePage'

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminMoviesPage } from './pages/admin/AdminMoviesPage'
import { AdminShowtimesPage } from './pages/admin/AdminShowtimesPage'
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage'
import { AdminFnbPage } from './pages/admin/AdminFnBPage';
import { AdminStudiosPage } from './pages/admin/AdminStudiosPage'
import { AdminProfilePage } from './pages/admin/AdminProfilePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage registerHref="/register" />} />
        <Route path="/register" element={<RegisterPage loginHref="/login" />} />
        <Route path="/movie" element={<MoviePage />} />
        <Route path="/fnb" element={<FoodBeveragePage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/seat-selection/:movieId/:showtimeId" element={<SeatSelectionPage />} />
        <Route path="/order/:movieId/:showtimeId/:seats" element={<PaymentPage />} />
        <Route path="/receipt/:movieId/:showtimeId/:seats" element={<ReceiptPage />} />
        <Route path="/history" element={<OrderHistoryPage />} />
        <Route path="/ticket/:orderId" element={<TicketDetailsPage />} />

        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/movies" element={<AdminMoviesPage />} />
        <Route path="/admin/studios" element={<AdminStudiosPage />} />
        <Route path="/admin/showtimes" element={<AdminShowtimesPage />} />
        <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
        <Route path="/admin/fnb" element={<AdminFnbPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)