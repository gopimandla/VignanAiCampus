import React, { useState } from 'react';
import { Building2, Users, Check, Sparkles, Filter, Search, Wind, Tv } from 'lucide-react';
import { Venue } from '../types';

interface VenueExplorerProps {
  venues: Venue[];
  onSelectVenue?: (venue: Venue) => void;
}

export const VenueExplorer: React.FC<VenueExplorerProps> = ({ venues, onSelectVenue }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Campus Venues' },
    { id: 'Seminar Hall', label: 'Seminar Halls' },
    { id: 'Open Air Theatre', label: 'Open Air Theatres (OAT)' },
    { id: 'Auditorium / Grand Hall', label: 'Grand Auditoriums' },
    { id: 'Informal / Student Hub', label: 'Informal / MHP' },
  ];

  const filteredVenues = venues.filter((venue) => {
    const matchesCategory =
      selectedCategory === 'all' || venue.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warm-200/70 text-warm-800 dark:bg-warm-800 dark:text-warm-200 mb-2 border border-warm-300 dark:border-warm-700">
            <Building2 className="w-3.5 h-3.5 text-blush-600 dark:text-blush-400" />
            <span>Vignan University Master Venues</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-warm-950 dark:text-warm-50 tracking-tight">
            Campus Venues & Capacity Directory
          </h2>
          <p className="text-sm text-warm-600 dark:text-warm-400 mt-1 max-w-2xl">
            Real campus infrastructure across Sangamam, Spoorthy, Srujana, Sa Re Ga Ma, Sangamithra, OATs, Convocation Hall, and MHP.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-warm-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search venue or block..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-blush-400"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 custom-scrollbar mb-6">
        <Filter className="w-4 h-4 text-warm-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 dark:text-warm-50 shadow-warm-sm'
                : 'bg-white dark:bg-warm-900 text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800 border border-warm-200 dark:border-warm-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVenues.map((venue) => (
          <div
            key={venue.id}
            className="rounded-2xl border border-warm-200 dark:border-warm-800 bg-white dark:bg-warm-900 p-5 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300">
                    {venue.category}
                  </span>
                  <h3 className="text-base font-bold text-warm-900 dark:text-warm-100 mt-1.5 group-hover:text-blush-600 dark:group-hover:text-blush-400 transition-colors">
                    {venue.name}
                  </h3>
                  <p className="text-xs text-warm-500 dark:text-warm-400 font-medium">
                    {venue.block}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blush-50 dark:bg-blush-950/80 text-blush-800 dark:text-blush-200 font-extrabold text-sm border border-blush-200 dark:border-blush-800">
                    <Users className="w-3.5 h-3.5 text-blush-600 dark:text-blush-400" />
                    <span>{venue.capacity}</span>
                  </div>
                  <p className="text-[10px] text-warm-400 mt-0.5">Capacity</p>
                </div>
              </div>

              <p className="text-xs text-warm-600 dark:text-warm-300 my-3 leading-relaxed">
                {venue.description}
              </p>

              {/* Badges / Amenities */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {venue.ac && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-200 border border-warm-200 dark:border-warm-700">
                    <Wind className="w-3 h-3 text-blush-500" /> Central AC
                  </span>
                )}
                {venue.av_equipped && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-200 border border-warm-200 dark:border-warm-700">
                    <Tv className="w-3 h-3 text-blush-500" /> AV Setup
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-sage-50 text-sage-700 dark:bg-sage-950/60 dark:text-sage-300 border border-sage-200 dark:border-sage-800">
                  <Check className="w-3 h-3" /> Ready
                </span>
              </div>

              {/* Suitable For Tags */}
              <div className="pt-3 border-t border-warm-100 dark:border-warm-800">
                <p className="text-[10px] font-bold text-warm-400 uppercase tracking-wider mb-1.5">
                  Best Suited For:
                </p>
                <div className="flex flex-wrap gap-1">
                  {venue.suitable_for.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {onSelectVenue && (
              <button
                onClick={() => onSelectVenue(venue)}
                className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-warm-50 hover:bg-blush-50 dark:bg-warm-800 dark:hover:bg-blush-950/50 text-warm-800 hover:text-blush-700 dark:text-warm-200 dark:hover:text-blush-300 border border-warm-200 dark:border-warm-700 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blush-500" />
                Select for AI Event Plan
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
