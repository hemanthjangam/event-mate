import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { FaUserCircle, FaSignOutAlt, FaSearch, FaMoon, FaSun } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Theme State
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        // Navigate to home with filtered search param if on another page, 
        // or just update query param if on home
        navigate(`/?search=${term}`);
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="navbar-brand">
                    Event<span className="text-primary">Mate</span>
                </Link>

                <div className="navbar-search">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search for Events, Plays, Sports..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="navbar-links">
                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
                        {theme === 'light' ? <FaMoon /> : <FaSun />}
                    </button>

                    {isAuthenticated ? (
                        <div className="navbar-user">
                            {user?.role === 'ADMIN' && (
                                <Link to="/admin/dashboard" className="nav-link text-primary">
                                    Dashboard
                                </Link>
                            )}
                            <Link to="/profile" className="nav-link">
                                <FaUserCircle className="icon" />
                                <span>{user?.name || 'Profile'}</span>
                            </Link>
                            <button onClick={handleLogout} className="btn btn-outline btn-sm">
                                <FaSignOutAlt />
                            </button>
                        </div>
                    ) : (
                        <div className="navbar-auth">
                            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
