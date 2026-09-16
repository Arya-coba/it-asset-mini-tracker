import { AssetStatus, Prisma, type Asset } from '@prisma/client';
import { Router, type Request, type Response } from 'express';
import prisma from '../../lib/prisma.ts';
import { assetSchema, formatZodErrors } from '../../lib/validations/asset.ts';

const router = Router();
const validStatuses: AssetStatus[] = [
  AssetStatus.aktif,
  AssetStatus.rusak,
  AssetStatus.perbaikan,
];

function parseAssetId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function toDatabaseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toApiAsset(asset: Asset) {
  return {
    ...asset,
    tanggal_pengadaan: asset.tanggal_pengadaan.toISOString().slice(0, 10),
  };
}

function isDuplicateCodeError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

// GET /api/assets/summary - Counts of assets by status
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const [aktif, rusak, perbaikan, total] = await Promise.all([
      prisma.asset.count({ where: { status: AssetStatus.aktif } }),
      prisma.asset.count({ where: { status: AssetStatus.rusak } }),
      prisma.asset.count({ where: { status: AssetStatus.perbaikan } }),
      prisma.asset.count(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Asset summary retrieved successfully',
      data: { aktif, rusak, perbaikan, total },
    });
  } catch (error) {
    console.error('Error fetching asset summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching summary',
      errors: { server: 'Gagal mengambil ringkasan aset' },
      data: null,
    });
  }
});

// GET /api/assets/categories - Get distinct categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.asset.findMany({
      select: { kategori: true },
      distinct: ['kategori'],
      orderBy: { kategori: 'asc' },
    });

    return res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories.map((item) => item.kategori),
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching categories',
      errors: { server: 'Gagal mengambil daftar kategori' },
      data: null,
    });
  }
});

// GET /api/assets - List assets with optional search and filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, status, kategori } = req.query;
    const where: Prisma.AssetWhereInput = {};

    if (typeof search === 'string' && search.trim()) {
      where.nama_aset = { contains: search.trim() };
    }

    if (typeof status === 'string' && status !== 'all' && status.trim()) {
      if (!validStatuses.includes(status as AssetStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status filter',
          errors: { status: 'Status harus aktif, rusak, atau perbaikan' },
          data: null,
        });
      }
      where.status = status as AssetStatus;
    }

    if (typeof kategori === 'string' && kategori !== 'all' && kategori.trim()) {
      where.kategori = kategori.trim();
    }

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { id: 'desc' },
    });

    return res.status(200).json({
      success: true,
      message: 'Assets retrieved successfully',
      data: assets.map(toApiAsset),
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching assets',
      errors: { server: 'Gagal memuat data aset dari database' },
      data: null,
    });
  }
});

// GET /api/assets/:id - Get a single asset
router.get('/:id', async (req: Request, res: Response) => {
  const id = parseAssetId(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Invalid asset ID',
      data: null,
    });
  }

  try {
    const asset = await prisma.asset.findUnique({ where: { id } });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Asset retrieved successfully',
      data: toApiAsset(asset),
    });
  } catch (error) {
    console.error('Error fetching asset by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching asset',
      errors: { server: 'Gagal mengambil data aset' },
      data: null,
    });
  }
});

// POST /api/assets - Create a new asset
router.post('/', async (req: Request, res: Response) => {
  const validationResult = assetSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: formatZodErrors(validationResult.error),
      data: null,
    });
  }

  const data = validationResult.data;

  try {
    const existingAsset = await prisma.asset.findUnique({
      where: { kode_aset: data.kode_aset },
    });

    if (existingAsset) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: {
          kode_aset: `Kode aset '${data.kode_aset}' sudah digunakan. Harap gunakan kode unik lain.`,
        },
        data: null,
      });
    }

    const createdAsset = await prisma.asset.create({
      data: {
        ...data,
        status: data.status as AssetStatus,
        tanggal_pengadaan: toDatabaseDate(data.tanggal_pengadaan),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: toApiAsset(createdAsset),
    });
  } catch (error) {
    if (isDuplicateCodeError(error)) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: { kode_aset: 'Kode aset sudah digunakan. Harap gunakan kode unik lain.' },
        data: null,
      });
    }

    console.error('Error creating asset:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create asset due to server error',
      errors: { server: 'Terjadi kesalahan saat menyimpan aset' },
      data: null,
    });
  }
});

// PUT /api/assets/:id - Replace editable fields on an existing asset
router.put('/:id', async (req: Request, res: Response) => {
  const id = parseAssetId(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Invalid asset ID',
      data: null,
    });
  }

  const validationResult = assetSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: formatZodErrors(validationResult.error),
      data: null,
    });
  }

  const data = validationResult.data;

  try {
    const currentAsset = await prisma.asset.findUnique({ where: { id } });

    if (!currentAsset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
        data: null,
      });
    }

    if (data.kode_aset !== currentAsset.kode_aset) {
      const duplicate = await prisma.asset.findUnique({
        where: { kode_aset: data.kode_aset },
      });

      if (duplicate) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: {
            kode_aset: `Kode aset '${data.kode_aset}' sudah digunakan oleh aset lain.`,
          },
          data: null,
        });
      }
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        ...data,
        status: data.status as AssetStatus,
        tanggal_pengadaan: toDatabaseDate(data.tanggal_pengadaan),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: toApiAsset(updatedAsset),
    });
  } catch (error) {
    if (isDuplicateCodeError(error)) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: { kode_aset: 'Kode aset sudah digunakan oleh aset lain.' },
        data: null,
      });
    }

    console.error('Error updating asset:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update asset due to server error',
      errors: { server: 'Terjadi kesalahan saat memperbarui aset' },
      data: null,
    });
  }
});

// DELETE /api/assets/:id - Delete an asset
router.delete('/:id', async (req: Request, res: Response) => {
  const id = parseAssetId(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Invalid asset ID',
      data: null,
    });
  }

  try {
    const existingAsset = await prisma.asset.findUnique({ where: { id } });

    if (!existingAsset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
        data: null,
      });
    }

    await prisma.asset.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete asset. Please try again.',
      errors: { server: 'Terjadi kesalahan saat menghapus aset' },
      data: null,
    });
  }
});

export default router;
