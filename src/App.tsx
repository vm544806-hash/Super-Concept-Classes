import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { GoogleAdSenseManager, InPagePushAdManager, VideoSliderAdManager } from './components/common/AdComponents';
import { CookieConsentBanner } from './components/common/CookieConsentBanner';

// Pages
import { HomePage } from './pages/HomePage';
import { TestDetailsPage } from './pages/TestDetailsPage';
import { ExamPage } from './pages/ExamPage';
import { ResultPage } from './pages/ResultPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { NoticePage } from './pages/NoticePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { FAQPage } from './pages/FAQPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminTestsPage } from './pages/admin/AdminTestsPage';
import { AdminQuestionsPage } from './pages/admin/AdminQuestionsPage';
import { AdminResultsPage } from './pages/admin/AdminResultsPage';
import { AdminNoticesPage } from './pages/admin/AdminNoticesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Protected Route Component for Admin
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <BrowserRouter>
            <GoogleAdSenseManager />
            <InPagePushAdManager />
            <VideoSliderAdManager />
            <CookieConsentBanner />
            <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
              <Navbar />

              <div className="flex-1">
                <Routes>
                  {/* Student Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/test/:id" element={<TestDetailsPage />} />
                  <Route path="/exam/:id" element={<ExamPage />} />
                  <Route path="/result" element={<ResultPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/notice" element={<NoticePage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/disclaimer" element={<DisclaimerPage />} />
                  <Route path="/faq" element={<FAQPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLoginPage />} />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedAdminRoute>
                        <AdminDashboardPage />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/tests"
                    element={
                      <ProtectedAdminRoute>
                        <AdminTestsPage />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/questions"
                    element={
                      <ProtectedAdminRoute>
                        <AdminQuestionsPage />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/results"
                    element={
                      <ProtectedAdminRoute>
                        <AdminResultsPage />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/notices"
                    element={
                      <ProtectedAdminRoute>
                        <AdminNoticesPage />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedAdminRoute>
                        <AdminSettingsPage />
                      </ProtectedAdminRoute>
                    }
                  />

                  {/* Fallback Catch-All */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>

              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
