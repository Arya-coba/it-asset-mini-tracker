import React, { useState } from 'react';
import { Asset } from '../../../types/asset.ts';
import Badge from '../ui/Badge.tsx';
import {
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Copy,
  Check,
  Laptop,
  Monitor,
  Printer,
  Server,
  Network,
  Cpu,
  Inbox,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface AssetTableProps {
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onRetry: () => void;
  onResetFilters?: () => void;
  isFiltered?: boolean;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  isLoading,
  error,
  onEdit,
  onDelete,
  onRetry,
  onResetFilters,
  isFiltered = false,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('laptop')) return <Laptop className="w-4 h-4 text-blue-600" />;
    if (cat.includes('desktop') || cat.includes('pc'))
      return <Monitor className="w-4 h-4 text-indigo-600" />;
    if (cat.includes('printer')) return <Printer className="w-4 h-4 text-emerald-600" />;
    if (cat.includes('network') || cat.includes('switch') || cat.includes('router'))
      return <Network className="w-4 h-4 text-purple-600" />;
    if (cat.includes('server')) return <Server className="w-4 h-4 text-amber-600" />;
    return <Cpu className="w-4 h-4 text-slate-600" />;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Error state */}
      {error && !isLoading && (
        <div className="p-8 text-center bg-rose-50/50">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-900">Gagal Memuat Data Aset</h4>
          <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Table responsive container */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th scope="col" className="py-3.5 pl-6 pr-4 whitespace-nowrap">
                Kode Aset
              </th>
              <th scope="col" className="py-3.5 px-4">
                Nama Aset
              </th>
              <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                Kategori
              </th>
              <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                Status
              </th>
              <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                Tanggal Pengadaan
              </th>
              <th scope="col" className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {/* Loading Skeleton */}
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 pl-6 pr-4">
                    <div className="h-5 w-24 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-48 bg-slate-100 rounded mb-1" />
                    <div className="h-3 w-32 bg-slate-50 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-20 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-16 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-24 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 pl-4 pr-6 text-right">
                    <div className="h-8 w-16 bg-slate-100 rounded ml-auto" />
                  </td>
                </tr>
              ))}

            {/* Empty State */}
            {!isLoading && !error && assets.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-semibold text-slate-800">
                      Tidak Ada Aset Ditemukan
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 text-center leading-relaxed">
                      {isFiltered
                        ? 'Tidak ada aset yang sesuai dengan kriteria pencarian atau filter yang dipilih.'
                        : 'Belum ada data aset yang terdaftar dalam sistem inventaris.'}
                    </p>
                    {isFiltered && onResetFilters && (
                      <button
                        onClick={onResetFilters}
                        className="mt-4 px-3.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Normal Asset Rows */}
            {!isLoading &&
              !error &&
              assets.map((asset) => (
                <tr
                  key={asset.id}
                  id={`asset-row-${asset.id}`}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Kode Aset */}
                  <td className="py-3.5 pl-6 pr-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {asset.kode_aset}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(asset.kode_aset)}
                        title="Salin Kode Aset"
                        className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        {copiedCode === asset.kode_aset ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Nama Aset */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 hover:text-blue-700 transition-colors">
                      {asset.nama_aset}
                    </div>
                  </td>

                  {/* Kategori */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                      {getCategoryIcon(asset.kategori)}
                      <span>{asset.kategori}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge status={asset.status} />
                  </td>

                  {/* Tanggal Pengadaan */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                    <div className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(asset.tanggal_pengadaan)}</span>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        id={`btn-edit-asset-${asset.id}`}
                        onClick={() => onEdit(asset)}
                        title="Edit Aset"
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-delete-asset-${asset.id}`}
                        onClick={() => onDelete(asset)}
                        title="Hapus Aset"
                        className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {!isLoading && !error && assets.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Menampilkan <strong>{assets.length}</strong> perangkat IT
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Diperbarui secara real-time via REST API
          </span>
        </div>
      )}
    </div>
  );
};

export default AssetTable;
