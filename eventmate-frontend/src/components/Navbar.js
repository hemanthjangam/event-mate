import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { FaUserCircle, FaSearch } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

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
        <nav className="navbar-wrapper">
            <div className="navbar-main">
                <div className="container navbar-content">
                    <Link to="/" className="navbar-brand">
                        Event<span className="text-primary">Mate</span>
                    </Link>

                    <div className="navbar-search">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search for Movies, Events, Plays, Sports and Activities"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="navbar-links">
                        {isAuthenticated ? (
                            <div className="navbar-user">
                                {user?.role === 'ADMIN' && (
                                    <>
                                        <Link to="/admin/dashboard" className="nav-link text-primary">
                                            Dashboard
                                        </Link>
                                    </>
                                )}
                                <Link to="/profile" className="nav-link user-profile-link">
                                    <FaUserCircle className="icon" />
                                    <span>{user?.name || 'Hi, Guest'}</span>
                                </Link>
                                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="navbar-auth">
                                <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="navbar-secondary">
                <div className="container">
                    <div className="category-links">
                        <Link to="/?category=Movies" className="cat-link">Movies</Link>
                        <Link to="/?category=Stream" className="cat-link">Stream</Link>
                        <Link to="/?category=Events" className="cat-link">Events</Link>
                        <Link to="/?category=Plays" className="cat-link">Plays</Link>
                        <Link to="/?category=Sports" className="cat-link">Sports</Link>
                        <Link to="/?category=Activities" className="cat-link">Activities</Link>
                        <Link to="/?category=Music" className="cat-link">Music</Link>
                        <Link to="/?category=Comedy" className="cat-link">Comedy</Link>
                        <Link to="/?category=Workshops" className="cat-link">Workshops</Link>
                        <Link to="/?category=Buzz" className="cat-link">Buzz</Link>
                    </div>
                    <div className="right-links">
                        <Link to="/list-your-show" className="cat-link text-xs">ListYourShow</Link>
                        <Link to="/corporates" className="cat-link text-xs">Corporates</Link>
                        <Link to="/offers" className="cat-link text-xs">Offers</Link>
                        <Link to="/gift-cards" className="cat-link text-xs">Gift Cards</Link>
                    </div>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
