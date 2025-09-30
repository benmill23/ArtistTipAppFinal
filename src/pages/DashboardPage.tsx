import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Settings, Home } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      // Error toast is already handled in the signOut function
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Tunely</h1>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {profile?.artist_name || user?.email || 'User'}
                  </span>
                </div>
              </div>

              {/* Navigation buttons */}
              <button
                onClick={handleGoHome}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </button>

              <button
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </button>

              {/* Sign out button */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="h-4 w-4 mr-1" />
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.artist_name || 'Artist'}!
          </h2>
          <p className="text-lg text-gray-600">
            Ready to connect with your audience and receive tips for your performances.
          </p>
        </div>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tips card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Tips</h3>
            <p className="text-3xl font-bold text-primary-600">$0.00</p>
            <p className="text-sm text-gray-500 mt-1">No tips received yet</p>
          </div>

          {/* Performances card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Performances</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
            <p className="text-sm text-gray-500 mt-1">Create your first performance</p>
          </div>

          {/* Requests card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Song Requests</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
            <p className="text-sm text-gray-500 mt-1">No requests yet</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <div className="text-center">
                <div className="text-sm font-medium">Start Performance</div>
                <div className="text-xs opacity-90 mt-1">Go live and receive tips</div>
              </div>
            </button>

            <button className="p-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <div className="text-sm font-medium">Setup Profile</div>
                <div className="text-xs text-gray-500 mt-1">Complete your artist profile</div>
              </div>
            </button>

            <button className="p-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <div className="text-sm font-medium">View Analytics</div>
                <div className="text-xs text-gray-500 mt-1">See your performance stats</div>
              </div>
            </button>

            <button className="p-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <div className="text-sm font-medium">Manage Settings</div>
                <div className="text-xs text-gray-500 mt-1">Update your preferences</div>
              </div>
            </button>
          </div>
        </div>

        {/* Account status */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Complete your setup
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  To start receiving tips, you'll need to complete your Stripe Connect setup
                  and verify your email address.
                </p>
              </div>
              <div className="mt-4">
                <button className="bg-yellow-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-900">
                  Complete Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};