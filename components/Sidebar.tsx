
import React from 'react';
import { AppView } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { ChatIcon } from './icons/ChatIcon';
import { MemoryIcon } from './icons/MemoryIcon';
import { KnowledgeIcon } from './icons/KnowledgeIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg ${
      isActive
        ? 'bg-accent text-primary'
        : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <div className="flex flex-col w-64 h-screen p-4 bg-primary border-r border-secondary">
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-primary text-xl">
          B
        </div>
        <h1 className="ml-3 text-xl font-bold text-text-primary">Second Brain</h1>
      </div>
      <nav className="flex-grow space-y-2">
        <NavItem
          icon={<DashboardIcon />}
          label="Dashboard"
          isActive={currentView === AppView.Dashboard}
          onClick={() => setCurrentView(AppView.Dashboard)}
        />
        <NavItem
          icon={<ChatIcon />}
          label="Chat"
          isActive={currentView === AppView.Chat}
          onClick={() => setCurrentView(AppView.Chat)}
        />
        <NavItem
          icon={<MemoryIcon />}
          label="Memory Lane"
          isActive={currentView === AppView.MemoryLane}
          onClick={() => setCurrentView(AppView.MemoryLane)}
        />
        <NavItem
          icon={<KnowledgeIcon />}
          label="Knowledge Base"
          isActive={currentView === AppView.KnowledgeBase}
          onClick={() => setCurrentView(AppView.KnowledgeBase)}
        />
      </nav>
      <div className="mt-auto">
        <NavItem
            icon={<SettingsIcon />}
            label="Settings"
            isActive={currentView === AppView.Settings}
            onClick={() => setCurrentView(AppView.Settings)}
        />
      </div>
    </div>
  );
};
