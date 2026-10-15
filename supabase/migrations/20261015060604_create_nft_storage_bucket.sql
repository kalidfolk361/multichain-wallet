/*
# Create NFT images storage bucket

## Overview
Creates a storage bucket for NFT artwork images and sets up public read access
(so NFT images can be displayed) while restricting writes to authenticated users
who own the folder (folder path is user_id).

## Changes
- Create 'nft-images' bucket (public read)
- RLS policies: authenticated users can upload to their own user_id folder,
  read is public (images need to be viewable by anyone), and users can only
  delete files in their own folder.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('nft-images', 'nft-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "nft_images_public_read" ON storage.objects;
CREATE POLICY "nft_images_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'nft-images');

DROP POLICY IF EXISTS "nft_images_auth_upload" ON storage.objects;
CREATE POLICY "nft_images_auth_upload" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'nft-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "nft_images_owner_delete" ON storage.objects;
CREATE POLICY "nft_images_owner_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'nft-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
