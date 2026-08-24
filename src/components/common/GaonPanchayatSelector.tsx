import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Flag, 
  Search, 
  Check, 
  ChevronRight, 
  Sparkles, 
  X, 
  Home, 
  Layers 
} from 'lucide-react';
import { GOLAGHAT_GAON_PANCHAYATS, GOLAGHAT_BLOCKS, GaonPanchayat } from '../../utils/initialData';
import { LocationPoint } from '../../types';

interface GaonPanchayatSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsPickup: (point: LocationPoint) => void;
  onSelectAsDestination: (point: LocationPoint) => void;
  currentPickup?: LocationPoint;
  currentDestination?: LocationPoint;
}

export const GaonPanchayatSelector: React.FC<GaonPanchayatSelectorProps> = ({
  isOpen,
  onClose,
  onSelectAsPickup,
  onSelectAsDestination,
  currentPickup,
  currentDestination,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedGP, setExpandedGP] = useState<string | null>(null);

  const filteredGPs = useMemo(() => {
    let list = GOLAGHAT_GAON_PANCHAYATS;
    if (selectedBlock !== 'all') {
      list = list.filter(gp => gp.block === selectedBlock);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(gp => 
        gp.name.toLowerCase().includes(q) ||
        gp.headquarter.toLowerCase().includes(q) ||
        gp.blockName.toLowerCase().includes(q) ||
        gp.keyLandmarks.toLowerCase().includes(q) ||
        gp.villages.some(v => v.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedBlock, searchQuery]);

  if (!isOpen) return null;

  const handleChooseGP = (gp: GaonPanchayat, village?: string, target: 'pickup' | 'dest' = 'pickup') => {
    const addr = village 
      ? `${village}, ${gp.name}, ${gp.blockName}, Golaghat District`
      : `${gp.headquarter} (${gp.name}), ${gp.blockName}, Golaghat District`;
    
    const point: LocationPoint = {
      address: addr,
      lat: gp.lat,
      lng: gp.lng,
      city: gp.headquarter,
    };

    if (target === 'pickup') {
      onSelectAsPickup(point);
    } else {
      onSelectAsDestination(point);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl border-2 border-emerald-500/30 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-orange-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-xs">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-400 text-slate-950 font-display">
                  Golaghat District
                </span>
                <span className="text-xs text-emerald-200 font-bold hidden sm:inline">Assam Rural & Urban Transit</span>
              </div>
              <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                Select Gaon Panchayat (GP) & Village
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search Bar & Stats */}
        <div className="p-4 border-b border-slate-100 bg-emerald-50/40 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Gaon Panchayat name, village, block, or landmark..."
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-900 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Block Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {GOLAGHAT_BLOCKS.map(block => (
              <button
                key={block.id}
                onClick={() => setSelectedBlock(block.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-[11px] transition-all cursor-pointer ${
                  selectedBlock === block.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {block.name} ({block.count})
              </button>
            ))}
          </div>
        </div>

        {/* Gaon Panchayat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {filteredGPs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No Gaon Panchayat matches found</p>
              <p className="text-xs">Try searching for a different village, Gaon Panchayat, or select 'All Blocks'.</p>
            </div>
          ) : (
            filteredGPs.map(gp => {
              const isExpanded = expandedGP === gp.id;
              return (
                <div key={gp.id} className="pt-3 first:pt-0 group">
                  
                  {/* GP Card Header */}
                  <div className="bg-white hover:bg-emerald-50/50 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all space-y-2">
                    
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                            {gp.blockName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            HQ: <strong className="text-slate-800">{gp.headquarter}</strong>
                          </span>
                        </div>
                        <h4 className="font-display font-black text-base text-slate-950 tracking-tight">
                          {gp.name}
                        </h4>
                        <p className="text-[11px] text-slate-600 font-medium">
                          📍 {gp.keyLandmarks}
                        </p>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            handleChooseGP(gp, undefined, 'pickup');
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black flex items-center gap-1 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                          title="Set as Pickup Location"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Pickup</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleChooseGP(gp, undefined, 'dest');
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[11px] font-black flex items-center gap-1 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                          title="Set as Drop Destination"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Drop</span>
                        </button>
                      </div>
                    </div>

                    {/* Villages List toggle */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setExpandedGP(isExpanded ? null : gp.id)}
                        className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{gp.villages.length} Villages under this GP:</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      <span className="text-[10px] text-slate-400 font-mono">
                        GPS: {gp.lat.toFixed(3)}, {gp.lng.toFixed(3)}
                      </span>
                    </div>

                    {/* Expanded Villages Chips */}
                    {isExpanded && (
                      <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex flex-wrap gap-1.5 animate-in fade-in">
                        {gp.villages.map((village, vIdx) => (
                          <div
                            key={vIdx}
                            className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs flex items-center gap-2 shadow-2xs"
                          >
                            <span className="font-bold text-slate-800">{village}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  handleChooseGP(gp, village, 'pickup');
                                  onClose();
                                }}
                                className="text-[10px] text-emerald-700 hover:underline font-black px-1"
                                title={`Set ${village} as Pickup`}
                              >
                                [Pickup]
                              </button>
                              <span className="text-slate-300">•</span>
                              <button
                                type="button"
                                onClick={() => {
                                  handleChooseGP(gp, village, 'dest');
                                  onClose();
                                }}
                                className="text-[10px] text-orange-700 hover:underline font-black px-1"
                                title={`Set ${village} as Drop`}
                              >
                                [Drop]
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Covering all 32+ Gaon Panchayats of Golaghat District</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
