import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string): boolean {
  if (!dateRegex.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const assetSchema = z.object({
  nama_aset: z
    .string()
    .trim()
    .min(1, 'Nama aset wajib diisi dan tidak boleh kosong')
    .max(150, 'Nama aset maksimal 150 karakter'),

  kategori: z
    .string()
    .trim()
    .min(1, 'Kategori wajib diisi')
    .max(100, 'Kategori maksimal 100 karakter'),

  kode_aset: z
    .string()
    .trim()
    .min(1, 'Kode aset wajib diisi')
    .max(50, 'Kode aset maksimal 50 karakter')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Kode aset hanya boleh mengandung huruf, angka, strip (-), dan underscore (_)'),

  status: z.enum(['aktif', 'rusak', 'perbaikan']),

  tanggal_pengadaan: z
    .string()
    .trim()
    .min(1, 'Tanggal pengadaan wajib diisi')
    .refine(isValidDate, {
      message: 'Tanggal pengadaan harus valid dengan format YYYY-MM-DD',
    }),
});

export type AssetSchemaInput = z.infer<typeof assetSchema>;

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (field && typeof field === 'string' && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}
