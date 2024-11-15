import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TreeView from './pages/TreeView';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import { initializeDatabase } from './lib/supabase-init';
import { initializeStorage } from './lib/storage-init';

export default function App() {
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize database first
        await initializeDatabase();
        
        // Then initialize storage
        const storageInitialized = await initializeStorage();
        
        if (!storageInitialized) {
          console.warn('Storage initialization incomplete. Some features may be limited.');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setInitError('Failed to initialize application. Some features may be limited.');
      }
    };
    
    init();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          {initError && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{initError}</p>
                </div>
              </div>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tree/:treeId" element={<TreeView />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}