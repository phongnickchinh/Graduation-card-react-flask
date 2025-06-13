// src/layouts/DashboardLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './DashboardLayout.css';

export default function DashboardLayout() {
    return (
    <>
        <Navbar />
        <div className="dashboard-container">
        <div className="dashboard-content">
            <Outlet />
        </div>
        </div>
    </>
    );
}
