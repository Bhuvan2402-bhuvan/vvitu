import React, { useState, useEffect } from 'react';
import { User, Event, EventPhoto, RegistrationStatus } from '../types';
import api from '../services/mockApi';
import Chat from './Chat';
import { IconCalendar, IconClipboardCheck, IconCamera, IconChat, IconUsers, IconLogout } from '../constants';

type VolunteerView = 'events' | 'attendance' | 'gallery' | 'chat' | 'profile';

// Sub-components
const EventRegistration: React.FC<{ user: User; onUpdate: () => void }> = ({ user, onUpdate }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    useEffect(() => {
        setEvents(api.getEvents());
    }, [onUpdate]);
    
    const handleRegistrationPrompt = (event: Event) => {
        setSelectedEvent(event);
        setShowConfirmation(true);
    };

    const handleConfirmRegister = () => {
        if (!selectedEvent) return;
        if(api.registerForEvent(selectedEvent.id, user.id)) {
            alert('Successfully registered for the event! Please wait for admin confirmation.');
            onUpdate();
        } else {
            alert('Failed to register. You may already be registered.');
        }
        setShowConfirmation(false);
        setSelectedEvent(null);
    };

    const handleCancelRegister = () => {
        setShowConfirmation(false);
        setSelectedEvent(null);
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => {
                    const registration = event.registrations.find(r => r.volunteerId === user.id);
                    const registrationStatus: RegistrationStatus | null = registration ? registration.status : null;

                    return (
                        <div key={event.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between border border-gray-200">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{new Date(event.date).toLocaleDateString()}</p>
                                <p className="text-gray-700 mb-4">{event.description}</p>
                            </div>
                             <button 
                                onClick={() => registrationStatus === null && handleRegistrationPrompt(event)}
                                disabled={registrationStatus !== null}
                                className={`w-full mt-4 px-4 py-2 font-semibold rounded-lg transition ${
                                    registrationStatus === 'confirmed' 
                                        ? 'bg-green-600 text-white cursor-not-allowed'
                                        : registrationStatus === 'pending'
                                        ? 'bg-yellow-600 text-white cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {registrationStatus === 'confirmed' ? 'Registered & Confirmed' : 
                                 registrationStatus === 'pending' ? 'Pending Confirmation' : 
                                 'Register'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {showConfirmation && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Registration</h2>
                        <p className="text-gray-700 mb-6">Are you sure you want to register for <span className="font-bold text-gray-800">{selectedEvent.name}</span>?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={handleCancelRegister} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600">Cancel</button>
                            <button onClick={handleConfirmRegister} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MyAttendance: React.FC<{ user: User }> = ({ user }) => {
    const [myAttendance, setMyAttendance] = useState<({ eventName: string; status: string; date: string })[]>([]);
    const [monthlySummary, setMonthlySummary] = useState<{ [key: string]: { present: number; absent: number; total: number } }>({});
    
    useEffect(() => {
        const allEvents = api.getEvents();
        const allAttendance = api.getAttendance();
        const userAttendance = allEvents
            .filter(event => event.registrations.some(r => r.volunteerId === user.id && r.status === 'confirmed'))
            .map(event => {
                const eventAttendance = allAttendance[event.id];
                const status = eventAttendance && eventAttendance[user.id] ? eventAttendance[user.id] : 'Pending';
                return {
                    eventName: event.name,
                    status: status.charAt(0).toUpperCase() + status.slice(1),
                    date: event.date,
                };
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setMyAttendance(userAttendance);

        const summary: { [key: string]: { present: number; absent: number; total: number } } = {};
        userAttendance.forEach(att => {
            if (att.status === 'Pending') return;
            const date = new Date(att.date);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            if (!summary[monthYear]) {
                summary[monthYear] = { present: 0, absent: 0, total: 0 };
            }
            
            summary[monthYear].total += 1;
            if (att.status === 'Present') {
                summary[monthYear].present += 1;
            } else if (att.status === 'Absent') {
                summary[monthYear].absent += 1;
            }
        });
        setMonthlySummary(summary);

    }, [user.id]);
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Attendance</h2>
            
            <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Summary</h3>
            {Object.keys(monthlySummary).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {Object.entries(monthlySummary).map(([monthYear, data]) => (
                        <div key={monthYear} className="bg-white p-4 rounded-lg shadow-inner border border-gray-200">
                            <h4 className="font-bold text-lg text-gray-800 mb-2">{monthYear}</h4>
                            <p className="text-green-600">Present: {data.present}</p>
                            <p className="text-red-600">Absent: {data.absent}</p>
                            <p className="text-gray-600 mt-1">Total Events Attended: {data.total}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-200 mb-8">
                    <p className="text-gray-600">No attendance records to summarize yet.</p>
                </div>
            )}

            <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Records</h3>
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {myAttendance.length > 0 ? myAttendance.map((att, index) => (
                        <li key={index} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800">{att.eventName}</p>
                                <p className="text-sm text-gray-600">{new Date(att.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                att.status === 'Present' ? 'bg-green-100 text-green-800' :
                                att.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>{att.status}</span>
                        </li>
                    )) : (
                        <li className="p-4 text-center text-gray-500">No attendance records found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

const EventGallery: React.FC = () => {
    const [photos, setPhotos] = useState<EventPhoto[]>([]);

    useEffect(() => {
        setPhotos(api.getEventPhotos());
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map(photo => (
                    <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <img src={photo.imageUrl} alt={photo.description} className="w-full h-48 object-cover"/>
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-800">{photo.eventName}</h3>
                            <p className="text-gray-700">{photo.description}</p>
                            <p className="text-xs text-gray-500 mt-2">{new Date(photo.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MyProfile: React.FC<{user: User}> = ({ user }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <p className="mb-2"><span className="font-bold text-gray-500">Name:</span> <span className="text-gray-800">{user.name}</span></p>
                <p className="mb-2"><span className="font-bold text-gray-500">Roll No:</span> <span className="text-gray-800">{user.rollNo}</span></p>
                <p className="mb-2"><span className="font-bold text-gray-500">Branch:</span> <span className="text-gray-800">{user.branch}</span></p>
                <p className="mb-2"><span className="font-bold text-gray-500">Year & Section:</span> <span className="text-gray-800">{user.yearSec}</span></p>
                <p><span className="font-bold text-gray-500">Phone:</span> <span className="text-gray-800">{user.phone}</span></p>
            </div>
        </div>
    );
};

const VolunteerDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
    const [view, setView] = useState<VolunteerView>('events');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUpdate = () => setRefreshKey(prev => prev + 1);

    const navItems: { id: VolunteerView, label: string, icon: React.ReactElement }[] = [
        { id: 'profile', label: 'My Profile', icon: <IconUsers/> },
        { id: 'events', label: 'Events', icon: <IconCalendar/> },
        { id: 'attendance', label: 'My Attendance', icon: <IconClipboardCheck/> },
        { id: 'gallery', label: 'Gallery', icon: <IconCamera/> },
        { id: 'chat', label: 'Chat', icon: <IconChat/> },
    ];

    return (
        <div className="flex h-screen bg-gray-100 text-gray-800">
            <aside className="w-64 bg-white p-4 flex flex-col border-r border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">VITU NSS</h1>
                <p className="text-gray-600 mb-8">{user.name}</p>
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
                {view === 'profile' && <MyProfile user={user} />}
                {view === 'events' && <EventRegistration user={user} onUpdate={handleUpdate} />}
                {view === 'attendance' && <MyAttendance user={user} />}
                {view === 'gallery' && <EventGallery />}
                {view === 'chat' && <Chat currentUser={user} />}
            </main>
        </div>
    );
};

export default VolunteerDashboard;