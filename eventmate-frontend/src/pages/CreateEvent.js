import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import EventService from '../services/eventService';
import toast from 'react-hot-toast';

const CreateEvent = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [layouts, setLayouts] = useState([]);
    const [selectedLayoutId, setSelectedLayoutId] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedLayouts = await EventService.getSeatingLayouts();
                setLayouts(fetchedLayouts);

                if (id) {
                    const event = await EventService.getEventById(id);
                    const fields = ['title', 'description', 'venue', 'price', 'category', 'imageUrl', 'trailerUrl', 'duration', 'date'];
                    fields.forEach(field => setValue(field, event[field]));
                    // Note: Handling existing sections for edit mode is complex, omitting for now or assuming recreating
                }
            } catch (error) {
                toast.error('Failed to load data');
            }
        };
        loadData();
    }, [id, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Process Layout
            if (selectedLayoutId) {
                const selectedLayout = layouts.find(l => l.id.toString() === selectedLayoutId.toString());
                if (selectedLayout) {
                    try {
                        const config = JSON.parse(selectedLayout.config);
                        data.sections = config.map(section => ({
                            name: section.name,
                            rows: section.rows,
                            cols: section.cols,
                            price: parseFloat(data.price) * (section.priceMultiplier || 1),
                            layoutConfig: JSON.stringify(section) // store specific config if needed
                        }));
                    } catch (e) {
                        console.error("Error parsing layout config", e);
                        toast.error("Invalid layout configuration");
                        setLoading(false);
                        return;
                    }
                }
            }

            if (isEditMode) {
                await EventService.updateEvent(id, data);
                toast.success('Event updated successfully');
            } else {
                await EventService.createEvent(data);
                toast.success('Event created successfully');
            }
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error('Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0', maxWidth: '600px' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h2 className="mb-4 text-center">{isEditMode ? 'Edit Event' : 'Create New Event'}</h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="input-group">
                        <label className="d-block mb-1 text-muted">Event Title</label>
                        <input
                            {...register('title', { required: 'Title is required' })}
                            className="input-field"
                            placeholder="e.g. Coldplay Concert"
                        />
                        {errors.title && <span className="error-text">{errors.title.message}</span>}
                    </div>

                    <div className="input-group">
                        <label className="d-block mb-1 text-muted">Description</label>
                        <textarea
                            {...register('description', { required: 'Description is required' })}
                            className="input-field"
                            rows="4"
                            placeholder="Event details..."
                        />
                        {errors.description && <span className="error-text">{errors.description.message}</span>}
                    </div>

                    <div className="flex gap-4">
                        <div className="input-group" style={{ flex: 1 }}>
                            <label className="d-block mb-1 text-muted">Date & Time</label>
                            <input
                                type="datetime-local"
                                {...register('date', { required: 'Date is required' })}
                                className="input-field"
                            />
                            {errors.date && <span className="error-text">{errors.date.message}</span>}
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label className="d-block mb-1 text-muted">Duration (mins)</label>
                            <input
                                type="number"
                                {...register('duration')}
                                className="input-field"
                                placeholder="e.g 120"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="input-group" style={{ flex: 1 }}>
                            <label className="d-block mb-1 text-muted">Price (Base ₹)</label>
                            <input
                                type="number"
                                {...register('price', { required: 'Price is required', min: 0 })}
                                className="input-field"
                                placeholder="0.00"
                            />
                            {errors.price && <span className="error-text">{errors.price.message}</span>}
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label className="d-block mb-1 text-muted">Category</label>
                            <select
                                {...register('category', { required: 'Category is required' })}
                                className="input-field"
                            >
                                <option value="">Select Category</option>
                                <option value="Concert">Concert</option>
                                <option value="Movie">Movie</option>
                                <option value="Comedy">Comedy</option>
                                <option value="Sports">Sports</option>
                                <option value="Workshop">Workshop</option>
                            </select>
                            {errors.category && <span className="error-text">{errors.category.message}</span>}
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="d-block mb-1 text-muted">Venue</label>
                        <input
                            {...register('venue', { required: 'Venue is required' })}
                            className="input-field"
                            placeholder="Location name"
                        />
                        {errors.venue && <span className="error-text">{errors.venue.message}</span>}
                    </div>

                    <div className="input-group">
                        <label className="d-block mb-1 text-muted">Seating Layout</label>
                        <select
                            className="input-field"
                            value={selectedLayoutId}
                            onChange={(e) => setSelectedLayoutId(e.target.value)}
                        >
                            <option value="">Select a Layout (Optional)</option>
                            {layouts.map(layout => (
                                <option key={layout.id} value={layout.id}>
                                    {layout.name} ({layout.totalRows}x{layout.totalCols})
                                </option>
                            ))}
                        </select>
                        <small className="text-muted">Selecting a layout will auto-generate seat sections.</small>
                    </div>

                    <div className="input-group">
                        <label className="d-block mb-1 text-muted">Image URL</label>
                        <input
                            {...register('imageUrl')}
                            className="input-field"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="input-group">
                        <label className="d-block mb-1 text-muted">Trailer URL (Optional)</label>
                        <input
                            {...register('trailerUrl')}
                            className="input-field"
                            placeholder="https://youtube.com/..."
                        />
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn btn-outline" style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
          .d-block { display: block; }
          .mb-1 { margin-bottom: 0.25rem; }
      `}</style>
        </div>
    );
};

export default CreateEvent;
