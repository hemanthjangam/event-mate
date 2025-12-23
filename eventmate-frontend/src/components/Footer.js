import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPinterestP, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bms-footer">
            <div className="footer-top">
                <div className="container footer-content-row">
                    <div className="footer-links-col">
                        <h4>EventMate</h4>
                        <ul>
                            <li><Link to="/">About Us</Link></li>
                            <li><Link to="/">Contact Us</Link></li>
                            <li><Link to="/">Careers</Link></li>
                            <li><Link to="/">Press Coverage</Link></li>
                        </ul>
                    </div>
                    <div className="footer-links-col">
                        <h4>Help</h4>
                        <ul>
                            <li><Link to="/">FAQs</Link></li>
                            <li><Link to="/">Terms and Conditions</Link></li>
                            <li><Link to="/">Privacy Policy</Link></li>
                            <li><Link to="/">Sitemap</Link></li>
                        </ul>
                    </div>
                    <div className="footer-links-col">
                        <h4>Experience App</h4>
                        <ul>
                            <li><Link to="/">Get the App</Link></li>
                            <li><Link to="/">System Requirements</Link></li>
                            <li><Link to="/">Release Notes</Link></li>
                        </ul>
                    </div>
                    <div className="footer-social-col">
                        <h4>Social Connect</h4>
                        <div className="social-icons">
                            <Link to="/" className="social-icon"><FaFacebookF /></Link>
                            <Link to="/" className="social-icon"><FaTwitter /></Link>
                            <Link to="/" className="social-icon"><FaInstagram /></Link>
                            <Link to="/" className="social-icon"><FaYoutube /></Link>
                            <Link to="/" className="social-icon"><FaPinterestP /></Link>
                            <Link to="/" className="social-icon"><FaLinkedinIn /></Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>Copyright 2024 © EventMate Pvt. Ltd. All Rights Reserved.</p>
                    <p className="footer-disclaimer">
                        The content and images used on this site are copyright protected and copyrights vests with the respective owners.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
