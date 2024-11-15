import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TreePine, LogIn, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchAvatar = async () => {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (profile?.avatar_url) {
          const { data } = await supabase.storage
            .from('avatars')
            .createSignedUrl(profile.avatar_url, 3600);
          
          if (data?.signedUrl) {
            setAvatarUrl(data.signedUrl);
          }
        }
      };

      fetchAvatar();
    }
  }, [user]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <TreePine className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">FamilyRoot</span>
            </Link>
            <div className="hidden md:flex md:items-center md:ml-8 space-x-4">
              <Link to="/" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="inline-flex items-center space-x-2"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover border-2 border-emerald-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=10b981&color=fff`;
                      }}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-500">
                      <span className="text-sm font-medium text-emerald-600">
                        {user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </Link>
                <button
                  onClick={handleSignOut}
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-emerald-600 text-sm font-medium rounded-md text-emerald-600 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}