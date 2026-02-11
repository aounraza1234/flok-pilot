import { Route, Routes } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { RequireAuth, RequireRole, RequireVerifiedSeller } from '../components/Guards.jsx'
import { Roles } from './constants.js'

import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import RegisterBuyer from '../pages/RegisterBuyer.jsx'
import RegisterSeller from '../pages/RegisterSeller.jsx'
import BuyerDashboard from '../pages/BuyerDashboard.jsx'
import SellerDashboard from '../pages/SellerDashboard.jsx'
import SellerPending from '../pages/SellerPending.jsx'
import AdminDashboard from '../pages/AdminDashboard.jsx'
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
          </Route>

          <Route path="seller">
            <Route element={<RequireRole role={Roles.SELLER} />}>
              <Route path="pending" element={<SellerPending />} />
            </Route>
            <Route element={<RequireVerifiedSeller />}>
              <Route index element={<SellerDashboard />} />
            </Route>
          </Route>

          <Route path="admin" element={<RequireRole role={Roles.ADMIN} />}>
            <Route index element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

