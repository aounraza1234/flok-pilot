import { Route, Routes } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { RequireAuth, RequireRole, RequireVerifiedSeller } from '../components/Guards.jsx'
import { Roles } from './constants.js'

import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import RegisterBuyer from '../pages/RegisterBuyer.jsx'
import RegisterSeller from '../pages/RegisterSeller.jsx'
import BuyerDashboard from '../pages/BuyerDashboard.jsx'
import Catalog from '../pages/Catalog.jsx'
import ProductDetail from '../pages/ProductDetail.jsx'
import Cart from '../pages/Cart.jsx'
import Checkout from '../pages/Checkout.jsx'
import MyOrders from '../pages/MyOrders.jsx'
import OrderDetail from '../pages/OrderDetail.jsx'
import SellerDashboard from '../pages/SellerDashboard.jsx'
import SellerProducts from '../pages/SellerProducts.jsx'
import SellerOrders from '../pages/SellerOrders.jsx'
import SellerPending from '../pages/SellerPending.jsx'
import AdminDashboard from '../pages/AdminDashboard.jsx'
import AdminProducts from '../pages/AdminProducts.jsx'
import AdminOrders from '../pages/AdminOrders.jsx'
import AdminComplaints from '../pages/AdminComplaints.jsx'
import NotFound from '../pages/NotFound.jsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register">
          <Route path="buyer" element={<RegisterBuyer />} />
          <Route path="seller" element={<RegisterSeller />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="buyer" element={<RequireRole role={Roles.BUYER} />}>
            <Route index element={<BuyerDashboard />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
          </Route>

          <Route path="seller">
            <Route element={<RequireRole role={Roles.SELLER} />}>
              <Route path="pending" element={<SellerPending />} />
            </Route>
            <Route element={<RequireVerifiedSeller />}>
              <Route index element={<SellerDashboard />} />
              <Route path="products" element={<SellerProducts />} />
              <Route path="orders" element={<SellerOrders />} />
            </Route>
          </Route>

          <Route path="admin" element={<RequireRole role={Roles.ADMIN} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="complaints" element={<AdminComplaints />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

