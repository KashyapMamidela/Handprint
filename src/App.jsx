import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminQueue from './pages/AdminQueue';
import Dashboard from './pages/Dashboard';
import Drives from './pages/Drives';
import Landing from './pages/Landing';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/drives" element={<Drives />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['organizer', 'admin']}>
            <AdminQueue />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
