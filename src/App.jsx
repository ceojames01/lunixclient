import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Betting from './pages/Betting';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import Terms from './pages/Terms';
import About from './pages/About';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import MyTickets from './pages/MyTickets';
import Tickets from './pages/Tickets';
import TicketDetails from './pages/TicketDetails';
import Booking from './pages/Booking';
import Schedule from './pages/Schedule';
import ScannerLogin from './pages/ScannerLogin';
import ScannerDashboard from './pages/ScannerDashboard';

const PublicLayout = () => (
  <div className="min-h-screen bg-f1-asphalt text-white flex flex-col">
    <Navbar />
    <div className="flex-1">
      <Outlet />
    </div>
    <Footer />
  </div>
);

const App = () => (
  <Router>
    <Toaster position="top-right" />
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="cookies" element={<Cookies />} />
        <Route path="terms" element={<Terms />} />
        <Route path="about" element={<About />} />
      </Route>
      <Route path="/profile" element={<Profile />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/my-tickets" element={<MyTickets />} />
      <Route path="/login" element={<Login />} />
      <Route path="/betting" element={<Betting />} />
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/tickets/:id" element={<TicketDetails />} />
      <Route path="/tickets/:id/book" element={<Booking />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/scanner/login" element={<ScannerLogin />} />
      <Route path="/scanner/dashboard" element={<ScannerDashboard />} />
    </Routes>
  </Router>
);

export default App;
