import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PlusCircle, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import { Complaint, PaginatedResponse } from '../types';
import { API_URL } from '../config';
import ComplaintCard from '../components/complaints/ComplaintCard';
import Pagination from '../components/ui/Pagination';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<{
    status?: string;
    category?: string;
  }>({});

  const authState  = useAuth();

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '10');
      
      if (filter.status) {
        params.append('status', filter.status);
      }
      
      if (filter.category) {
        params.append('category', filter.category);
      }
      
      const response = await axios.get<PaginatedResponse<{ complaints: Complaint[] }>>(
        `${API_URL}/api/complaints?${params.toString()}`
      );
      
      setComplaints(response.data.data.complaints);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError('Failed to load complaints. Please try again.');
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [currentPage, filter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const applyFilter = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your submitted community issues
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/app/complaints/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            New Complaint
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-0">
            <Filter className="w-5 h-5 inline-block mr-2 text-primary-500" />
            Filter Complaints
          </h2>
          <button
            onClick={() => {
              setFilter({});
              setCurrentPage(1);
            }}
            className="inline-flex items-center px-3 py-1.5 text-sm text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-md"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={filter.status || ''}
              onChange={(e) => applyFilter({ ...filter, status: e.target.value || undefined })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={filter.category || ''}
              onChange={(e) => applyFilter({ ...filter, category: e.target.value || undefined })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              <option value="road">Road</option>
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="garbage">Garbage</option>
              <option value="streetlight">Streetlight</option>
              <option value="sewage">Sewage</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading your complaints..." />
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description="You haven't submitted any complaints yet. Start by reporting a new community issue."
          actionLabel="Report New Issue"
          actionUrl="/app/complaints/new"
          icon={<AlertTriangle className="w-12 h-12 text-gray-400" />}
        />
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {complaints.map((complaint) => (
              <motion.div key={complaint._id} variants={itemVariants}>
                <ComplaintCard complaint={complaint} />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;