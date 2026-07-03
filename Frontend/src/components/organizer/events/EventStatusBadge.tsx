import React from 'react';

const styles: Record<string, string> = {
  Draft:     'bg-neutral-200 text-neutral-700 border-neutral-400',
  Upcoming:  'bg-blue-100 text-blue-800 border-blue-300',
  Ongoing:   'bg-green-100 text-green-800 border-green-300',
  Completed: 'bg-purple-100 text-purple-800 border-purple-300',
  Cancelled: 'bg-red-100 text-red-800 border-red-300',
};

// `status?` accepts undefined so callers don't need to coerce
export const EventStatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const normalized = status ? (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) : 'Draft';
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${styles[normalized] || styles.Draft}`}>
      {normalized}
    </span>
  );
};