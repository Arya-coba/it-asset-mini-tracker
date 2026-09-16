import React from 'react';
import type { AssetStatus, AssetSummaryData } from '../../../types/asset.ts';
import { CheckCircle2, AlertTriangle, Wrench, Layers } from 'lucide-react';

interface AssetSummaryProps {
  summary: AssetSummaryData;
  isLoading?: boolean;
  onFilterClick?: (status: AssetStatus | 'all') => void;
  activeStatusFilter?: AssetStatus | 'all';
}

export const AssetSummary: React.FC<AssetSummaryProps> = ({
  summary,
  isLoading = false,
  onFilterClick,
  activeStatusFilter,
}) => {
  const cards: Array<{
    id: string;
    statusKey: AssetStatus | 'all';
    title: string;
    count: number;
    subtitle: string;
    icon: typeof CheckCircle2;
    borderClass: string;
    activeClass: string;
    badgeClass: string;
    countClass: string;
    iconClass: string;
  }> = [
    {
      id: 'summary-card-aktif',
      statusKey: 'aktif',
      title: 'AKTIF',
      count: summary.aktif,
      subtitle: 'Siap digunakan di unit RS',
      icon: CheckCircle2,
      borderClass: 'border-emerald-200 hover:border-emerald-300',
      activeClass: 'ring-2 ring-emerald-500 bg-emerald-50/50',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      countClass: 'text-emerald-700',
      iconClass: 'text-emerald-600 bg-emerald-100/70',
    },
    {
      id: 'summary-card-rusak',
      statusKey: 'rusak',
      title: 'RUSAK',
      count: summary.rusak,
      subtitle: 'Memerlukan penggantian/tindakan',
      icon: AlertTriangle,
      borderClass: 'border-rose-200 hover:border-rose-300',
      activeClass: 'ring-2 ring-rose-500 bg-rose-50/50',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      countClass: 'text-rose-700',
      iconClass: 'text-rose-600 bg-rose-100/70',
    },
    {
      id: 'summary-card-perbaikan',
      statusKey: 'perbaikan',
      title: 'PERBAIKAN',
      count: summary.perbaikan,
      subtitle: 'Sedang diservis teknisi IT',
      icon: Wrench,
      borderClass: 'border-amber-200 hover:border-amber-300',
      activeClass: 'ring-2 ring-amber-500 bg-amber-50/50',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      countClass: 'text-amber-700',
      iconClass: 'text-amber-600 bg-amber-100/70',
    },
    {
      id: 'summary-card-total',
      statusKey: 'all',
      title: 'TOTAL ASET',
      count: summary.total,
      subtitle: 'Keseluruhan inventaris tercatat',
      icon: Layers,
      borderClass: 'border-slate-200 hover:border-slate-300',
      activeClass: 'ring-2 ring-blue-500 bg-blue-50/40',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      countClass: 'text-slate-800',
      iconClass: 'text-blue-600 bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatusFilter === card.statusKey;

        return (
          <div
            id={card.id}
            key={card.title}
            onClick={() => onFilterClick && onFilterClick(card.statusKey)}
            className={`cursor-pointer bg-white rounded-xl p-4 border transition-all duration-150 shadow-xs hover:shadow-sm ${
              card.borderClass
            } ${isActive ? card.activeClass : ''}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onFilterClick && onFilterClick(card.statusKey);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-md ${card.iconClass}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-8 w-12 bg-slate-100 rounded animate-pulse" />
              ) : (
                <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${card.countClass}`}>
                  {card.count}
                </span>
              )}
            </div>

            <p className="mt-1 text-[11px] text-slate-500 truncate">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};

export default AssetSummary;
