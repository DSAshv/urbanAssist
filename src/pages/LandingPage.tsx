import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Users } from 'lucide-react';
import profile1 from '../assets/profile1.png';
import profile2 from '../assets/profile2.png';
import Footer from '../components/layouts/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">UrbanAssist</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Your Voice Matters in</span>
            <span className="block text-blue-600">Community Development</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Report issues, track progress, and help improve your community. Together, we can make our city better.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Easy Reporting</h3>
              <p className="mt-2 text-base text-gray-500">
                Submit and track your complaints with our user-friendly interface
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Secure Process</h3>
              <p className="mt-2 text-base text-gray-500">
                Your information is protected with state-of-the-art security
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Community Driven</h3>
              <p className="mt-2 text-base text-gray-500">
                Join others in making our community better for everyone
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Creators */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">Meet the Creators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
              <img
                className="h-40 w-40 rounded-full object-cover mb-10"
                src={profile1}
                alt="CH.Naga Sudheer"
              />
              <h3 className="text-xl font-semibold text-gray-900">CH.Naga Sudheer</h3>
              <p className="mt-2 text-base text-gray-500">
                Passionate about building tech solutions that make a real difference.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
              <img
                className="h-40 w-40 rounded-full object-cover mb-10"
                src={profile2}
                alt="S.Keerthipavan"
              />
              <h3 className="text-xl font-semibold text-gray-900">S.Keerthipavan</h3>
              <p className="mt-2 text-base text-gray-500">
                Developer and designer who loves crafting beautiful user experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      
      {/* <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              © 2025 UrbanAssist. All rights reserved.
            </p>
          </div>
        </div>
      </footer> */}

      <Footer />
    </div>
  );
};

export default LandingPage;