export type AssetStatus = 'aktif' | 'rusak' | 'perbaikan';

export interface Asset {
  id: number;
  nama_aset: string;
  kategori: string;
  kode_aset: string;
  status: AssetStatus;
  tanggal_pengadaan: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetInput {
  nama_aset: string;
  kategori: string;
  kode_aset: string;
  status: AssetStatus;
  tanggal_pengadaan: string;
}

export type UpdateAssetInput = CreateAssetInput;

export interface AssetSummaryData {
  aktif: number;
  rusak: number;
  perbaikan: number;
  total: number;
}

export interface AssetFilterParams {
  search?: string;
  status?: AssetStatus | 'all';
  kategori?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
  data: null;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
