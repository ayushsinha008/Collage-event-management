import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Send, BarChart3 } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Create Event', icon: Plus, onClick: () => navigate('/organizer/events?create=true'), color: 'bg-tertiary-fixed text-on-tertiary-fixed' },
    { label: 'Bulk Import', icon: Upload, onClick: () => navigate('/organizer/registrations?import=true'), color: 'bg-primary-fixed text-on-primary-fixed' },
    { label: 'Announcement', icon: Send, onClick: () => navigate('/organizer/announcements?new=true'), color: 'bg-secondary-fixed text-on-secondary-fixed' },
    { label: 'Analytics', icon: BarChart3, onClick: () => navigate('/organizer/analytics'), color: 'bg-secondary-container text-on-secondary-container' },
  ];

  return (
    <div className="bg-surface border-4 border-on-background p-6 neo-shadow">
      <h3 className="font-extrabold text-2xl uppercase tracking-wide mb-6 border-b-4 border-on-background pb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map(({ label, icon: Icon, onClick, color }) => (
          <button
            key={label}
            onClick={onClick}
            className={`${color} font-label-bold text-xs py-4 px-2 border-4 border-on-background hover-lift transition-all flex flex-col items-center justify-center gap-2 neo-shadow-sm`}
          >
            <Icon className="w-6 h-6 stroke-[2.5]" />
            <span className="text-center leading-tight uppercase">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};