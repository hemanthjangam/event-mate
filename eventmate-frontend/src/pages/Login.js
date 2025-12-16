import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import AuthService from '../services/authService';

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
            <div className="auth-card card">
                <h2 className="text-center mb-4">Welcome Back</h2>

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

                <p className="text-center mt-4 text-muted">
                    Don't have an account? <Link to="/register" className="text-primary">Sign Up</Link>
                </p>
            </div>
            <style>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 80px);
          padding: var(--spacing-md);
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          padding: var(--spacing-xl);
          background: rgba(26, 36, 47, 0.8);
          backdrop-filter: blur(20px);
        }
        .auth-tabs {
          display: flex;
          margin-bottom: var(--spacing-md);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .tab-btn {
          flex: 1;
          padding: 0.75rem;
          background: transparent;
          color: var(--text-muted);
          font-weight: 600;
          transition: all var(--transition-fast);
        }
        .tab-btn.active {
          color: var(--primary-color);
          border-bottom: 2px solid var(--primary-color);
        }
        .w-100 { width: 100%; }
        .error-text { color: var(--error); font-size: 0.875rem; margin-top: 0.25rem; display: block; }
        .text-primary { color: var(--primary-color); }
      `}</style>
        </div>
    );
};

export default Login;
