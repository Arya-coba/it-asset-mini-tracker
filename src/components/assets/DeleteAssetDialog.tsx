import React, { useState } from 'react';
import { Asset } from '../../../types/asset.ts';
import Modal from '../ui/Modal.tsx';
import Button from '../ui/Button.tsx';
import { AlertTriangle } from 'lucide-react';

interface DeleteAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onConfirmDelete: (id: number) => Promise<boolean>;
}

export const DeleteAssetDialog: React.FC<DeleteAssetDialogProps> = ({
  isOpen,
  onClose,
  asset,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!asset) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const success = await onConfirmDelete(asset.id);
      if (success) {
        onClose();
      } else {
        setError('Gagal menghapus aset. Silakan coba lagi.');
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus aset. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Aset?"
      subtitle="Konfirmasi penghapusan perangkat IT dari inventaris"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-sm text-slate-600 leading-relaxed">
            <p>
              Apakah Anda yakin ingin menghapus{' '}
              <strong className="text-slate-900 font-semibold">&ldquo;{asset.nama_aset}&rdquo;</strong>{' '}
              ({asset.kode_aset})?
            </p>
            <p className="mt-2 text-xs text-rose-600 font-medium">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            id="btn-confirm-delete"
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={isDeleting}
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteAssetDialog;
