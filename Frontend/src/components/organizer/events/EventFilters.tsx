import React from 'react';
import { Search, Filter } from 'lucide-react';

interface Props {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
}

export const EventFilters: React.FC<Props> = ({ search, setSearch, status, setStatus, category, setCategory }) => (
  <div className="bg-surface border-4 border-on-background p-4 mb-8 flex flex-wrap gap-4 items-center neo-shadow">
    <div className="flex items-center border-4 border-on-background bg-background flex-1 min-w-[200px] focus-within:neo-shadow-sm transition-shadow">
      <div className="pl-3 py-2 bg-surface-variant border-r-4 border-on-background">
        <Search className="w-5 h-5 stroke-[2.5]" />
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="SEARCH EVENTS..."
        className="flex-1 px-4 py-2 font-label-bold text-sm bg-transparent focus:outline-none uppercase"
      />
    </div>

    <div className="flex gap-4">
      <div className="flex items-center border-4 border-on-background bg-background focus-within:neo-shadow-sm transition-shadow">
        <div className="px-3 py-2 bg-tertiary-fixed border-r-4 border-on-background">
          <Filter className="w-5 h-5 stroke-[2.5]" />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 font-label-bold text-sm bg-transparent uppercase outline-none appearance-none cursor-pointer pr-8"
        >
          <option value="all">ALL STATUS</option>
          <option value="draft">DRAFT</option>
          <option value="published">PUBLISHED</option>
          <option value="live">LIVE</option>
          <option value="completed">COMPLETED</option>
        </select>
      </div>

      <div className="flex items-center border-4 border-on-background bg-background focus-within:neo-shadow-sm transition-shadow">
        <div className="px-3 py-2 bg-primary-fixed border-r-4 border-on-background">
          <Filter className="w-5 h-5 stroke-[2.5]" />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 font-label-bold text-sm bg-transparent uppercase outline-none appearance-none cursor-pointer pr-8"
        >
          <option value="all">ALL CATEGORIES</option>
          <option value="TECHNICAL">TECHNICAL</option>
          <option value="CULTURAL">CULTURAL</option>
          <option value="SPORTS">SPORTS</option>
          <option value="WORKSHOP">WORKSHOP</option>
          <option value="SEMINAR">SEMINAR</option>
        </select>
      </div>
    </div>
  </div>
);