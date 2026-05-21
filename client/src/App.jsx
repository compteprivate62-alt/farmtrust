import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, CartProvider, LangProvider, useAuth } from './context';
import Navbar from './components/common/Navbar';
import { WelcomePopup } from './pages/public/Auth';

import Landing     from './pages/public/Landing';
import { Login, Register } from './pages/public/Auth';
import AnimalsPage  from './pages/public/AnimalsPage';
import AnimalDetail from './pages/public/AnimalDetail';

import UserDashboard  from './pages/user/Dashboard';
import UserOrders     from './pages/user/Orders';
import CartPage       from './pages/user/Cart';
import Checkout       from './pages/user/Checkout';
import Chat           from './pages/user/Chat';
import Notifications  from './pages/user/Notifications';

import AdminDashboard  from './pages/admin/Dashboard';
import AdminAnimals    from './pages/admin/Animals';
import AdminProducts   from './pages/admin/Products';
import AdminOrders     from './pages/admin/Orders';
import AdminMessages   from './pages/admin/Messages';
import AdminPromotions from './pages/admin/Promotions';
import AdminVideo      from './pages/admin/Video';

const Guard = ({ children, admin }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ width:40, height:40, border:'4px solid #2E7D32', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
  if (!user) return <Navigate to="/login"/>;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard"/>;
  return children;
};

function Inner() {
  return (
    <>
      <Navbar/>
      <WelcomePopup/>
      <Toaster position="top-right" toastOptions={{ duration:3000 }}/>
      <Routes>
        <Route path="/"              element={<Landing/>}/>
        <Route path="/animals"       element={<AnimalsPage/>}/>
        <Route path="/animals/:id"   element={<AnimalDetail/>}/>
        <Route path="/login"         element={<Login/>}/>
        <Route path="/register"      element={<Register/>}/>
        <Route path="/dashboard"     element={<Guard><UserDashboard/></Guard>}/>
        <Route path="/orders"        element={<Guard><UserOrders/></Guard>}/>
        <Route path="/cart"          element={<Guard><CartPage/></Guard>}/>
        <Route path="/checkout"      element={<Guard><Checkout/></Guard>}/>
        <Route path="/chat"          element={<Guard><Chat/></Guard>}/>
        <Route path="/notifications" element={<Guard><Notifications/></Guard>}/>
        <Route path="/admin"            element={<Guard admin><AdminDashboard/></Guard>}/>
        <Route path="/admin/animals"    element={<Guard admin><AdminAnimals/></Guard>}/>
        <Route path="/admin/products"   element={<Guard admin><AdminProducts/></Guard>}/>
        <Route path="/admin/orders"     element={<Guard admin><AdminOrders/></Guard>}/>
        <Route path="/admin/messages"   element={<Guard admin><AdminMessages/></Guard>}/>
        <Route path="/admin/promotions" element={<Guard admin><AdminPromotions/></Guard>}/>
        <Route path="/admin/video"      element={<Guard admin><AdminVideo/></Guard>}/>
        <Route path="*" element={<Navigate to="/"/>}/>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <CartProvider>
            <Inner/>
          </CartProvider>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
