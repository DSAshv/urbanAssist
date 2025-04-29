import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { authState } = useAuth();
  const { user } = authState;

  return (
    <div className="container">
      <div className=" bg-white rounded-2xl shadow-lg p-8 space-y-8">
        {/* Heading */}
        <div className="flex items-center space-x-4">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-700">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h1>
            <p className="text-sm text-gray-600">{user?.role?.toUpperCase()}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="border-b pb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <p className="mt-1 text-gray-900">{user?.email}</p>
            </div>
            {user?.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                <p className="mt-1 text-gray-900">{user.phone}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-600">Account Created</label>
              <p className="mt-1 text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Last Updated</label>
              <p className="mt-1 text-gray-900">
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        {user?.address && (
          <div className="border-b pb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Address</h2>
            <div className="space-y-2 text-gray-900">
              <p>{user.address.street}</p>
              <p>{user.address.city}, {user.address.state} {user.address.zipCode}</p>
              <p>{user.address.country}</p>
            </div>
          </div>
        )}


        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Security Settings</h2>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">
                {user?.mfaEnabled ? 'Enabled' : 'Not enabled'}
              </p>
            </div>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => window.location.href = '/mfa/setup'}
            >
              {user?.mfaEnabled ? 'Manage 2FA' : 'Enable 2FA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;