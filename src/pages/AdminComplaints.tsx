import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Filter, RefreshCw } from 'lucide-react';
import { Complaint, PaginatedResponse } from '../types';
import { API_URL } from '../config';
import ComplaintCard from '../components/complaints/ComplaintCard';
import Pagination from '../components/ui/Pagination';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';

const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<{
    status?: string;
    category?: string;
    priority?: string;
    department?: string;
  }>({});

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '9');
      
      Object.entries(filter).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
        <p className="text-gray-600 mt-1">View and manage all submitted complaints.</p>
      </div>

      {/* Filters */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={filter.priority || ''}
              onChange={(e) => applyFilter({ ...filter, priority: e.target.value || undefined })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              value={filter.department || ''}
              onChange={(e) => applyFilter({ ...filter, department: e.target.value || undefined })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Departments</option>
              <option value="roads">Roads</option>
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="sanitation">Sanitation</option>
              <option value="public-works">Public Works</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : complaints.length === 0 ? (
        <EmptyState title="No complaints found" description="Try adjusting your filters." />
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {complaints.map((complaint) => (
            <motion.div key={complaint._id} variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
              <ComplaintCard complaint={complaint} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
