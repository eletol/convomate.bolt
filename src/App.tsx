import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Overview from './components/Overview';
import Agents from './components/Agents';
import Integrations from './components/Integrations';
import Help from './components/Help';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import CreateAgent from './components/CreateAgent';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth onComplete={() => {}} />} />
        <Route path="/register" element={<Auth onComplete={() => {}} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 overflow-y-auto p-8">
                  <Overview />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/agents"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 overflow-y-auto p-8">
                  <Agents />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/agents/create"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 overflow-y-auto p-8">
                  <CreateAgent />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents/:agentId/slack-connected"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 overflow-y-auto p-8">
                  <CreateAgent />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents/:agentId/gdrive-connected"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 overflow-y-auto p-8">
                  <CreateAgent />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents/:agentId/notion-connected"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 overflow-y-auto p-8">
                  <CreateAgent />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents/:agentId/clickup-connected"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 overflow-y-auto p-8">
                  <CreateAgent />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents/:agentId/confluence-connected"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 overflow-y-auto p-8">
                  <CreateAgent />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/integrations"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 overflow-y-auto p-8">
                  <Integrations />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/help"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 overflow-y-auto p-8">
                  <Help />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 overflow-y-auto p-8">
                  <Settings />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;