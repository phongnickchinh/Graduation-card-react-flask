import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/user/Login';
import GuestPage from './pages/guest/GuestPage';
import Dashboard from './pages/user/DashboardLayout';
import ManageGuests from './pages/user/features/ManageGuests';
import ManageStories from './pages/user/features/ManageStories';
import ManageGuestbook from './pages/user/features/ManageGuestbook';

import './App.css';


import ProtectedRoute from './contexts/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Guest/public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/GraduationInvitation/:username/:nickname" element={<GuestPage />} />
        <Route path="/guestbook/:username" element={<GuestBookPage />} />

        {/* Authenticated routes */}
        <Route path="/user/:username" element={<ProtectedRoute> <Dashboard/></ProtectedRoute>} >
          <Route index element={<ManageGuests />} />
          <Route path="guests" element={<ManageGuests />} />
          <Route path="stories" element={<ManageStories />} />
          <Route path="guestbook" element={<ManageGuestbook />} />
        </Route>

        {/* Thêm các route yêu cầu auth khác ở đây */}
      </Routes>
    </Router>
  );
}
export default App;
