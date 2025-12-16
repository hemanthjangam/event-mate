import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EventService from '../services/eventService';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaChair } from 'react-icons/fa';
import '../pages/AdminDashboard.css'; // Reuse dashboard styles

const ManageLayouts = () => {
    const [layouts, setLayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLayouts();
    }, []);

    const fetchLayouts = async () => {
        try {
            const data = await EventService.getSeatingLayouts();
            setLayouts(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch layouts');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this layout?')) {
            try {
                await EventService.deleteSeatingLayout(id);
                setLayouts(layouts.filter(layout => layout.id !== id));
                toast.success('Layout deleted successfully');
            } catch (error) {
                toast.error('Failed to delete layout');
            }
        }
    };

    return (
        <div className="admin-dashboard container">
            <div className="dashboard-header">
                <h1>Manage Seating Layouts</h1>
                <Link to="/admin/create-layout" className="btn btn-primary">
                    <FaPlus /> Create New Layout
                </Link>
            </div>

            <div className="dashboard-content card">
                {loading ? (
                    <div className="loading-spinner">Loading layouts...</div>
                ) : layouts.length > 0 ? (
                    <div className="events-table-wrapper">
                        <table className="events-table">
                            <thead>
                                <tr>
                                    <th>Layout Name</th>
                                    <th>Dimensions</th>
                                    <th>Sections</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {layouts.map(layout => {
                                    const config = JSON.parse(layout.config || '[]');
                                    const sectionNames = config.map(c => c.name).join(', ');
                                    return (
                                        <tr key={layout.id}>
                                            <td style={{ fontWeight: '600' }}>
                                                <FaChair className="icon-sm" style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
                                                {layout.name}
                                            </td>
                                            <td>{layout.totalRows} Rows x {layout.totalCols} Cols</td>
                                            <td>{sectionNames}</td>
                                            <td>
                                                <button onClick={() => handleDelete(layout.id)} className="btn-icon delete" title="Delete">
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No layouts found. Create your first theatre layout!</p>
                    </div>
                )}
            </div>
            {/* Reuse some dashboard styles inline if needed */}
            <style>{`
                .icon-sm { vertical-align: middle; }
             `}</style>
        </div>
    );
};

export default ManageLayouts;
