import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import HomePage from "./pages/HomePage"
import UniversityListPage from "./pages/UniversityListPage"
import UniversityDetailPage from "./pages/UniversityDetailPage"
import AllProgramsPage from "./pages/AllProgramsPage"
import ProgramDetailPage from "./pages/ProgramDetailPage"
import OrientationTestPage from "./pages/OrientationTestPage"
import ProfilePage from "./pages/ProfilePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import AdminLayout from "./components/AdminLayout"
import DashboardPage from "./pages/admin/DashboardPage"
import UsersPage from "./pages/admin/UsersPage"
import AdminUniversitiesPage from "./pages/admin/UniversitiesPage"
import AdminProgramsPage from "./pages/admin/ProgramsPage"
import SearchPage from "./pages/SearchPage"

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>
}

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              
              {/* Semi-Protected Routes (Viewable by all, but need auth for actions) */}
              <Route path="/universities" element={<UniversityListPage />} />
              <Route path="/universities/:id" element={<UniversityDetailPage />} />
              <Route path="/programs" element={<AllProgramsPage />} />
              <Route path="/programs/:id" element={<ProgramDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/orientation-test"
                element={
                  <PrivateRoute>
                    <OrientationTestPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="universities" element={<AdminUniversitiesPage />} />
                <Route path="programs" element={<AdminProgramsPage />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
