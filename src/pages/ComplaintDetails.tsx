import React from 'react';
import { useParams } from 'react-router-dom';
import Loading from '../components/ui/Loading';

interface ComplaintDetailsProps {
  isAdmin?: boolean;
}

const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({ isAdmin = false }) => {
  const { id } = useParams();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // TODO: Implement complaint details fetching
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return <Loading message="Loading complaint details..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Complaint Details {isAdmin && '(Admin View)'}
        </h1>
        <p className="text-gray-600">Complaint ID: {id}</p>
        {/* TODO: Add complaint details display */}
      </div>
    </div>
  );
};

export default ComplaintDetails;