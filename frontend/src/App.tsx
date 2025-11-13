import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Homepage from "./pages/Homepage";
import ProductDetail from "./pages/ProductDetail";
import SearchPage from "./pages/SearchPage";
import Categorypage from "./pages/Categorypage";
import Intropage from "./pages/Intropage";
import ScrollToTop from "./components/ScrollComponent";
import Cartpage from "./pages/Cartpage";
import MainLayout from "./layouts/mainLayout";
import OrderPage from "./pages/Orderpage";
import ProfilePage from "./pages/ProfilePage";
import ProfileLayout from "./layouts/profileLayout";
import ChangePasswordForm from "./components/ChangePasswordForm";
import ForgotPasswordForm from "./components/ForgotPasswordForm";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/category" element={<Categorypage />} />
          <Route path="/intro" element={<Intropage />} />
          <Route path="/cart" element={<Cartpage />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/forgot" element={<ForgotPasswordForm />} />
        </Route>
        <Route path="/profile" element={<ProfileLayout />}>
          <Route index element={<ProfilePage />} />
          <Route
            path="/profile/change-password"
            element={<ChangePasswordForm />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
