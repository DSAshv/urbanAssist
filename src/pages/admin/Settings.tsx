import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const [envVars, setEnvVars] = useState({});
  const [editedVars, setEditedVars] = useState({});

  useEffect(() => {
    fetch('/api/admin/settings')  // <-- Correct endpoint
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEnvVars(data.data);
          setEditedVars(data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch env vars:', err));
  }, []);

  const handleChange = (key, value) => {
    setEditedVars(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedVars),
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        toast.success('Environment variables updated successfully!');
      } else {
        toast.error('Failed to update environment variables.');
      }
    })
    .catch((err) => {
      console.error('Error saving env vars:', err);
      toast.error('An error occurred while saving.');
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Environment Variables</h1>
      <div className="space-y-4">
        {Object.entries(editedVars).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <label className="w-1/3 font-semibold">{key}</label>
            <input
              className="w-2/3 border border-gray-300 rounded-md px-3 py-2"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md"
      >
        Save Changes
      </button>

      {/* Note about server restart */}
      <p className="mt-4 text-sm text-gray-500">
        <strong>Note:</strong> Any changes made here will require a server restart to take effect.
      </p>
    </div>
  );
}
