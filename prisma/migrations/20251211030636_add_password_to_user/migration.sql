/*
  Warnings:

  - Added the required column `password` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add password column with a default hashed password
-- Default password is 'changeme' (bcrypt hash with salt rounds 10)
ALTER TABLE `user` ADD COLUMN `password` VARCHAR(191) NOT NULL DEFAULT '$2b$10$fMfd4vVyEDFOsYCjFPGS3e5LFVtpRTyBK9Q1JFOPouZ13b.gjP7JO';
