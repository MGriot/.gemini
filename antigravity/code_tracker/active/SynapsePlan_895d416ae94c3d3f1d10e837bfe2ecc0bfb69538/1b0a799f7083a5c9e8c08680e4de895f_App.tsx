Åimport { Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material'; // Remove ThemeProvider import
import { ThemeModeProvider } from './context/ThemeContext'; // Import ThemeModeProvider
import { AuthProvider } from './context/AuthContext';
import { ProjectCreationProvider } from './context/ProjectCreationContext'; // Import the provider
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ProjectListPage from './pages/projectListPage';
import ProjectDetailPage from './pages/projectDetailPage';
import TaskDetailPage from './pages/taskDetailPage';
import DashboardPage from './pages/dashboardPage';
import ProjectBoardPage from './pages/ProjectBoardPage';
import AdminPage from './pages/AdminPage'; // Import AdminPage

function App() {
  return (
    <ThemeModeProvider> {/* Wrap with ThemeModeProvider */}
      <CssBaseline />
      <AuthProvider>
        <ProjectCreationProvider> {/* Wrap with ProjectCreationProvider */}
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<ProjectListPage />} /> {/* Redirect/Home */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectListPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                <Route path="/tasks" element={<ProjectBoardPage />} />
                <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
                <Route path="/admin" element={<AdminPage />} /> {/* Admin Route */}
              </Route>
            </Route>
          </Routes>
        </ProjectCreationProvider>
      </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
Å"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Hfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/App.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan