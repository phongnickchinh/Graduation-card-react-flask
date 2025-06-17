import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import GuestBookPage from './pages/guest/GuestBookPage';
import GuestPage from './pages/guest/GuestPage';
import GuestMyStories from './pages/guest/GuestMyStories';


import Dashboard from './pages/user/DashboardLayout';
import ManageGuestbook from './pages/user/features/ManageGuestbook';
import ManageGuests from './pages/user/features/ManageGuests';
import ManageStories from './pages/user/features/ManageStories';
import Login from './pages/user/Login';

import './App.css';


import ProtectedRoute from './contexts/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Guest/public routes */}
        <Route path="/login" element={<Login />} />

        {/* Invitation routes */}
        <Route path="/GraduationInvitation/:username/:nickname" element={<GuestPage />} />
        <Route path="/GraduationInvitation/:username" element={<GuestPage />} />
        
        {/* Guestbook routes */}
        <Route path="/guestbook/view/:username/:nickname" element={<GuestBookPage />} />
        <Route path="/guestbook/view/:username" element={<GuestBookPage />} />

        {/* Guest view user stories */}
        <Route path="/stories/view/:username" element={<GuestMyStories />} />
        <Route path="/stories/view/:username/:nickname" element={<GuestMyStories />} />

        {/* Authenticated routes */}
        <Route path="/user/:username" element={<ProtectedRoute> <Dashboard/></ProtectedRoute>} >

          {/* Nested routes for user dashboard */}
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
