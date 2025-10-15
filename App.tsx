
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { MemoryLane } from './components/MemoryLane';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Settings } from './components/Settings';
import { AppView } from './types';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Dashboard);

  const renderContent = () => {
    switch (currentView) {
      case AppView.Dashboard:
        return <Dashboard />;
      case AppView.Chat:
        return <ChatInterface />;
      case AppView.MemoryLane:
        return <MemoryLane />;
      case AppView.KnowledgeBase:
        return <KnowledgeBase />;
      case AppView.Settings:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-primary font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 h-screen overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
