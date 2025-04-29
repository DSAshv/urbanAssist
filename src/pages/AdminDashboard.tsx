import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Filter, 
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertOctagon
} from 'lucide-react';
import { Complaint, ComplaintStats, PaginatedResponse } from '../types';
import { API_URL } from '../config';
import { User, FileText, File } from 'lucide-react'; // Import necessary icons

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<ComplaintStats | null>(null);
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

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/complaints/stats`);
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleGenerateReport = async (type: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/reports/generate`, { type });
      // Handle successful report generation
      console.log('Report request added to queue:', response.data);
      alert('Report generation has been added to the queue. You will receive an email once ready.');
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

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
    fetchStats();
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
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Prepare chart data
  const statusData = {
    labels: ['Pending', 'In Progress', 'Resolved'],
    datasets: [
      {
        label: 'Complaint Status',
        data: [
          stats?.statusStats.find(s => s._id === 'pending')?.count || 0,
          stats?.statusStats.find(s => s._id === 'in-progress')?.count || 0,
          stats?.statusStats.find(s => s._id === 'resolved')?.count || 0
        ],
        backgroundColor: ['rgba(255, 159, 64, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(255, 159, 64, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1
      }
    ]
  };

  const priorityData = {
    labels: ['Urgent', 'High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Priority Complaints',
        data: [
          stats?.priorityStats.find(p => p._id === 'urgent')?.count || 0,
          stats?.priorityStats.find(p => p._id === 'high')?.count || 0,
          stats?.priorityStats.find(p => p._id === 'medium')?.count || 0,
          stats?.priorityStats.find(p => p._id === 'low')?.count || 0
        ],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 159, 64, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage and oversee all community complaints
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.statusStats.find(s => s._id === 'pending')?.count || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.statusStats.find(s => s._id === 'in-progress')?.count || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.statusStats.find(s => s._id === 'resolved')?.count || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertOctagon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.priorityStats.find(p => p._id === 'urgent')?.count || 0}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

<div className="mb-8">
  {/* Charts Container */}
  <div className="flex flex-col md:flex-row justify-between gap-6">
    {/* Status Chart */}
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-lg shadow-md p-6 w-full md:w-1/2"
    >
      <h3 className="text-lg font-semibold text-gray-900">Complaint Status Distribution</h3>
      <Bar data={statusData} />
    </motion.div>

    {/* Priority Chart */}
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-lg shadow-md p-6 w-full md:w-1/2"
    >
      <h3 className="text-lg font-semibold text-gray-900">Complaint Priority Distribution</h3>
      <Bar data={priorityData} />
    </motion.div>
  </div>
</div>

      {/* Report Generation Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Overall Report Widget */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-100"
          onClick={() => handleGenerateReport('overall')}
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <File className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Generate Overall Report</h3>
              <p className="text-sm text-gray-600">Generate a report of all complaints</p>
            </div>
          </div>
        </motion.div>

        {/* Complaints Report Widget */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-100"
          onClick={() => handleGenerateReport('complaints')}
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Generate Complaints Report</h3>
              <p className="text-sm text-gray-600">Generate a report of specific complaints</p>
            </div>
          </div>
        </motion.div>

        {/* Users Report Widget */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-100"
          onClick={() => handleGenerateReport('users')}
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <User className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Generate Users Report</h3>
              <p className="text-sm text-gray-600">Generate a detailed report for users</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
