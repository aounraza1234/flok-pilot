import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './app/AuthContext.jsx'
import { CartProvider } from './app/CartContext.jsx'
import { AppRoutes } from './app/AppRoutes.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
