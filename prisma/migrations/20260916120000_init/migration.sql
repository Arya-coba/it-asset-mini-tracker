-- CreateTable
CREATE TABLE `assets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_aset` VARCHAR(150) NOT NULL,
    `kategori` VARCHAR(100) NOT NULL,
    `kode_aset` VARCHAR(50) NOT NULL,
    `status` ENUM('aktif', 'rusak', 'perbaikan') NOT NULL,
    `tanggal_pengadaan` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assets_kode_aset_key`(`kode_aset`),
    INDEX `assets_status_idx`(`status`),
    INDEX `assets_kategori_idx`(`kategori`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
