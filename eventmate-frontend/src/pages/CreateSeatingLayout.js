import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import EventService from '../services/eventService';
import toast from 'react-hot-toast';
import './CreateSeatingLayout.css';
import { FaInfoCircle } from 'react-icons/fa';

const CreateSeatingLayout = () => {
    const navigate = useNavigate();
    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            totalRows: 10,
            totalCols: 15,
            sections: [{ name: 'Standard', startRow: 1, endRow: 10, priceMultiplier: 1.0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "sections"
    });

    const watchRows = watch("totalRows");
    const watchCols = watch("totalCols");
    const watchSections = watch("sections");

    const [loading, setLoading] = useState(false);
    const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);

    // Presets configuration
    const applyPreset = (type) => {
        if (type === 'small') {
            reset({
                name: 'Small Hall',
                totalRows: 8,
                totalCols: 10,
                sections: [
                    { name: 'Standard', startRow: 1, endRow: 8, priceMultiplier: 1.0 }
                ]
            });
        } else if (type === 'medium') {
            reset({
                name: 'Medium Hall',
                totalRows: 12,
                totalCols: 16,
                sections: [
                    { name: 'VIP', startRow: 1, endRow: 2, priceMultiplier: 2.0 },
                    { name: 'Premium', startRow: 3, endRow: 5, priceMultiplier: 1.5 },
                    { name: 'Standard', startRow: 6, endRow: 12, priceMultiplier: 1.0 }
                ]
            });
        } else if (type === 'large') {
            reset({
                name: 'Large Cinema',
                totalRows: 20,
                totalCols: 25,
                sections: [
                    { name: 'VIP', startRow: 1, endRow: 4, priceMultiplier: 2.5 },
                    { name: 'Gold', startRow: 5, endRow: 10, priceMultiplier: 1.8 },
                    { name: 'Silver', startRow: 11, endRow: 20, priceMultiplier: 1.0 }
                ]
            });
        }
        toast.success(`Applied ${type} preset`);
    };

    // Helper to determine which section a row belongs to
    const getRowSection = (rowIndex) => {
        const rowNum = rowIndex + 1;
        // Find last matching section
        return watchSections.find(s => rowNum >= parseInt(s.startRow) && rowNum <= parseInt(s.endRow));
    };

    // Handle row click to assign to selected section
    const handleRowClick = (rowIndex) => {
        if (selectedSectionIndex === null || !watchSections[selectedSectionIndex]) return;

        const rowNum = rowIndex + 1;
        const currentSection = watchSections[selectedSectionIndex];

        // Simple logic: Update the clicked row to be part of the selected section
        // This is a simplified "assign" logic - ideally we'd manage complex ranges but 
        // for now we'll just expand/shrink the range based on click or give user feedback

        // Better UX for "Simple": Just set the start/end row of the selected section to include this row
        // or effectively "paint" the row. 
        // For simplicity in this iteration: If user clicks row 5 and selected section is 1-4, make it 1-5.

        // Even simpler: The inputs are manual, but clicking a row fills the "End Row" or "Start Row" 
        // dependent on which is closer? 
        // Let's stick to the Plan: "Clicking a row assigns it".

        // Implementation: We can't easily supports discontinuous ranges with this simple form structure (start-end).
        // So we will just auto-update the start/end row values to encompass the clicked row if it's adjacent?
        // Or simpler: Just tell the user "Select a section on the left, then adjust ranges manually" logic is easiest,
        // but the user wants "Simple".

        // Let's implement fully manual "Set Start" / "Set End" via click?
        // Actually, the "Presets" are the biggest win. 
        // Let's just allow clicking a row to set it as the "End Row" of the selected section.

        setValue(`sections.${selectedSectionIndex}.endRow`, rowNum);
        toast.success(`Set Row ${rowNum} as end for ${currentSection.name}`);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Transform form data into backend format
            const config = data.sections.map(s => ({
                name: s.name,
                rows: (parseInt(s.endRow) - parseInt(s.startRow)) + 1,
                cols: parseInt(data.totalCols),
                priceMultiplier: parseFloat(s.priceMultiplier)
            }));

            const payload = {
                name: data.name,
                totalRows: parseInt(data.totalRows),
                totalCols: parseInt(data.totalCols),
                config: JSON.stringify(config)
            };

            await EventService.createSeatingLayout(payload);
            toast.success('Layout created successfully');
            navigate('/admin/layouts');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create layout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="layout-builder-page">
            <div className="builder-container">
                <div className="builder-header">
                    <h2>Create Seating Layout</h2>
                    <p>Use a preset or define custom dimensions.</p>
                </div>

                <div className="builder-content">
                    {/* Left: Configuration Form */}
                    <div className="config-panel card">
                        <div className="presets-container">
                            <span className="text-sm font-bold self-center">Presets:</span>
                            <button type="button" onClick={() => applyPreset('small')} className="btn-preset">Small Hall</button>
                            <button type="button" onClick={() => applyPreset('medium')} className="btn-preset">Medium</button>
                            <button type="button" onClick={() => applyPreset('large')} className="btn-preset">Large Cinema</button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="form-section">
                                <h3>Basic Info</h3>
                                <div className="input-group">
                                    <label>Layout Name</label>
                                    <input
                                        {...register('name', { required: 'Name is required' })}
                                        className="input-field"
                                        placeholder="e.g. Screen 1"
                                    />
                                    {errors.name && <span className="error-text">{errors.name.message}</span>}
                                </div>
                                <div className="flex gap-2">
                                    <div className="input-group">
                                        <label>Total Rows</label>
                                        <input
                                            type="number"
                                            {...register('totalRows', { required: true, min: 1, max: 50 })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Total Columns</label>
                                        <input
                                            type="number"
                                            {...register('totalCols', { required: true, min: 1, max: 50 })}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="flex justify-between items-center mb-2">
                                    <h3>Sections</h3>
                                    <button type="button" className="btn btn-sm btn-outline" onClick={() => append({ name: '', startRow: 1, endRow: 1, priceMultiplier: 1.0 })}>
                                        + Add
                                    </button>
                                </div>

                                <div className="sections-list">
                                    {fields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className={`section-item ${selectedSectionIndex === index ? 'selected' : ''}`}
                                            onClick={() => setSelectedSectionIndex(index)}
                                        >
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-bold">Section {index + 1}</span>
                                                {index > 0 && <button type="button" onClick={(e) => { e.stopPropagation(); remove(index); }} className="text-red text-sm">Remove</button>}
                                            </div>
                                            <div className="input-group mb-1">
                                                <input
                                                    {...register(`sections.${index}.name`, { required: true })}
                                                    className="input-field"
                                                    placeholder="Name"
                                                />
                                            </div>
                                            <div className="flex gap-2 mb-1">
                                                <input
                                                    type="number"
                                                    {...register(`sections.${index}.startRow`, { required: true })}
                                                    className="input-field"
                                                    placeholder="Start"
                                                />
                                                <span className="self-center">-</span>
                                                <input
                                                    type="number"
                                                    {...register(`sections.${index}.endRow`, { required: true })}
                                                    className="input-field"
                                                    placeholder="End"
                                                />
                                            </div>
                                            <div className="input-group">
                                                <input
                                                    type="number" step="0.1"
                                                    {...register(`sections.${index}.priceMultiplier`, { required: true })}
                                                    className="input-field"
                                                    placeholder="Price (1.0)"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-actions mt-4">
                                <button type="button" onClick={() => navigate('/admin/layouts')} className="btn btn-outline w-full mb-2">Cancel</button>
                                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                    {loading ? 'Creating...' : 'Save Layout'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right: Visual Preview */}
                    <div className="preview-panel card">
                        <h3>Visual Preview</h3>
                        <div className="instruction-banner">
                            <FaInfoCircle />
                            <span>Click a row in the grid to set it as the <strong>End Row</strong> for the selected section.</span>
                        </div>

                        <div className="screen-preview">SCREEN</div>

                        <div className="seats-grid-container">
                            <div
                                className="seats-grid"
                                style={{
                                    gridTemplateColumns: `repeat(${watchCols}, 1fr)`
                                }}
                            >
                                {Array.from({ length: watchRows }).map((_, rIndex) => {
                                    const section = getRowSection(rIndex);

                                    return Array.from({ length: watchCols }).map((_, cIndex) => (
                                        <div
                                            key={`${rIndex}-${cIndex}`}
                                            className={`preview-seat ${section ? 'assigned' : 'unassigned'}`}
                                            title={section ? `${section.name} (Row ${rIndex + 1})` : `Unassigned (Row ${rIndex + 1})`}
                                            style={{
                                                backgroundColor: section ? getSectionColor(section.name) : '#eee'
                                            }}
                                            onClick={() => handleRowClick(rIndex)}
                                        >
                                            <span className="seat-tooltip">{rIndex + 1}-{cIndex + 1}</span>
                                        </div>
                                    ));
                                })}
                            </div>
                        </div>

                        <div className="legend mt-4">
                            {watchSections.map((s, i) => (
                                <div key={i} className="legend-item">
                                    <span className="dot" style={{ backgroundColor: getSectionColor(s.name) }}></span>
                                    <span>{s.name || 'Unnamed'}</span>
                                </div>
                            ))}
                            <div className="legend-item">
                                <span className="dot" style={{ backgroundColor: '#eee' }}></span>
                                <span>Unassigned</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple color hash for consistent section colors
const getSectionColor = (name) => {
    if (!name) return '#ccc';
    if (name.toLowerCase().includes('vip')) return '#FFD700'; // Gold
    if (name.toLowerCase().includes('gold')) return '#FFA500'; // Orange
    if (name.toLowerCase().includes('premium')) return '#F84464'; // Primary Red
    if (name.toLowerCase().includes('silver')) return '#C0C0C0'; // Silver

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

export default CreateSeatingLayout;
