import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { register: registerUser, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            await registerUser(data);
            toast.success('Account created successfully! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="text-center">Create Account</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    <div className="input-group">
                        <input
                            {...register('name', { required: 'Name is required' })}
                            type="text"
                            placeholder="Full Name"
                            className="input-field"
                        />
                        {errors.name && <span className="error-text">{errors.name.message}</span>}
                    </div>

                    <div className="input-group">
                        <input
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                            type="email"
                            placeholder="Email Address"
                            className="input-field"
                        />
                        {errors.email && <span className="error-text">{errors.email.message}</span>}
                    </div>

                    <div className="input-group">
                        <input
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Password must be at least 6 characters' }
                            })}
                            type="password"
                            placeholder="Password"
                            className="input-field"
                        />
                        {errors.password && <span className="error-text">{errors.password.message}</span>}
                    </div>

                    <div className="input-group">
                        <select
                            {...register('role', { required: 'Role is required' })}
                            className="input-field"
                            defaultValue="USER"
                        >
                            <option value="USER">Customer</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <input
                            {...register('phone')}
                            type="tel"
                            placeholder="Phone Number (Optional)"
                            className="input-field"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Already have an account? <Link to="/login" className="link-primary">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
