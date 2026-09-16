import {
  type ApiResponse,
  type Asset,
  type AssetFilterParams,
  type AssetSummaryData,
  type CreateAssetInput,
  type UpdateAssetInput,
} from '../../types/asset.ts';

const BASE_URL = '/api/assets';

export async function getAssets(params?: AssetFilterParams): Promise<ApiResponse<Asset[]>> {
  const query = new URLSearchParams();

  if (params?.search?.trim()) query.set('search', params.search.trim());
  if (params?.status && params.status !== 'all') query.set('status', params.status);
  if (params?.kategori && params.kategori !== 'all') query.set('kategori', params.kategori);

  const url = query.size > 0 ? `${BASE_URL}?${query.toString()}` : BASE_URL;
  const response = await fetch(url);
  return response.json();
}

export async function getAssetSummary(): Promise<ApiResponse<AssetSummaryData>> {
  const response = await fetch(`${BASE_URL}/summary`);
  return response.json();
}

export async function getCategories(): Promise<ApiResponse<string[]>> {
  const response = await fetch(`${BASE_URL}/categories`);
  return response.json();
}

export async function createAsset(input: CreateAssetInput): Promise<ApiResponse<Asset>> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return response.json();
}

export async function updateAsset(id: number, input: UpdateAssetInput): Promise<ApiResponse<Asset>> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return response.json();
}

export async function deleteAsset(id: number): Promise<ApiResponse<{ id: number }>> {
  const response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  return response.json();
}
