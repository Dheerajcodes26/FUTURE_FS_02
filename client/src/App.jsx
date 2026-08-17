import React, { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import AddLeadPage from './pages/AddLeadPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AppShell from './components/AppShell';
import LeadDetailPanel from './components/LeadDetailPanel';

function AppContent() {
  const { admin, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authView, setAuthView] = useState('login');
  const [selectedLead, setSelectedLead] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLeadUpdate = useCallback((updatedLead) => {
    setSelectedLead(updatedLead);
    setRefreshTrigger(t => t + 1);
  }, []);

  const handleLeadDelete = useCallback(() => {
    setSelectedLead(null);
    setRefreshTrigger(t => t + 1);
  }, []);

  const handleLeadCreated = useCallback(() => {
    setRefreshTrigger(t => t + 1);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!admin) {
    return authView === 'signup'
      ? <SignupPage onSwitchView={setAuthView} />
      : <LoginPage onSwitchView={setAuthView} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'leads':
        return <LeadsPage onSelectLead={setSelectedLead} refreshTrigger={refreshTrigger} />;
      case 'add-lead':
        return <AddLeadPage onLeadCreated={handleLeadCreated} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'dashboard':
      default:
        return <DashboardPage onNavigate={setCurrentPage} onSelectLead={setSelectedLead} />;
    }
  };

  return (
    <>
      <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </AppShell>
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
          onDelete={handleLeadDelete}
        />
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
