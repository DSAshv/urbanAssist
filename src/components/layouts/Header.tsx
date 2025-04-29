import React, { useState, useRef, useEffect } from 'react';
import { messaging, getToken, onMessage } from '../../firebase'; // import from firebase.ts
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, UserCircle, Search, LogOut, Settings, User, ChevronDown, AlertTriangle, Check, X, MenuIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface Notification {
  id: string;
  message: string;
  type: 'status' | 'comment' | 'resolved';
  read: boolean;
  time: string;
}

interface HeaderProps {
  toggleSidebar: () => void;
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isAdmin = false }) => {
  const { authState, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
        } else {
          console.warn('Notification permission not granted.');
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };

    requestPermission();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      const { title, body } = payload.notification!;
      const newNotification: Notification = {
        id: new Date().getTime().toString(),
        message: body || '',
        type: 'status', // You can customize type based on payload data
        read: false,
        time: 'just now',
      };
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (

    <header className="bg-white shadow-sm fixed w-full z-20">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 md:hidden"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <Link to={isAdmin ? '/admin/dashboard' : '/app/dashboard'} className="flex items-center">
                <span className="text-primary-700 font-bold text-xl">Urban<span className="text-secondary-600">Assist</span></span>
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">


              {/* Admin/User toggle button */}
              {authState.user?.role === 'admin' && (
                <Link
                  to={isAdmin ? '/app/dashboard' : '/admin/dashboard'}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isAdmin ? 'Switch to User View' : 'Go To Admin Console'}
                </Link>
              )}
            </div>

            {/* Search box - visible on larger screens */}
            <div className="hidden md:block relative mx-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Notifications */}
            <div className="relative ml-3" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                          <button className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                            Mark all as read
                          </button>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-primary-50' : ''
                                }`}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mr-3">
                                  {notification.type === 'status' && (
                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                  )}
                                  {notification.type === 'comment' && (
                                    <Bell className="h-5 w-5 text-blue-500" />
                                  )}
                                  {notification.type === 'resolved' && (
                                    <Check className="h-5 w-5 text-green-500" />
                                  )}
                                </div>
                                <div className="w-full">
                                  <p className="text-sm text-gray-800">{notification.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                </div>
                                {!notification.read && (
                                  <div className="ml-2 mt-0.5">
                                    <span className="inline-block h-2 w-2 rounded-full bg-primary-500"></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center">
                            <p className="text-sm text-gray-500">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-2 border-t border-gray-200">
                        <a
                          href="#"
                          className="block text-center text-sm font-medium text-primary-600 hover:text-primary-800"
                        >
                          View all notifications
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div className="ml-3 relative" ref={userMenuRef}>
              <div>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">Open user menu</span>
                  {authState.user?.profilePicture ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={authState.user.profilePicture}
                      alt="User profile"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800">
                      {authState.user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="hidden md:flex md:items-center ml-2">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {authState.user
                        ? `${authState.user.firstName} ${authState.user.lastName}`
                        : 'User'}
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                  </div>
                </button>
              </div>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {authState.user
                            ? `${authState.user.firstName} ${authState.user.lastName}`
                            : 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{authState.user?.email}</p>
                      </div>
                      <Link
                        to={isAdmin ? '/admin/profile' : '/app/profile'}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4 text-gray-500" />
                        Your Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="mr-2 h-4 w-4 text-gray-500" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
