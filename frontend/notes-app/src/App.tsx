import './App.css'
import {Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import NoteEditorPage from './pages/NoteEditorPage';

function App() {
  return (
       <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/dashboard" element = {<ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
          } />

           <Route path="/notes/new" element = {<ProtectedRoute>
            <NoteEditorPage />
          </ProtectedRoute>
          } />

           <Route path="/notes/:id" element = {<ProtectedRoute>
            <NoteEditorPage />
          </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
       </AuthProvider>
  )
}

export default App
