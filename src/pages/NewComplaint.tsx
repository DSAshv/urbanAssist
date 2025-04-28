import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { MapPin, Upload, X, Check, ArrowLeft } from 'lucide-react';

import { API_URL } from '../config';
import { ComplaintCategory, ComplaintPriority } from '../types';

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

interface NewComplaintFormData {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation?: { lat: number; lng: number };
}

const MapSelector: React.FC<MapSelectorProps> = ({ onLocationSelect, initialLocation }) => {
  const defaultLocation: [number, number] = [13.0827, 80.2707];
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialLocation ? [initialLocation.lat, initialLocation.lng] : defaultLocation);
  const [map, setMap] = useState<any>(null);

  const fetchCurrentLocation = async () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLatLng = { lat: latitude, lng: longitude };
        setMarker(newLatLng);
        setMapCenter([latitude, longitude]);
        if (map) {
          map.setView([latitude, longitude], 16);
        }
        try {
          const response = await axios.get(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          const address = response.data.display_name;
          onLocationSelect(latitude, longitude, address);
        } catch (error) {
          console.error('Geocoding error:', error);
          onLocationSelect(latitude, longitude, 'Unknown location');
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };

  const LocationMarker = () => {
    useMapEvents({
      click: async (e) => {
        setMarker(e.latlng);
        try {
          const response = await axios.get(`/api/reverse-geocode?lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
          const address = response.data.display_name;
          onLocationSelect(e.latlng.lat, e.latlng.lng, address);
        } catch (error) {
          console.error('Geocoding error:', error);
          onLocationSelect(e.latlng.lat, e.latlng.lng, 'Unknown location');
        }
      },
    });

    return marker ? <Marker position={marker} icon={customIcon} /> : null;
  };

  return (
    <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300 relative">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(mapInstance) => {
          setMap(mapInstance);
          fetchCurrentLocation();
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>

      {/* Bottom Bar */}
      <div className="bg-white bg-opacity-90 p-2 absolute bottom-0 left-0 right-0 z-[1000] text-sm text-gray-600 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-primary-600" />
          {marker ? "Click anywhere to change location" : "Allow location access or click on the map"}
        </div>
        {/* Button to set current location manually */}
        <button
          onClick={fetchCurrentLocation}
          type="button"
          className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium py-1 px-3 rounded ml-2"
        >
          Use Current Location
        </button>
      </div>
    </div>
  );
};



const NewComplaint: React.FC = () => {
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<NewComplaintFormData>();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setValue('location.latitude', lat);
    setValue('location.longitude', lng);
    setValue('location.address', address);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Check if total files exceed 5
      if (selectedFiles.length + files.length > 5) {
        toast.error('You can upload a maximum of 5 images');
        return;
      }
      
      // Check file sizes (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = files.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        toast.error(`Some files exceed the 5MB size limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...files]);
      
      // Create preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeFile = (index: number) => {
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: NewComplaintFormData) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      
      // Location data
      formData.append('location[latitude]', data.location.latitude.toString());
      formData.append('location[longitude]', data.location.longitude.toString());
      formData.append('location[address]', data.location.address);
      
      // Append images
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      await axios.post(`${API_URL}/api/complaints`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Complaint submitted successfully!');
      navigate('/app/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationData = watch('location');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report New Issue</h1>
          <p className="text-gray-600 mt-1">
            Provide details about the community problem you've noticed
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Brief description of the issue"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a category</option>
                <option value="road">Road</option>
                <option value="water">Water</option>
                <option value="electricity">Electricity</option>
                <option value="garbage">Garbage</option>
                <option value="streetlight">Streetlight</option>
                <option value="sewage">Sewage</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                {...register('priority')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                defaultValue="medium"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                {...register('description', { 
                  required: 'Description is required',
                  minLength: {
                    value: 20,
                    message: 'Description must be at least 20 characters'
                  }
                })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Provide detailed information about the issue..."
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <Controller
                name="location"
                control={control}
                defaultValue={{ latitude: 0, longitude: 0, address: '' }}
                rules={{
                  validate: value =>
                    (value.latitude !== 0 && value.longitude !== 0) ||
                    'Please select a location on the map'
                }}
                render={({ field }) => (
                  <MapSelector
                    onLocationSelect={handleLocationSelect}
                    initialLocation={
                      field.value.latitude !== 0 && field.value.longitude !== 0
                        ? { lat: field.value.latitude, lng: field.value.longitude }
                        : undefined
                    }
                  />
                )}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
              {locationData?.address && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Selected address:</span> {locationData.address}
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images (Max 5)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload images</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB each
                  </p>
                </div>
              </div>

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index}`}
                        className="h-24 w-full object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Submit Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewComplaint;