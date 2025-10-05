import React, { useState, useEffect } from 'react';
import { User, Event, EventPhoto, Attendance, AttendanceRecord } from '../types';
import api from '../services/mockApi';
import Chat from './Chat';
import { IconUsers, IconCalendar, IconClipboardCheck, IconCamera, IconChat, IconLogout } from '../constants';

type AdminView = 'approvals' | 'volunteers' | 'events' | 'event-registrations' | 'attendance' | 'gallery' | 'chat';

// Sub-components defined within the main dashboard file to reduce file count

const VolunteerApprovals: React.FC<{ refreshKey: number, onApprove: () => void }> = ({ onApprove }) => {
    const [unapproved, setUnapproved] = useState<User[]>([]);

    useEffect(() => {
        setUnapproved(api.getUsers().filter(u => u.role === 'volunteer' && !u.approved));
    }, [onApprove]);

    const handleApprove = (userId: string) => {
        api.approveUser(userId);
        onApprove();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Approvals</h2>
            {unapproved.length === 0 ? <p className="text-gray-500">No pending approvals.</p> : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                    {unapproved.map(user => (
                        <li key={user.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.rollNo} - {user.branch}</p>
                            </div>
                            <button onClick={() => handleApprove(user.id)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">Approve</button>
                        </li>
                    ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const VolunteerList: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
    const [volunteers, setVolunteers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setVolunteers(api.getUsers().filter(u => u.role === 'volunteer' && u.approved));
    }, [refreshKey]);
    
    const filteredVolunteers = volunteers.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.rollNo && v.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Registered Volunteers</h2>
                <input
                    type="text"
                    placeholder="Search by name or roll no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 w-full max-w-xs"
                />
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {filteredVolunteers.length > 0 ? filteredVolunteers.map(user => (
                        <li key={user.id} className="p-4">
                            <p className="font-semibold text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.rollNo} | {user.branch} | {user.yearSec} | {user.phone}</p>
                        </li>
                    )) : (
                        <li className="p-4 text-center text-gray-500">No volunteers found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

const EventManagement: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventDesc, setEventDesc] = useState('');

    useEffect(() => {
        setEvents(api.getEvents());
    }, [onUpdate]);

    const handleOpenCreateModal = () => {
        setEditingEvent(null);
        setEventName('');
        setEventDate('');
        setEventDesc('');
        setShowModal(true);
    };

    const handleOpenEditModal = (event: Event) => {
        setEditingEvent(event);
        setEventName(event.name);
        setEventDate(event.date);
        setEventDesc(event.description);
        setShowModal(true);
    };

    const handleSubmitEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEvent) {
            api.updateEvent(editingEvent.id, { name: eventName, date: eventDate, description: eventDesc });
        } else {
            api.createEvent({ name: eventName, date: eventDate, description: eventDesc });
        }
        setShowModal(false);
        onUpdate();
    };

    const handleDeleteEvent = (eventId: string) => {
        if (window.confirm('Are you sure you want to delete this event? This will also remove associated attendance records.')) {
            api.deleteEvent(eventId);
            onUpdate();
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Manage Events</h2>
                <button onClick={handleOpenCreateModal} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">Add Event</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                    <div key={event.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col">
                        <div className="flex-grow">
                            <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{new Date(event.date).toLocaleDateString()}</p>
                            <p className="text-gray-700 mb-4">{event.description}</p>
                            <p className="text-blue-500 font-semibold">{event.registrations.filter(r => r.status === 'confirmed').length} confirmed / {event.registrations.length} total</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
                            <button onClick={() => handleOpenEditModal(event)} className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-md hover:bg-yellow-600">Edit</button>
                            <button onClick={() => handleDeleteEvent(event.id)} className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
                        <form onSubmit={handleSubmitEvent}>
                            <input type="text" placeholder="Event Name" value={eventName} onChange={e => setEventName(e.target.value)} required className="w-full p-3 mb-4 text-gray-800 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required className="w-full p-3 mb-4 text-gray-800 bg-gray-100 border border-gray-300 rounded-md" />
                            <textarea placeholder="Description" value={eventDesc} onChange={e => setEventDesc(e.target.value)} required className="w-full p-3 mb-6 text-gray-800 bg-gray-100 border border-gray-300 rounded-md h-28" />
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">{editingEvent ? 'Save Changes' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const EventRegistrations: React.FC<{ refreshKey: number; onUpdate: () => void }> = ({ refreshKey, onUpdate }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [pendingVolunteers, setPendingVolunteers] = useState<User[]>([]);
    const [confirmedVolunteers, setConfirmedVolunteers] = useState<User[]>([]);

    useEffect(() => {
        setEvents(api.getEvents());
    }, [refreshKey]);

    useEffect(() => {
        if (selectedEventId) {
            const event = api.getEvents().find(e => e.id === selectedEventId);
            if (!event) return;

            const allUsers = api.getUsers();
            
            const pending = event.registrations
                .filter(r => r.status === 'pending')
                .map(r => allUsers.find(u => u.id === r.volunteerId))
                .filter((u): u is User => !!u);

            const confirmed = event.registrations
                .filter(r => r.status === 'confirmed')
                .map(r => allUsers.find(u => u.id === r.volunteerId))
                .filter((u): u is User => !!u);

            setPendingVolunteers(pending);
            setConfirmedVolunteers(confirmed);
        } else {
            setPendingVolunteers([]);
            setConfirmedVolunteers([]);
        }
    }, [selectedEventId, refreshKey]);

    const handleConfirm = (volunteerId: string) => {
        if (selectedEventId) {
            api.confirmRegistration(selectedEventId, volunteerId);
            alert('Volunteer confirmed!');
            onUpdate();
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Event Registrations</h2>
             <select onChange={e => setSelectedEventId(e.target.value)} value={selectedEventId} className="w-full md:w-1/2 p-3 mb-6 text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Select an Event --</option>
                {events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
            </select>

            {selectedEventId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Pending Confirmation ({pendingVolunteers.length})</h3>
                        {pendingVolunteers.length > 0 ? (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                <ul className="divide-y divide-gray-200">
                                    {pendingVolunteers.map(user => (
                                        <li key={user.id} className="p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-800">{user.name}</p>
                                                <p className="text-sm text-gray-600">{user.rollNo}</p>
                                            </div>
                                            <button onClick={() => handleConfirm(user.id)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">Confirm</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : <p className="text-gray-500">No pending registrations for this event.</p>}
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmed Volunteers ({confirmedVolunteers.length})</h3>
                         {confirmedVolunteers.length > 0 ? (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                <ul className="divide-y divide-gray-200">
                                    {confirmedVolunteers.map(user => (
                                        <li key={user.id} className="p-4">
                                            <p className="font-semibold text-gray-800">{user.name}</p>
                                            <p className="text-sm text-gray-600">{user.rollNo}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : <p className="text-gray-500">No confirmed volunteers for this event.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

const AttendanceManagement: React.FC<{ refreshKey: number, onUpdate: () => void }> = ({ refreshKey, onUpdate }) => {
    const [selectedEventId, setSelectedEventId] = useState('');
    const [events, setEvents] = useState<Event[]>([]);
    const [volunteers, setVolunteers] = useState<User[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord>({});
    const [attendanceSummary, setAttendanceSummary] = useState<string | null>(null);

    useEffect(() => {
        setEvents(api.getEvents());
    }, [refreshKey]);

    useEffect(() => {
        if(selectedEventId) {
            const event = api.getEvents().find(e => e.id === selectedEventId);
            const allUsers = api.getUsers();

            const confirmedVolunteerIds = event?.registrations.filter(r => r.status === 'confirmed').map(r => r.volunteerId) || [];
            const confirmedVolunteers = allUsers.filter(u => confirmedVolunteerIds.includes(u.id));
            setVolunteers(confirmedVolunteers);
            
            const savedAttendance = api.getAttendance()[selectedEventId] || {};
            const initialAttendance: AttendanceRecord = {};
            confirmedVolunteers.forEach(v => {
                initialAttendance[v.id] = savedAttendance[v.id] || 'absent';
            });
            setAttendance(initialAttendance);

            if (Object.keys(savedAttendance).length > 0) {
                const presentCount = Object.values(savedAttendance).filter(status => status === 'present').length;
                const absentCount = Object.keys(savedAttendance).length - presentCount;
                setAttendanceSummary(`${presentCount} Present, ${absentCount} Absent`);
            } else {
                setAttendanceSummary(null);
            }
        } else {
            setVolunteers([]);
            setAttendance({});
            setAttendanceSummary(null);
        }
    }, [selectedEventId, refreshKey]);

    const handleAttendanceChange = (volunteerId: string, status: 'present' | 'absent') => {
        setAttendance(prev => ({...prev, [volunteerId]: status}));
    };

    const handleSubmitAttendance = () => {
        if (!selectedEventId || volunteers.length === 0) return;
        api.postAttendance(selectedEventId, attendance);
        alert('Attendance submitted successfully!');
        onUpdate();
    };

    const handleDeleteAttendance = () => {
        if (!selectedEventId) return;
        if (window.confirm('Are you sure you want to delete the attendance record for this event? This action cannot be undone.')) {
            api.deleteAttendance(selectedEventId);
            alert('Attendance record deleted.');
            onUpdate();
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Post Attendance</h2>
            <select onChange={e => setSelectedEventId(e.target.value)} value={selectedEventId} className="w-full md:w-1/2 p-3 mb-6 text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Select an Event --</option>
                {events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
            </select>
            {selectedEventId && (
                <div>
                     {attendanceSummary && (
                        <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Attendance Summary</h3>
                            <p className="text-gray-600">{attendanceSummary}</p>
                        </div>
                    )}
                     <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <ul className="divide-y divide-gray-200">
                           {volunteers.length > 0 ? volunteers.map(v => (
                               <li key={v.id} className="p-4 flex justify-between items-center">
                                   <div>
                                       <p className="font-semibold text-gray-800">{v.name}</p>
                                       <p className="text-sm text-gray-600">{v.rollNo}</p>
                                   </div>
                                   <div className="flex gap-4">
                                       <button onClick={() => handleAttendanceChange(v.id, 'present')} className={`px-4 py-1 rounded-md ${attendance[v.id] === 'present' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Present</button>
                                       <button onClick={() => handleAttendanceChange(v.id, 'absent')} className={`px-4 py-1 rounded-md ${attendance[v.id] === 'absent' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Absent</button>
                                   </div>
                               </li>
                           )) : (
                               <li className="p-4 text-center text-gray-500">No confirmed volunteers for this event.</li>
                           )}
                       </ul>
                    </div>
                    <div className="mt-6 flex gap-4">
                        {volunteers.length > 0 && <button onClick={handleSubmitAttendance} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Submit Attendance</button>}
                        {attendanceSummary && <button onClick={handleDeleteAttendance} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Delete Attendance</button>}
                    </div>
                </div>
            )}
        </div>
    );
};


const GalleryManagement: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const [photos, setPhotos] = useState<EventPhoto[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [eventName, setEventName] = useState('');
    const [error, setError] = useState('');
    const [editingPhoto, setEditingPhoto] = useState<EventPhoto | null>(null);
    const [editDescription, setEditDescription] = useState('');
    const [editEventName, setEditEventName] = useState('');

    useEffect(() => {
        setPhotos(api.getEventPhotos());
    }, [onUpdate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file.');
                setSelectedFile(null);
                return;
            }
            setError('');
            setSelectedFile(file);
        }
    };

    const handleAddPhoto = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select an image to upload.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            if (imageUrl) {
                api.addEventPhoto({ imageUrl, description, eventName, date: new Date().toISOString() });
                setSelectedFile(null);
                setDescription('');
                setEventName('');
                setError('');
                const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                onUpdate();
            }
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleOpenEditModal = (photo: EventPhoto) => {
        setEditingPhoto(photo);
        setEditEventName(photo.eventName);
        setEditDescription(photo.description);
    };

    const handleCloseEditModal = () => {
        setEditingPhoto(null);
        setEditEventName('');
        setEditDescription('');
    };

    const handleUpdatePhoto = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPhoto) return;
        api.updateEventPhoto(editingPhoto.id, { eventName: editEventName, description: editDescription });
        handleCloseEditModal();
        onUpdate();
    };

    const handleDeletePhoto = (photoId: string) => {
        if (window.confirm('Are you sure you want to delete this photo?')) {
            api.deleteEventPhoto(photoId);
            onUpdate();
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Gallery</h2>
            <form onSubmit={handleAddPhoto} className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Post New Photo</h3>
                {error && <p className="text-red-700 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
                
                <div className="mb-4">
                    <label htmlFor="photo-upload" className="block text-sm font-bold text-gray-600 mb-2">Upload Photo</label>
                    <input 
                        id="photo-upload"
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange} 
                        required 
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                </div>

                <input type="text" placeholder="Event Name" value={eventName} onChange={e => setEventName(e.target.value)} required className="w-full p-3 mb-4 text-gray-800 bg-gray-100 border border-gray-300 rounded-md" />
                <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-3 mb-4 text-gray-800 bg-gray-100 border border-gray-300 rounded-md h-24" />
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Post Photo</button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map(photo => (
                    <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <img src={photo.imageUrl} alt={photo.description} className="w-full h-48 object-cover"/>
                        <div className="p-4">
                            <h4 className="font-bold text-gray-800">{photo.eventName}</h4>
                            <p className="text-gray-700 flex-grow">{photo.description}</p>
                             <div className="mt-2 pt-2 border-t flex justify-end gap-2">
                                <button onClick={() => handleOpenEditModal(photo)} className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-md hover:bg-yellow-600">Edit</button>
                                <button onClick={() => handleDeletePhoto(photo.id)} className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {editingPhoto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Photo Details</h2>
                        <form onSubmit={handleUpdatePhoto}>
                            <input type="text" placeholder="Event Name" value={editEventName} onChange={e => setEditEventName(e.target.value)} required className="w-full p-3 mb-4 text-gray-800 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <textarea placeholder="Description" value={editDescription} onChange={e => setEditDescription(e.target.value)} required className="w-full p-3 mb-6 text-gray-800 bg-gray-100 border border-gray-300 rounded-md h-28" />
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={handleCloseEditModal} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


const AdminDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
    const [view, setView] = useState<AdminView>('approvals');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUpdate = () => setRefreshKey(prev => prev + 1);

    const navItems: { id: AdminView, label: string, icon: React.ReactElement }[] = [
        { id: 'approvals', label: 'Approvals', icon: <IconClipboardCheck/> },
        { id: 'volunteers', label: 'Volunteers', icon: <IconUsers/> },
        { id: 'events', label: 'Events', icon: <IconCalendar/> },
        { id: 'event-registrations', label: 'Registrations', icon: <IconClipboardCheck/> },
        { id: 'attendance', label: 'Attendance', icon: <IconClipboardCheck/> },
        { id: 'gallery', label: 'Gallery', icon: <IconCamera/> },
        { id: 'chat', label: 'Chat', icon: <IconChat/> },
    ];

    return (
        <div className="flex h-screen bg-gray-100 text-gray-800">
            <aside className="w-64 bg-white p-4 flex flex-col border-r border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Panel</h1>
                <nav className="flex-1">
                    <ul>
                        {navItems.map(item => (
                             <li key={item.id} className="mb-2">
                                <button onClick={() => setView(item.id)} className={`w-full text-left flex items-center p-3 rounded-lg transition ${view === item.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
                                    {item.icon}
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div>
                    <button onClick={onLogout} className="w-full text-left flex items-center p-3 rounded-lg transition hover:bg-red-100 text-red-600 font-semibold">
                        <IconLogout />
                        Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {view === 'approvals' && <VolunteerApprovals refreshKey={refreshKey} onApprove={handleUpdate} />}
                {view === 'volunteers' && <VolunteerList refreshKey={refreshKey} />}
                {view === 'events' && <EventManagement onUpdate={handleUpdate} />}
                {view === 'event-registrations' && <EventRegistrations refreshKey={refreshKey} onUpdate={handleUpdate} />}
                {view === 'attendance' && <AttendanceManagement refreshKey={refreshKey} onUpdate={handleUpdate} />}
                {view === 'gallery' && <GalleryManagement onUpdate={handleUpdate} />}
                {view === 'chat' && <Chat currentUser={user} />}
            </main>
        </div>
    );
};

export default AdminDashboard;