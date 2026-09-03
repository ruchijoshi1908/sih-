const API_BASE = '/api';

export async function fetchJson(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMsg = 'Network response was not ok';
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.message || JSON.stringify(errData);
    } catch {
      errorMsg = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Courses
  getCourses: () => fetchJson('/courses'),
  getCourseDetail: (id) => fetchJson(`/courses/${id}`),
  createCourse: (data) => fetchJson('/courses', { method: 'POST', body: JSON.stringify(data) }),
  uploadSyllabus: async (courseId, formData) => {
    const response = await fetch(`${API_BASE}/courses/${courseId}/syllabus`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
    }
    return response.json();
  },
  runAudit: (courseId) => fetchJson(`/courses/${courseId}/audit`, { method: 'POST' }),
  getSkillGaps: (courseId) => fetchJson(`/courses/${courseId}/gaps`),
  getDriftScore: (courseId) => fetchJson(`/courses/${courseId}/drift`),
  getRecommendations: (courseId) => fetchJson(`/courses/${courseId}/recommendations`),
  createUpdatedVersion: (courseId, data) => fetchJson(`/courses/${courseId}/versions`, { method: 'POST', body: JSON.stringify(data) }),

  // Evidence
  getEvidence: (skill, roleCategory) => 
    fetchJson(`/analysis/evidence?skill=${encodeURIComponent(skill)}&role_category=${encodeURIComponent(roleCategory)}`),

  // Jobs
  getJobs: (role = '', search = '', limit = 50) => 
    fetchJson(`/jobs?role=${encodeURIComponent(role)}&search=${encodeURIComponent(search)}&limit=${limit}`),
  createJob: (data) => fetchJson('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  getJobStats: () => fetchJson('/jobs/stats'),

  // Employer
  getEmployerRecommendations: (status = 'all') => fetchJson(`/employer/recommendations?status_filter=${status}`),
  validateRecommendation: (recId, data) => 
    fetchJson(`/employer/recommendations/${recId}/validate`, { method: 'POST', body: JSON.stringify(data) }),

  // Placements
  recordPlacement: (data) => fetchJson('/placements', { method: 'POST', body: JSON.stringify(data) }),
  getPlacementComparison: (courseId) => fetchJson(`/placements/course/${courseId}/outcomes`),

  // Student
  getTargetRoles: () => fetchJson('/students/roles'),
  analyzeResume: async (formData) => {
    const response = await fetch(`${API_BASE}/students/resume`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Resume analysis failed');
    }
    return response.json();
  },

  // n8n & Demo
  getN8nStatus: () => fetchJson('/n8n/status'),
  triggerJobSyncWebhook: (jobs) => fetchJson('/n8n/trigger-job-sync', { method: 'POST', body: JSON.stringify(jobs) }),
  resetSeedData: () => fetchJson('/seed/reset', { method: 'POST' }),
};
