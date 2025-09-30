import React, { useState } from 'react';
import type { Course, CourseFormData, DayOfWeek } from '../types/course';
import { DAYS_OF_WEEK } from '../types/course';
import { generateId, validateTimeRange } from '../utils/helpers';

interface CourseFormProps {
  onCourseAdded: (course: Course) => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({ onCourseAdded }) => {
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    location: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    // Validate day of week
    if (!formData.dayOfWeek) {
      newErrors.dayOfWeek = 'Day of week is required';
    }

    // Validate start time
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    // Validate end time
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    // Validate time range
    if (formData.startTime && formData.endTime) {
      if (!validateTimeRange(formData.startTime, formData.endTime)) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Create course object
    const newCourse: Course = {
      id: generateId(),
      name: formData.name.trim(),
      dayOfWeek: formData.dayOfWeek as DayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location.trim() || undefined
    };

    onCourseAdded(newCourse);

    // Reset form
    setFormData({
      name: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      location: ''
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleInputChange = (
    field: keyof CourseFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Course Manually</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Course Name */}
        <div>
          <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
            Course Name *
          </label>
          <input
            id="courseName"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Mathematics 101"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Day of Week */}
        <div>
          <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
            Day of Week *
          </label>
          <select
            id="dayOfWeek"
            value={formData.dayOfWeek}
            onChange={(e) => handleInputChange('dayOfWeek', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dayOfWeek ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select a day</option>
            {DAYS_OF_WEEK.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          {errors.dayOfWeek && (
            <p className="mt-1 text-sm text-red-600">{errors.dayOfWeek}</p>
          )}
        </div>

        {/* Time Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time */}
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <select
              id="startTime"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startTime ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select start time</option>
              {timeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <select
              id="endTime"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endTime ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select end time</option>
              {timeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location (Optional)
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., Room A101, Lab B205"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:bg-blue-700'
            } text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {isSubmitting ? 'Adding...' : 'Add Course'}
          </button>
        </div>
      </form>
    </div>
  );
};