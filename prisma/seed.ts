import { AssetStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const toDate = (value: string) => new Date(`${value}T00:00:00.000Z`);

const hospitalAssets = [
  {
    nama_aset: 'Laptop Dell Latitude 5420 (Dokter IGD)',
    kategori: 'Laptop',
    kode_aset: 'AST-IGD-001',
    status: AssetStatus.aktif,
    tanggal_pengadaan: toDate('2023-03-15'),
  },
  {
    nama_aset: 'PC Desktop HP ProDesk (Admin Radiologi)',
    kategori: 'Desktop',
    kode_aset: 'AST-RAD-002',
    status: AssetStatus.aktif,
    tanggal_pengadaan: toDate('2022-08-20'),
  },
  {
    nama_aset: 'Printer Thermal Resep Epson TM-T82 (Farmasi)',
    kategori: 'Printer',
    kode_aset: 'AST-FAR-003',
    status: AssetStatus.aktif,
    tanggal_pengadaan: toDate('2023-01-10'),
  },
  {
    nama_aset: 'Cisco Catalyst 2960-X Switch (Rack Lt. 2)',
    kategori: 'Networking',
    kode_aset: 'AST-NET-004',
    status: AssetStatus.perbaikan,
    tanggal_pengadaan: toDate('2021-11-05'),
  },
  {
    nama_aset: 'Monitor LED Samsung 24 Inch (Poli Anak)',
    kategori: 'Monitor',
    kode_aset: 'AST-POL-005',
    status: AssetStatus.aktif,
    tanggal_pengadaan: toDate('2023-06-18'),
  },
  {
    nama_aset: 'UPS APC Smart-UPS 1500VA (Server Room)',
    kategori: 'Peripheral',
    kode_aset: 'AST-SRV-006',
    status: AssetStatus.rusak,
    tanggal_pengadaan: toDate('2020-04-12'),
  },
  {
    nama_aset: 'Server Dell PowerEdge R740 (Database SIMRS)',
    kategori: 'Server',
    kode_aset: 'AST-SRV-007',
    status: AssetStatus.aktif,
    tanggal_pengadaan: toDate('2022-02-01'),
  },
  {
    nama_aset: 'Barcode Scanner Zebra DS2208 (Laboratorium)',
    kategori: 'Peripheral',
    kode_aset: 'AST-LAB-008',
    status: AssetStatus.aktif,
    tanggal_pengadaan: toDate('2023-09-14'),
  },
  {
    nama_aset: 'PC Desktop Dell OptiPlex (Loket Pendaftaran)',
    kategori: 'Desktop',
    kode_aset: 'AST-LOK-009',
    status: AssetStatus.perbaikan,
    tanggal_pengadaan: toDate('2022-05-30'),
  },
  {
    nama_aset: 'Printer Gelang Pasien Zebra ZD510 (Admission)',
    kategori: 'Printer',
    kode_aset: 'AST-ADM-010',
    status: AssetStatus.rusak,
    tanggal_pengadaan: toDate('2021-10-25'),
  },
];

async function main() {
  console.log('Seeding initial hospital IT assets...');

  for (const item of hospitalAssets) {
    await prisma.asset.upsert({
      where: { kode_aset: item.kode_aset },
      update: item,
      create: item,
    });
  }

  const count = await prisma.asset.count();
  console.log(`Successfully seeded ${count} assets.`);
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
