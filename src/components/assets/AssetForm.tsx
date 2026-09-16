import React, { useState, useEffect } from 'react';
import { Asset, AssetStatus, CreateAssetInput } from '../../../types/asset.ts';
import Modal from '../ui/Modal.tsx';
import Button from '../ui/Button.tsx';
import { AlertCircle } from 'lucide-react';

interface AssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAssetInput) => Promise<boolean>;
  initialData?: Asset | null;
  availableCategories: string[];
}


const isValidDateInput = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const getLocalToday = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

export const AssetForm: React.FC<AssetFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  availableCategories,
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<CreateAssetInput>({
    nama_aset: '',
    kategori: 'Laptop',
    kode_aset: '',
    status: 'aktif',
    tanggal_pengadaan: getLocalToday(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const standardCategories = [
    'Laptop',
    'Desktop',
    'Printer',
    'Networking',
    'Monitor',
    'Peripheral',
    'Server',
  ];

  const categoryOptions = Array.from(new Set([...standardCategories, ...availableCategories]));

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_aset: initialData.nama_aset,
        kategori: initialData.kategori,
        kode_aset: initialData.kode_aset,
        status: initialData.status,
        tanggal_pengadaan: initialData.tanggal_pengadaan,
      });
      setIsCustomCategory(!categoryOptions.includes(initialData.kategori));
    } else {
      setFormData({
        nama_aset: '',
        kategori: 'Laptop',
        kode_aset: '',
        status: 'aktif',
        tanggal_pengadaan: getLocalToday(),
      });
      setIsCustomCategory(false);
    }
    setErrors({});
    setServerError(null);
  }, [initialData, isOpen]);

  const handleChange = (field: keyof CreateAssetInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-level error on change
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateFrontend = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_aset.trim()) {
      newErrors.nama_aset = 'Nama aset wajib diisi';
    }

    if (!formData.kategori.trim()) {
      newErrors.kategori = 'Kategori wajib diisi';
    }

    if (!formData.kode_aset.trim()) {
      newErrors.kode_aset = 'Kode aset wajib diisi';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.kode_aset)) {
      newErrors.kode_aset =
        'Kode aset hanya boleh mengandung huruf, angka, strip (-), dan underscore (_)';
    }

    if (!['aktif', 'rusak', 'perbaikan'].includes(formData.status)) {
      newErrors.status = 'Status aset harus dipilih';
    }

    if (!formData.tanggal_pengadaan) {
      newErrors.tanggal_pengadaan = 'Tanggal pengadaan wajib diisi';
    } else if (!isValidDateInput(formData.tanggal_pengadaan)) {
      newErrors.tanggal_pengadaan = 'Tanggal pengadaan tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateFrontend()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      }
      if (err.message) {
        setServerError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Aset IT' : 'Tambah Aset IT Baru'}
      subtitle={
        isEditing
          ? `Perbarui informasi inventaris untuk kode ${initialData?.kode_aset}`
          : 'Masukkan rincian perangkat IT baru ke sistem inventaris rumah sakit'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Nama Aset */}
        <div>
          <label
            htmlFor="form-nama-aset"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            Nama Aset <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="form-nama-aset"
              type="text"
              value={formData.nama_aset}
              onChange={(e) => handleChange('nama_aset', e.target.value)}
              maxLength={150}
              placeholder="Contoh: Laptop Dell Latitude 5420 (Dokter IGD)"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.nama_aset
                  ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              } text-slate-900 focus:outline-none focus:ring-2 transition-colors`}
            />
          </div>
          {errors.nama_aset && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.nama_aset}
            </p>
          )}
        </div>

        {/* Grid 2 Column: Kode Aset & Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Kode Aset */}
          <div>
            <label
              htmlFor="form-kode-aset"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Kode Aset (Unik) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="form-kode-aset"
                type="text"
                value={formData.kode_aset}
                onChange={(e) => handleChange('kode_aset', e.target.value.toUpperCase())}
                maxLength={50}
                placeholder="Contoh: AST-IGD-001"
                className={`w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border ${
                  errors.kode_aset
                    ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                } text-slate-900 focus:outline-none focus:ring-2 transition-colors`}
              />
            </div>
            {errors.kode_aset && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.kode_aset}
              </p>
            )}
          </div>

          {/* Kategori */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="form-kategori"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Kategori <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[11px] text-blue-600 hover:text-blue-800"
              >
                {isCustomCategory ? 'Pilih dari list' : '+ Kategori manual'}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                id="form-kategori-custom"
                type="text"
                value={formData.kategori}
                onChange={(e) => handleChange('kategori', e.target.value)}
                maxLength={100}
                placeholder="Ketik kategori baru..."
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.kategori
                    ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                } text-slate-900 focus:outline-none focus:ring-2 transition-colors`}
              />
            ) : (
              <select
                id="form-kategori"
                value={formData.kategori}
                onChange={(e) => handleChange('kategori', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.kategori
                    ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                } text-slate-900 focus:outline-none focus:ring-2 transition-colors`}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {errors.kategori && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.kategori}
              </p>
            )}
          </div>
        </div>

        {/* Grid 2 Column: Status & Tanggal Pengadaan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Status */}
          <div>
            <label
              htmlFor="form-status"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Status Operasional <span className="text-rose-500">*</span>
            </label>
            <select
              id="form-status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as AssetStatus)}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.status
                  ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              } text-slate-900 focus:outline-none focus:ring-2 transition-colors`}
            >
              <option value="aktif">Aktif (Siap Digunakan)</option>
              <option value="rusak">Rusak (Perlu Penggantian)</option>
              <option value="perbaikan">Perbaikan (Dalam Servis)</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.status}
              </p>
            )}
          </div>

          {/* Tanggal Pengadaan */}
          <div>
            <label
              htmlFor="form-tanggal-pengadaan"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Tanggal Pengadaan <span className="text-rose-500">*</span>
            </label>
            <input
              id="form-tanggal-pengadaan"
              type="date"
              value={formData.tanggal_pengadaan}
              onChange={(e) => handleChange('tanggal_pengadaan', e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.tanggal_pengadaan
                  ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              } text-slate-900 focus:outline-none focus:ring-2 transition-colors`}
            />
            {errors.tanggal_pengadaan && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.tanggal_pengadaan}
              </p>
            )}
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            id="btn-submit-asset-form"
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : isEditing ? 'Perbarui Aset' : 'Simpan Aset'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssetForm;
