import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import EventService from '../services/eventService';
import toast from 'react-hot-toast';

const CreateEvent = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [castList, setCastList] = useState([]);
    const [castName, setCastName] = useState('');
    const [castRole, setCastRole] = useState('');

    const [layouts, setLayouts] = useState([]);
    const [selectedLayoutId, setSelectedLayoutId] = useState('');

    const addCastMember = () => {
        if (castName && castRole) {
            setCastList([...castList, `${castName}:${castRole}`]);
            setCastName('');
            setCastRole('');
        }
    };

    const removeCastMember = (index) => {
        const newList = [...castList];
        newList.splice(index, 1);
        setCastList(newList);
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedLayouts = await EventService.getSeatingLayouts();
                setLayouts(fetchedLayouts);

                if (id) {
                    const event = await EventService.getEventById(id);
                    const fields = ['title', 'description', 'venue', 'price', 'category', 'imageUrl', 'trailerUrl', 'duration', 'imdbRating', 'movieMode', 'groupId'];
                    fields.forEach(field => setValue(field, event[field]));

                    // Populate Date & Time
                    if (event.date) {
                        const dateObj = new Date(event.date);
                        const dateStr = dateObj.toISOString().split('T')[0];
                        const timeStr = dateObj.toTimeString().slice(0, 5);

                        setValue('startDate', dateStr);
                        setValue('startTime', timeStr);

                        if (event.category === 'Movies') {
                            setValue('showTimes', [timeStr]);
                        }
                    }

                    if (event.endDate) {
                        const endDateObj = new Date(event.endDate);
                        const endDateStr = endDateObj.toISOString().split('T')[0];
                        setValue('endDate', endDateStr);
                    }

                    // Populate Sections Config (if needed to show selected layout)
                    // Currently we don't easily reverse sections to layout ID unless we store it
                    // But we can leave it empty or try to guess. For now, leave as is.

                    if (event.cast) {
                        setCastList(event.cast);
                    }
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
            // Include cast list
            data.cast = castList;

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

            // --- SINGLE EVENT MODEL LOGIC ---
            // Prepare Show Times
            let finalShowTimes = [];
            if (data.category === 'Movies') {
                finalShowTimes = data.showTimes ? [...data.showTimes].sort() : [];
                if (finalShowTimes.length === 0) finalShowTimes = ["09:00"];
            } else {
                if (data.startTime) {
                    finalShowTimes = [data.startTime];
                } else {
                    finalShowTimes = ["12:00"]; // Default
                }
            }

            const payload = {
                ...data,
                startDate: data.startDate,
                endDate: data.endDate,
                showTimes: finalShowTimes,
                // Duration, etc are already in data
            };

            if (isEditMode) {
                await EventService.updateEvent(id, payload);
                toast.success('Event updated successfully');
            } else {
                await EventService.createEvent(payload);
                toast.success('Event created successfully');
            }
            navigate('/admin/dashboard');
        } catch (error) {
            console.error(error);
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

                    {/* Unified Date & Time Selection */}
                    <input type="hidden" {...register('groupId')} />
                    <div className="flex gap-4">
                        <div className="input-group" style={{ flex: 1 }}>
                            <label className="d-block mb-1 text-muted">Start Date</label>
                            <input
                                type="date"
                                {...register('startDate', { required: 'Start Date is required' })}
                                className="input-field"
                            />
                            {errors.startDate && <span className="error-text">{errors.startDate.message}</span>}
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label className="d-block mb-1 text-muted">End Date</label>
                            <input
                                type="date"
                                {...register('endDate', { required: 'End Date is required' })}
                                className="input-field"
                            />
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Same as Start Date for single show.</small>
                            {errors.endDate && <span className="error-text">{errors.endDate.message}</span>}
                        </div>
                    </div>

                    {/* Show Time / Time Slots */}
                    {watch('category') === 'Movies' ? (
                        <div className="input-group">
                            <label className="d-block mb-1 text-muted">Show Times (Daily)</label>
                            <div className="flex gap-2">
                                <input
                                    type="time"
                                    className="input-field"
                                    id="time-slot-input"
                                    style={{ width: '150px' }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        const t = document.getElementById('time-slot-input').value;
                                        if (t) {
                                            const currentTimes = watch('showTimes') || [];
                                            if (!currentTimes.includes(t)) {
                                                setValue('showTimes', [...currentTimes, t].sort());
                                            }
                                            document.getElementById('time-slot-input').value = '';
                                        }
                                    }}
                                >
                                    Add Time
                                </button>
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {(watch('showTimes') || []).map((t, idx) => (
                                    <span key={idx} className="tag-badge" style={{ background: '#e0e0e0', color: '#333' }}>
                                        {t}
                                        <span
                                            style={{ marginLeft: '8px', color: 'red', cursor: 'pointer' }}
                                            onClick={() => {
                                                const newTimes = watch('showTimes').filter((_, i) => i !== idx);
                                                setValue('showTimes', newTimes);
                                            }}
                                        >
                                            &times;
                                        </span>
                                    </span>
                                ))}
                            </div>
                            <input type="hidden" {...register('showTimes')} />
                            {(!watch('showTimes') || watch('showTimes').length === 0) && (
                                <small className="text-muted">Add at least one show time. If none added, default 09:00 AM will be used.</small>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <div className="input-group" style={{ flex: 1 }}>
                                <label className="d-block mb-1 text-muted">Show Time</label>
                                <input
                                    type="time"
                                    {...register('startTime', { required: watch('category') !== 'Movies' ? 'Show Time is required' : false })}
                                    className="input-field"
                                />
                                {errors.startTime && <span className="error-text">{errors.startTime.message}</span>}
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
                    )}

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
                                <option value="Movies">Movies</option>
                                <option value="Stream">Stream</option>
                                <option value="Events">Events</option>
                                <option value="Plays">Plays</option>
                                <option value="Sports">Sports</option>
                                <option value="Activities">Activities</option>
                                <option value="Music">Music</option>
                                <option value="Comedy">Comedy</option>
                                <option value="Workshops">Workshops</option>
                                <option value="Buzz">Buzz</option>
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

                    {/* Additional Event Details (Available for all categories) */}
                    <>
                        <div className="flex gap-4">
                            <div className="input-group" style={{ flex: 1 }}>
                                <label className="d-block mb-1 text-muted">IMDb Rating (Optional)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    {...register('imdbRating', { min: 0, max: 10 })}
                                    className="input-field"
                                    placeholder="e.g 8.5"
                                />
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label className="d-block mb-1 text-muted">Movie Mode</label>
                                <select
                                    {...register('movieMode')}
                                    className="input-field"
                                >
                                    <option value="">Select Mode</option>
                                    <option value="2D">2D</option>
                                    <option value="3D">3D</option>
                                    <option value="IMAX 2D">IMAX 2D</option>
                                    <option value="IMAX 3D">IMAX 3D</option>
                                    <option value="4DX">4DX</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label className="d-block mb-1 text-muted">Censor Rating</label>
                                <select
                                    {...register('censorRating')}
                                    className="input-field"
                                >
                                    <option value="">Select Rating</option>
                                    <option value="UA">UA</option>
                                    <option value="U">U</option>
                                    <option value="A">A</option>
                                    <option value="S">S</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="d-block mb-1 text-muted">Cast & Crew</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    className="input-field"
                                    placeholder="Artist Name"
                                    value={castName}
                                    onChange={(e) => setCastName(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    className="input-field"
                                    placeholder="Role (e.g. Actor)"
                                    value={castRole}
                                    onChange={(e) => setCastRole(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button type="button" className="btn btn-outline" onClick={addCastMember}>Add</button>
                            </div>
                            <div className="cast-list-preview" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {castList.map((c, idx) => (
                                    <span key={idx} className="tag-badge" style={{ background: '#e0e0e0', color: '#333' }}>
                                        {c} <span style={{ cursor: 'pointer', marginLeft: '5px', color: 'red' }} onClick={() => removeCastMember(idx)}>&times;</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </>

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
