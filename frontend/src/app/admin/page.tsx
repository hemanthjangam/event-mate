"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Edit, X } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    description: string;
    venue: string;
    date: string;
    price: number;
    imageUrl?: string;
    category?: string;
}

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        venue: '',
        date: '',
        price: '',
        imageUrl: '',
        category: '',
        trailerUrl: '',
        duration: '',
        censorRating: ''
    });
    const [sections, setSections] = useState<{ name: string; price: string; rows: string; cols: string }[]>([]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user?.role !== 'ADMIN') {
            router.push('/dashboard');
            return;
        }
        fetchEvents();
    }, [isAuthenticated, user]);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/events/${id}`);
                fetchEvents();
            } catch (error) {
                console.error('Failed to delete event', error);
            }
        }
    };

    const handleAddSection = () => {
        setSections([...sections, { name: '', price: '', rows: '', cols: '' }]);
    };

    const handleRemoveSection = (index: number) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    const handleSectionChange = (index: number, field: string, value: string) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setSections(newSections);
    };

    const [editingId, setEditingId] = useState<number | null>(null);

    const handleEdit = async (event: any) => {
        setEditingId(event.id);
        setFormData({
            title: event.title,
            description: event.description,
            venue: event.venue,
            date: event.date.slice(0, 16), // Format for datetime-local
            price: event.price.toString(),
            imageUrl: event.imageUrl || '',
            category: event.category || '',
            trailerUrl: event.trailerUrl || '',
            duration: event.duration?.toString() || '',
            censorRating: event.censorRating || ''
        });

        // Fetch full details to get sections
        try {
            const response = await api.get(`/events/${event.id}`);
            if (response.data.sections) {
                setSections(response.data.sections.map((s: any) => ({
                    name: s.name,
                    price: s.price.toString(),
                    rows: s.rows.toString(),
                    cols: s.cols.toString()
                })));
            } else {
                setSections([]);
            }
        } catch (error) {
            console.error('Failed to fetch event details', error);
        }

        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                duration: Number(formData.duration),
                date: new Date(formData.date).toISOString(),
                sections: sections.map(s => ({
                    name: s.name,
                    price: Number(s.price),
                    rows: Number(s.rows),
                    cols: Number(s.cols),
                    // @ts-ignore
                    layoutConfig: s.layoutConfig // Pass the config if it was selected via template
                }))
            };

            if (editingId) {
                await api.put(`/events/${editingId}`, payload);
            } else {
                await api.post('/events', payload);
            }

            setIsModalOpen(false);
            setEditingId(null);
            setFormData({
                title: '',
                description: '',
                venue: '',
                date: '',
                price: '',
                imageUrl: '',
                category: '',
                trailerUrl: '',
                duration: '',
                censorRating: ''
            });
            setSections([]);
            fetchEvents();
        } catch (error) {
            console.error('Failed to save event', error);
        }
    };

    interface SeatingLayout {
        id: number;
        name: string;
        totalRows: number;
        totalCols: number;
        config: string;
    }

    const [layouts, setLayouts] = useState<SeatingLayout[]>([]);
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
    const [currentLayout, setCurrentLayout] = useState<{ name: string; rows: number; cols: number; config: any[] }>({
        name: '', rows: 10, cols: 10, config: []
    });

    // Helper to generate initial config
    const generateInitialConfig = (rows: number, cols: number) => {
        return Array(rows).fill(null).map(() => Array(cols).fill('standard'));
    };

    const fetchLayouts = async () => {
        try {
            const response = await api.get('/admin/seating-layouts');
            setLayouts(response.data);
        } catch (error) {
            console.error('Failed to fetch layouts', error);
        }
    };

    const handleOpenLayoutManager = () => {
        fetchLayouts();
        setIsLayoutModalOpen(true);
    };

    const handleSaveLayout = async () => {
        try {
            await api.post('/admin/seating-layouts', {
                name: currentLayout.name,
                totalRows: currentLayout.rows,
                totalCols: currentLayout.cols,
                config: JSON.stringify(currentLayout.config)
            });
            fetchLayouts();
            // Reset current layout
            setCurrentLayout({ name: '', rows: 10, cols: 10, config: generateInitialConfig(10, 10) });
            alert('Layout saved successfully!');
        } catch (error) {
            console.error('Failed to save layout', error);
        }
    };

    const handleCellClick = (r: number, c: number) => {
        const newConfig = [...currentLayout.config];
        const types = ['standard', 'vip', 'aisle', 'blocked'];
        const currentType = newConfig[r][c] || 'standard';
        const nextType = types[(types.indexOf(currentType) + 1) % types.length];
        newConfig[r][c] = nextType;
        setCurrentLayout({ ...currentLayout, config: newConfig });
    };

    // Initialize config when opening create new layout
    useEffect(() => {
        if (!currentLayout.config || currentLayout.config.length === 0) {
            setCurrentLayout(prev => ({ ...prev, config: generateInitialConfig(prev.rows, prev.cols) }));
        }
    }, [isLayoutModalOpen]);

    // Update config if rows/cols change
    const handleGridSizeChange = (rows: number, cols: number) => {
        const newConfig = generateInitialConfig(rows, cols);
        setCurrentLayout({ ...currentLayout, rows, cols, config: newConfig });
    };

    if (!isAuthenticated || user?.role !== 'ADMIN') return null;

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <button
                        onClick={handleOpenLayoutManager}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" /></svg>
                        Manage Layouts
                    </button>
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                title: '',
                                description: '',
                                venue: '',
                                date: '',
                                price: '',
                                imageUrl: '',
                                category: '',
                                trailerUrl: '',
                                duration: '',
                                censorRating: ''
                            });
                            setSections([]);
                            setIsModalOpen(true);
                            fetchLayouts(); // Fetch layouts for the dropdown
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Event
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Venue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {events.map((event) => (
                            <tr key={event.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {new Date(event.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{event.venue}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${event.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Layout Manager Modal */}
            {isLayoutModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg max-w-6xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Manage Seating Layouts</h2>
                            <button onClick={() => setIsLayoutModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* List of Existing Layouts */}
                            <div className="border-r pr-4">
                                <h3 className="font-semibold mb-2 text-gray-900">Saved Layouts</h3>
                                <ul className="space-y-2">
                                    {layouts.map(layout => (
                                        <li key={layout.id} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                                            <span className="font-medium text-gray-900">{layout.name}</span>
                                            <span className="text-xs text-gray-500">{layout.totalRows}x{layout.totalCols}</span>
                                        </li>
                                    ))}
                                    {layouts.length === 0 && <p className="text-gray-500 text-sm">No layouts found.</p>}
                                </ul>
                            </div>

                            {/* Editor */}
                            <div className="md:col-span-2">
                                <h3 className="font-semibold mb-4 text-gray-900">Create / Edit Layout</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="Layout Name"
                                            value={currentLayout.name}
                                            onChange={(e) => setCurrentLayout({ ...currentLayout, name: e.target.value })}
                                            className="border p-2 rounded w-full text-gray-900"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Rows"
                                            value={currentLayout.rows}
                                            onChange={(e) => handleGridSizeChange(Number(e.target.value), currentLayout.cols)}
                                            className="border p-2 rounded w-20 text-gray-900"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Cols"
                                            value={currentLayout.cols}
                                            onChange={(e) => handleGridSizeChange(currentLayout.rows, Number(e.target.value))}
                                            className="border p-2 rounded w-20 text-gray-900"
                                        />
                                    </div>

                                    {/* Visual Grid */}
                                    <div className="overflow-x-auto border p-4 rounded bg-gray-50">
                                        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${currentLayout.cols}, minmax(30px, 1fr))` }}>
                                            {currentLayout.config.map((row: any[], rIndex: number) => (
                                                row.map((cellType: string, cIndex: number) => (
                                                    <div
                                                        key={`${rIndex}-${cIndex}`}
                                                        onClick={() => handleCellClick(rIndex, cIndex)}
                                                        className={`
                                                            h-8 w-8 flex items-center justify-center text-xs cursor-pointer rounded border
                                                            ${cellType === 'standard' ? 'bg-white border-gray-300 hover:bg-gray-100' : ''}
                                                            ${cellType === 'vip' ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : ''}
                                                            ${cellType === 'aisle' ? 'bg-transparent border-transparent' : ''}
                                                            ${cellType === 'blocked' ? 'bg-red-100 border-red-300 text-red-700' : ''}
                                                        `}
                                                        title={`Row ${rIndex + 1}, Col ${cIndex + 1} (${cellType})`}
                                                    >
                                                        {cellType === 'standard' && 'S'}
                                                        {cellType === 'vip' && 'V'}
                                                        {cellType === 'blocked' && 'X'}
                                                    </div>
                                                ))
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <div className="flex gap-4">
                                            <span className="flex items-center gap-1"><div className="w-3 h-3 border border-gray-300 bg-white"></div> Standard (Click to cycle)</span>
                                            <span className="flex items-center gap-1"><div className="w-3 h-3 border border-yellow-300 bg-yellow-100"></div> VIP</span>
                                            <span className="flex items-center gap-1"><div className="w-3 h-3 border border-transparent"></div> Aisle (Gap)</span>
                                        </div>
                                        <button onClick={handleSaveLayout} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                                            Save Layout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Event' : 'Create New Event'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Venue</label>
                                    <input
                                        type="text"
                                        value={formData.venue}
                                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Base Price</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration (mins)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Censor Rating</label>
                                    <input
                                        type="text"
                                        value={formData.censorRating}
                                        onChange={(e) => setFormData({ ...formData, censorRating: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trailer URL (YouTube)</label>
                                    <input
                                        type="url"
                                        value={formData.trailerUrl}
                                        onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-900">Seat Sections</label>
                                    <button type="button" onClick={handleAddSection} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        <Plus className="w-4 h-4" /> Add Section
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {sections.map((section, index) => (
                                        <div key={index} className="flex gap-2 items-start bg-gray-50 p-2 rounded flex-wrap">
                                            <input
                                                placeholder="Name (e.g. VIP)"
                                                value={section.name}
                                                onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                                                className="w-1/3 rounded border-gray-300 p-1 text-sm text-gray-900"
                                                required
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={section.price}
                                                onChange={(e) => handleSectionChange(index, 'price', e.target.value)}
                                                className="w-20 rounded border-gray-300 p-1 text-sm text-gray-900"
                                                required
                                            />
                                            <div className="flex flex-col gap-1 w-1/4">
                                                <select
                                                    className="rounded border-gray-300 p-1 text-xs text-gray-900"
                                                    onChange={(e) => {
                                                        const layoutId = Number(e.target.value);
                                                        const layout = layouts.find(l => l.id === layoutId);
                                                        if (layout) {
                                                            // Apply layout to section
                                                            const newSections = [...sections];
                                                            newSections[index] = {
                                                                ...newSections[index],
                                                                rows: layout.totalRows.toString(),
                                                                cols: layout.totalCols.toString(),
                                                                // We need to extend the type definition in state or just force it, 
                                                                // but wait, 'sections' state was defined as specific type.
                                                                // Let's rely on adding a hidden layoutConfig property to the state object
                                                                // @ts-ignore
                                                                layoutConfig: layout.config
                                                            };
                                                            setSections(newSections);
                                                        }
                                                    }}
                                                >
                                                    <option value="">Select Layout Template...</option>
                                                    {layouts.map(l => (
                                                        <option key={l.id} value={l.id}>{l.name} ({l.totalRows}x{l.totalCols})</option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-1">
                                                    <input
                                                        type="number"
                                                        placeholder="Rows"
                                                        value={section.rows}
                                                        onChange={(e) => handleSectionChange(index, 'rows', e.target.value)}
                                                        className="w-1/2 rounded border-gray-300 p-1 text-sm text-gray-900"
                                                        required
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Cols"
                                                        value={section.cols}
                                                        onChange={(e) => handleSectionChange(index, 'cols', e.target.value)}
                                                        className="w-1/2 rounded border-gray-300 p-1 text-sm text-gray-900"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <button type="button" onClick={() => handleRemoveSection(index)} className="text-red-500 hover:text-red-700 p-1">
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 mt-4"
                            >
                                {editingId ? 'Update Event' : 'Create Event'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
