// src/layouts/DashboardLayout.jsx
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function DashboardLayout() {
    return (
    <>
        <Navbar />
        <div className="max-w-5xl mx-auto p-4">
        <div className="bg-white rounded shadow p-4 min-h-[300px]">
            <Outlet />
        </div>
        </div>
    </>
    );
}
