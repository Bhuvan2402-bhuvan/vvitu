import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import VolunteerDashboard from './components/VolunteerDashboard';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = sessionStorage.getItem('currentUser');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from session storage", error);
            sessionStorage.removeItem('currentUser');
        }
        setIsLoading(false);
    }, []);

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    };

    const handleLogout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
    };

    if (isLoading) {
        return <div className="bg-gray-100 h-screen flex justify-center items-center text-gray-800">Loading...</div>;
    }

    const renderContent = () => {
        if (!currentUser) {
            return (
                 <div className="w-full min-h-screen bg-gray-100 text-gray-800 flex flex-col justify-center items-center p-4">
                    <div className="text-center mb-8">
                      <h1 className="text-5xl font-bold mb-2">VVITU NSS ERP</h1>
                      <p className="text-xl text-gray-600">Empowering communities, one volunteer at a time.</p>
                    </div>
                    <Auth onLoginSuccess={handleLoginSuccess} />
                </div>
            );
        }

        if (currentUser.role === UserRole.VOLUNTEER && !currentUser.approved) {
            return (
                <div className="bg-gray-100 h-screen flex flex-col justify-center items-center text-gray-800 text-center p-4">
                    <h2 className="text-3xl font-bold mb-4">Approval Pending</h2>
                    <p className="text-gray-700 max-w-md mb-8">
                        Thank you for registering, {currentUser.name}. Your account is currently awaiting approval from an administrator. Please check back later.
                    </p>
                    <button onClick={handleLogout} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
                        Logout
                    </button>
                </div>
            );
        }
        
        return (
            <div className="min-h-screen">
                {currentUser.role === UserRole.ADMIN ? (
                    <AdminDashboard user={currentUser} onLogout={handleLogout} />
                ) : (
                    <VolunteerDashboard user={currentUser} onLogout={handleLogout} />
                )}
            </div>
        );
    };

    return (
      <div className="bg-gray-100 min-h-screen">
        {renderContent()}
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 text-center p-2 text-gray-600 text-sm">
            <p>"NSS - NOT ME BUT YOU"</p>
        </footer>
      </div>
    );
};

export default App;