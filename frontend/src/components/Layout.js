import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div>
            <Navbar />
            <main style={{ padding: '2rem' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
