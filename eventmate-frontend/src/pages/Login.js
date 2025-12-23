import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import AuthService from '../services/authService';
import './Auth.css';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isOtpLogin, setIsOtpLogin] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            if (isOtpLogin) {
                if (!otpSent) {
                    await AuthService.generateOtp(data.email);
                    setOtpSent(true);
                    toast.success('OTP sent to your email!');
                } else {
                    await AuthService.loginWithOtp(data.email, data.otp);
                    toast.success('Logged in successfully!');
                    navigate('/');
                }
            } else {
                await login(data.email, data.password);
                toast.success('Logged in successfully!');
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="text-center">Welcome Back</h2>

                <div className="auth-tabs">
                    <button
                        className={`tab-btn ${!isOtpLogin ? 'active' : ''}`}
                        onClick={() => { setIsOtpLogin(false); setOtpSent(false); }}
                    >
                        Password
                    </button>
                    <button
                        className={`tab-btn ${isOtpLogin ? 'active' : ''}`}
                        onClick={() => { setIsOtpLogin(true); setOtpSent(false); }}
                    >
                        OTP
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    <div className="input-group">
                        <input
                            {...register('email', { required: 'Email is required' })}
                            type="email"
                            placeholder="Email Address"
                            className="input-field"
                        />
                        {errors.email && <span className="error-text">{errors.email.message}</span>}
                    </div>

                    {!isOtpLogin && (
                        <div className="input-group">
                            <input
                                {...register('password', { required: 'Password is required' })}
                                type="password"
                                placeholder="Password"
                                className="input-field"
                            />
                            {errors.password && <span className="error-text">{errors.password.message}</span>}
                        </div>
                    )}

                    {isOtpLogin && otpSent && (
                        <div className="input-group">
                            <input
                                {...register('otp', { required: 'OTP is required' })}
                                type="text"
                                placeholder="Enter OTP"
                                className="input-field"
                            />
                            {errors.otp && <span className="error-text">{errors.otp.message}</span>}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                        {isLoading ? 'Loading...' : (isOtpLogin && !otpSent ? 'Send OTP' : 'Login')}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Don't have an account? <Link to="/register" className="link-primary">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
