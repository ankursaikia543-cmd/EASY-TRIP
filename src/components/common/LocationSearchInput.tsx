import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, 
  Search, 
  X, 
  Check, 
  Navigation, 
  Building2, 
  Plane, 
  Train, 
  Hospital, 
  GraduationCap, 
  Compass, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { ALL_ASSAM_LOCATIONS, LocationItem, searchLocations, findLocationByQuery } from '../../utils/locationDatabase';

interface LocationSearchInputProps {
  label: string;
  value: string;
  onChange: (val: string, location?: LocationItem) => void;
  placeholder?: string;
  type: 'pickup' | 'destination';
  onSelectCallback?: (loc: LocationItem) => void;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Type location name or select...',
  type,
  onSelectCallback,
  className = '',
  inputRef: externalInputRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState<'all' | 'golaghat' | 'jorhat' | 'guwahati' | 'dibrugarh' | 'outstation'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalInputRef;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputRef]);

  // Compute live search matches based on current input value
  const searchResults = useMemo(() => {
    return searchLocations(value, regionFilter, categoryFilter);
  }, [value, regionFilter, categoryFilter]);

  // Popular / Recommended locations when search is empty or short
  const popularLocations = useMemo(() => {
    return ALL_ASSAM_LOCATIONS.filter(l => l.popular);
  }, []);

  const displayList = value.trim().length > 0 ? searchResults : popularLocations;

  const handleSelect = (loc: LocationItem) => {
    onChange(loc.address, loc);
    if (onSelectCallback) {
      onSelectCallback(loc);
    }
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    const matched = findLocationByQuery(newVal);
    onChange(newVal, matched || undefined);
    if (!isOpen) setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < displayList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : displayList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < displayList.length) {
        handleSelect(displayList[highlightedIndex]);
      } else if (displayList.length > 0) {
        handleSelect(displayList[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'airport':
        return <Plane className="w-4 h-4 text-sky-600" />;
      case 'railway':
        return <Train className="w-4 h-4 text-indigo-600" />;
      case 'hospital':
        return <Hospital className="w-4 h-4 text-rose-600" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-amber-600" />;
      case 'tourism':
        return <Compass className="w-4 h-4 text-emerald-600" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-500" />;
    }
  };

  const isPickup = type === 'pickup';

  return (
    <div className={`relative ${className}`}>
      {/* Main Input Box */}
      <div 
        onClick={() => {
          if (!isOpen) setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-text ${
          isPickup 
            ? 'bg-slate-50 border-slate-200 focus-within:border-emerald-500 focus-within:bg-emerald-50/20 focus-within:ring-2 focus-within:ring-emerald-400/20' 
            : 'bg-slate-50 border-slate-200 focus-within:border-orange-500 focus-within:bg-orange-50/20 focus-within:ring-2 focus-within:ring-orange-400/20'
        } ${isOpen ? (isPickup ? 'border-emerald-500 shadow-sm' : 'border-orange-500 shadow-sm') : ''}`}
      >
        {/* Visual Marker */}
        <div className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center ${
          isPickup ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-orange-500 ring-4 ring-orange-100'
        }`} />

        {/* Input Text Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-tight">
              {label}
            </label>
            <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-sm uppercase tracking-wider ${
              isPickup ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {isPickup ? 'PICKUP' : 'DROP'}
            </span>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="text-xs font-bold text-slate-900 w-full outline-hidden bg-transparent truncate pt-0.5 placeholder:text-slate-400"
          />
        </div>

        {/* Actions (Clear / Dropdown toggle) */}
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(prev => !prev);
            }}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
            title="Toggle suggestions list"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown List - Pops open right under the input */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border-2 border-emerald-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ maxHeight: '360px' }}
        >
          {/* Top Header of Dropdown */}
          <div className="px-3.5 py-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-black tracking-wide">
                {value.trim() ? `Search Results for "${value}"` : 'Popular & Nearby Locations'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-300 font-semibold hidden sm:inline">
                Tap to select location
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-0.5 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Region Tabs Filter */}
          <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { key: 'all', label: '🌟 All Places' },
              { key: 'golaghat', label: '📍 Golaghat Local' },
              { key: 'jorhat', label: '🚗 Jorhat Hubs' },
              { key: 'guwahati', label: '✈️ Guwahati Hubs' },
              { key: 'dibrugarh', label: '🏥 Dibrugarh Hubs' },
              { key: 'outstation', label: '🛣️ Outstation' },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRegionFilter(tab.key as any)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  regionFilter === tab.key
                    ? 'bg-emerald-600 text-white shadow-2xs font-black'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="px-3 py-1 bg-slate-50 border-b border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { key: 'all', label: 'All' },
              { key: 'transit', label: '✈️ Transit & Stations' },
              { key: 'hospital', label: '🏥 Hospitals' },
              { key: 'education', label: '🎓 Colleges' },
              { key: 'village', label: '🌾 Villages & GPs' },
              { key: 'tourism', label: '🦏 Kaziranga & Parks' },
            ].map(cat => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategoryFilter(cat.key)}
                className={`px-2 py-0.5 rounded-md text-[9px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat.key
                    ? 'bg-orange-500 text-slate-950 font-black'
                    : 'bg-white text-slate-500 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Location Items List */}
          <div className="overflow-y-auto max-h-56 divide-y divide-slate-100 p-1">
            {displayList.length > 0 ? (
              displayList.map((item, idx) => {
                const isSelected = value.toLowerCase().includes(item.name.toLowerCase());
                const isHighlighted = highlightedIndex === idx;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`p-2.5 rounded-xl text-xs cursor-pointer flex items-center justify-between gap-2.5 transition-all ${
                      isHighlighted || isSelected
                        ? 'bg-emerald-50 text-emerald-950 border border-emerald-300'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 truncate block text-[13px]">
                            {item.name}
                          </span>
                          {item.popular && (
                            <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-sm shrink-0">
                              HOT
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {item.landmark ? `${item.landmark} • ` : ''}{item.address}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black border border-emerald-200">
                        {item.tag}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">
                        {item.city}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                <p className="font-bold text-slate-700">No exact location found for "{value}"</p>
                <p className="text-[11px] text-slate-400 mt-0.5">You can still use this address or pick from popular hubs</p>
                <button
                  type="button"
                  onClick={() => {
                    onChange(value, {
                      id: 'custom-loc',
                      name: value,
                      address: value,
                      lat: isPickup ? 26.5925 : 26.5186,
                      lng: isPickup ? 93.5937 : 93.9688,
                      city: 'Assam',
                      region: 'golaghat',
                      category: 'town',
                      tag: 'Custom Point'
                    });
                    setIsOpen(false);
                  }}
                  className="mt-2.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Confirm "{value}" as {isPickup ? 'Pickup' : 'Drop'}
                </button>
              </div>
            )}
          </div>

          {/* Bottom Fast-Picks Bar */}
          <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Assam Hubs: <strong>Bokakhat</strong>, <strong>Jorhat</strong>, <strong>Guwahati</strong>, <strong>Dibrugarh</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
