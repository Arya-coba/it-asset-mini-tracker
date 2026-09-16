import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, RotateCcw, X } from 'lucide-react';
import Button from '../ui/Button.tsx';
import type { AssetStatus } from '../../../types/asset.ts';

interface AssetFiltersProps {
  search: string;
  status: AssetStatus | 'all';
  kategori: string;
  availableCategories: string[];
  onSearchChange: (val: string) => void;
  onStatusChange: (val: AssetStatus | 'all') => void;
  onKategoriChange: (val: string) => void;
  onResetFilters: () => void;
  onOpenCreateModal: () => void;
  isFiltered: boolean;
}

export const AssetFilters: React.FC<AssetFiltersProps> = ({
  search,
  status,
  kategori,
  availableCategories,
  onSearchChange,
  onStatusChange,
  onKategoriChange,
  onResetFilters,
  onOpenCreateModal,
  isFiltered,
}) => {
  // Local search query for smooth debounce
  const [localSearch, setLocalSearch] = useState(search);

  // Sync if parent resets
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search update (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearch, search, onSearchChange]);

  const defaultCategories = [
    'Laptop',
    'Desktop',
    'Printer',
    'Networking',
    'Monitor',
    'Peripheral',
    'Server',
  ];

  // Merge categories cleanly
  const allCategories = Array.from(new Set([...defaultCategories, ...availableCategories]));

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        {/* Left Side: Search & Dropdowns */}
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 sm:items-center">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-search-asset"
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari nama aset (contoh: Dell, Switch, Printer)..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 sm:w-44">
            <select
              id="select-filter-status"
              value={status}
              onChange={(e) => onStatusChange(e.target.value as AssetStatus | 'all')}
              className="w-full py-2 px-3 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="rusak">Rusak</option>
              <option value="perbaikan">Perbaikan</option>
            </select>
          </div>

          {/* Kategori Dropdown */}
          <div className="flex items-center gap-1.5 sm:w-48">
            <select
              id="select-filter-kategori"
              value={kategori}
              onChange={(e) => onKategoriChange(e.target.value)}
              className="w-full py-2 px-3 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
            >
              <option value="all">Semua Kategori</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              id="btn-reset-filters"
              onClick={onResetFilters}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
              title="Reset semua filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Side: Add Asset Primary Button */}
        <div>
          <Button
            id="btn-add-asset"
            variant="primary"
            onClick={onOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto shrink-0 shadow-sm"
          >
            Tambah Aset
          </Button>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {isFiltered && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filter aktif:</span>
          {search.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              Nama: &quot;{search}&quot;
              <button
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {status !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium capitalize">
              Status: {status}
              <button onClick={() => onStatusChange('all')} className="hover:text-blue-900">
                ×
              </button>
            </span>
          )}
          {kategori !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              Kategori: {kategori}
              <button onClick={() => onKategoriChange('all')} className="hover:text-blue-900">
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AssetFilters;
