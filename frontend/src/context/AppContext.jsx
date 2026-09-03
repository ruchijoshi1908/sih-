import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Roles: 'admin' (Govt/Training Admin), 'employer' (Industry Validator), 'student' (Learner)
  const [currentRole, setCurrentRole] = useState('admin');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(1);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const loadCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const data = await api.getCourses();
      setCourses(data);
      if (data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        courses,
        setCourses,
        loadCourses,
        selectedCourseId,
        setSelectedCourseId,
        selectedCourse,
        isLoadingCourses,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
