import { useCallback, useEffect, useState } from 'react';
import {
  type Asset,
  type AssetStatus,
  type AssetSummaryData,
  type CreateAssetInput,
} from '../types/asset.ts';
import {
  createAsset,
  deleteAsset,
  getAssets,
  getAssetSummary,
  getCategories,
  updateAsset,
} from '../lib/api/assets.ts';
import AssetFilters from './components/assets/AssetFilters.tsx';
import AssetForm from './components/assets/AssetForm.tsx';
import AssetSummary from './components/assets/AssetSummary.tsx';
import AssetTable from './components/assets/AssetTable.tsx';
import DeleteAssetDialog from './components/assets/DeleteAssetDialog.tsx';
import HospitalHeader from './components/assets/HospitalHeader.tsx';
import { ToastContainer, type ToastMessage } from './components/ui/Toast.tsx';

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<AssetSummaryData>({
    aktif: 0,
    rusak: 0,
    perbaikan: 0,
    total: 0,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AssetStatus | 'all'>('all');
  const [kategori, setKategori] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], message: string) => {
    const toast: ToastMessage = {
      id: crypto.randomUUID(),
      type,
      message,
    };
    setToasts((current) => [...current, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const fetchSummary = useCallback(async () => {
    try {
      const response = await getAssetSummary();
      if (response.success) setSummary(response.data);
    } catch (fetchError) {
      console.error('Failed to fetch summary:', fetchError);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      if (response.success) setCategories(response.data);
    } catch (fetchError) {
      console.error('Failed to fetch categories:', fetchError);
    }
  }, []);

  const fetchAssetList = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAssets({ search, status, kategori });
      if (response.success) {
        setAssets(response.data);
      } else {
        setError(response.message || 'Gagal memuat data aset');
      }
    } catch (fetchError) {
      console.error('Failed to fetch assets:', fetchError);
      setError('Koneksi ke REST API gagal. Pastikan server dan database aktif.');
    } finally {
      setIsLoading(false);
    }
  }, [search, status, kategori]);

  useEffect(() => {
    fetchSummary();
    fetchCategories();
  }, [fetchSummary, fetchCategories]);

  useEffect(() => {
    fetchAssetList();
  }, [fetchAssetList]);

  const handleSummaryFilterClick = (cardStatus: AssetStatus | 'all') => {
    if (cardStatus === 'all' || status === cardStatus) {
      setStatus('all');
      return;
    }
    setStatus(cardStatus);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setKategori('all');
  };

  const isFiltered = Boolean(search.trim()) || status !== 'all' || kategori !== 'all';

  const handleOpenCreateModal = () => {
    setEditingAsset(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (asset: Asset) => {
    setDeletingAsset(asset);
    setIsDeleteDialogOpen(true);
  };

  const refreshDashboard = async () => {
    await Promise.all([fetchAssetList(), fetchSummary(), fetchCategories()]);
  };

  const handleFormSubmit = async (formData: CreateAssetInput): Promise<boolean> => {
    const response = editingAsset
      ? await updateAsset(editingAsset.id, formData)
      : await createAsset(formData);

    if (!response.success) throw response;

    addToast(
      'success',
      editingAsset ? 'Aset berhasil diperbarui.' : 'Aset berhasil ditambahkan.',
    );
    await refreshDashboard();
    return true;
  };

  const handleConfirmDelete = async (id: number): Promise<boolean> => {
    try {
      const response = await deleteAsset(id);

      if (!response.success) {
        addToast('error', response.message || 'Gagal menghapus aset.');
        return false;
      }

      addToast('success', 'Aset berhasil dihapus.');
      await refreshDashboard();
      return true;
    } catch (deleteError) {
      console.error('Failed to delete asset:', deleteError);
      addToast('error', 'Gagal menghapus aset. Silakan coba lagi.');
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 flex flex-col">
      <HospitalHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Daftar Aset IT
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kelola dan pantau inventaris perangkat IT rumah sakit.
            </p>
          </div>
        </div>

        <section aria-label="Ringkasan Status Aset">
          <AssetSummary
            summary={summary}
            isLoading={isLoading && assets.length === 0}
            onFilterClick={handleSummaryFilterClick}
            activeStatusFilter={status}
          />
        </section>

        <section aria-label="Pencarian dan Filter">
          <AssetFilters
            search={search}
            status={status}
            kategori={kategori}
            availableCategories={categories}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onKategoriChange={setKategori}
            onResetFilters={handleResetFilters}
            onOpenCreateModal={handleOpenCreateModal}
            isFiltered={isFiltered}
          />
        </section>

        <section aria-label="Tabel Inventaris Aset IT">
          <AssetTable
            assets={assets}
            isLoading={isLoading}
            error={error}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteDialog}
            onRetry={fetchAssetList}
            onResetFilters={handleResetFilters}
            isFiltered={isFiltered}
          />
        </section>
      </main>

      <AssetForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingAsset}
        availableCategories={categories}
      />

      <DeleteAssetDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        asset={deletingAsset}
        onConfirmDelete={handleConfirmDelete}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
