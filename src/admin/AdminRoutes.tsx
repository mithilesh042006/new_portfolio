import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminProjects from './pages/AdminProjects';
import AdminExperiences from './pages/AdminExperiences';
import AdminQualifications from './pages/AdminQualifications';
import AdminTestimonials from './pages/AdminTestimonials';
import AdminAbout from './pages/AdminAbout';
import AdminGallery from './pages/AdminGallery';
import AdminSkills from './pages/AdminSkills';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="projects" replace />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="experiences" element={<AdminExperiences />} />
        <Route path="qualifications" element={<AdminQualifications />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="about" element={<AdminAbout />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="skills" element={<AdminSkills />} />
      </Route>
    </Routes>
  );
}
