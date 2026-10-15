/*
# Create core wallet tables: wallets, transactions, nfts, nft_metadata

## Overview
This migration creates the database foundation for a non-custodial multi-network
USDT wallet with NFT lazy-minting capability. Users authenticate with email/password
via Supabase Auth, then create or import wallet addresses on multiple blockchain
networks. Private keys are stored encrypted in the browser only — the database stores
only public wallet addresses. NFTs are lazy-minted (metadata stored server-side, actual
on-chain mint deferred until sale/transfer) so users can mint for free.

## New Tables

### wallets
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, cascade delete) — the owner
- `address` (text, not null) — the public blockchain wallet address
- `encrypted_private_key` (text, null) — AES-encrypted private key (encryption done client-side, key derived from user's wallet password, never decrypted on server)
- `network_key` (text, not null) — which network this wallet is for (e.g. 'ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'base', 'tron')
- `label` (text, default 'My Wallet') — user-defined name
- `is_primary` (boolean, default false) — whether this is the user's primary wallet for this network
- `created_at` (timestamptz, default now())
- Unique constraint on (user_id, network_key, address) to prevent duplicate wallets

### transactions
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, cascade delete)
- `wallet_id` (uuid, references wallets, cascade delete)
- `network_key` (text, not null) — network this tx happened on
- `tx_hash` (text, not null) — blockchain transaction hash
- `tx_type` (text, not null) — 'send' or 'receive'
- `token_symbol` (text, not null) — e.g. 'USDT', 'ETH', 'MATIC'
- `token_type` (text, not null, default 'token') — 'native' or 'token'
- `amount` (text, not null) — amount transferred (as string for precision)
- `counterparty_address` (text, not null) — the other party's address
- `status` (text, not null, default 'pending') — 'pending', 'confirmed', 'failed'
- `block_number` (bigint, null) — block where tx was included
- `created_at` (timestamptz, default now())
- `confirmed_at` (timestamptz, null) — when tx was confirmed on-chain

### nfts
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, cascade delete) — the creator/owner
- `name` (text, not null)
- `description` (text, null)
- `image_url` (text, not null) — URL to the NFT artwork image
- `network_key` (text, not null) — which network this NFT is minted on
- `creator_address` (text, not null) — wallet address of the creator
- `owner_address` (text, not null) — current owner's wallet address
- `token_id` (text, null) — on-chain token ID (null until minted)
- `contract_address` (text, null) — NFT contract address (null until deployed)
- `mint_status` (text, not null, default 'lazy') — 'lazy', 'minting', 'minted', 'failed'
- `mint_price` (text, null) — sale price in native token (for marketplace)
- `is_listed` (boolean, default false) — whether NFT is listed for sale
- `metadata_uri` (text, null) — URI to the off-chain metadata
- `royalty_percent` (integer, default 0) — creator royalty percentage
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Security
- RLS enabled on all tables
- Each table scoped to authenticated users who own the rows (auth.uid() = user_id)
- Separate SELECT, INSERT, UPDATE, DELETE policies per table
- Owner columns default to auth.uid() so inserts work without explicit user_id
- No public/anon access — all operations require authentication
*/

-- ============ wallets table ============
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  address text NOT NULL,
  encrypted_private_key text,
  network_key text NOT NULL,
  label text NOT NULL DEFAULT 'My Wallet',
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS wallets_user_network_address_idx
  ON wallets (user_id, network_key, address);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_wallets" ON wallets;
CREATE POLICY "select_own_wallets" ON wallets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_wallets" ON wallets;
CREATE POLICY "insert_own_wallets" ON wallets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_wallets" ON wallets;
CREATE POLICY "update_own_wallets" ON wallets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_wallets" ON wallets;
CREATE POLICY "delete_own_wallets" ON wallets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ transactions table ============
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE,
  network_key text NOT NULL,
  tx_hash text NOT NULL,
  tx_type text NOT NULL CHECK (tx_type IN ('send', 'receive')),
  token_symbol text NOT NULL,
  token_type text NOT NULL DEFAULT 'token' CHECK (token_type IN ('native', 'token')),
  amount text NOT NULL,
  counterparty_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  block_number bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_wallet_id_idx ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at DESC);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
CREATE POLICY "update_own_transactions" ON transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_transactions" ON transactions;
CREATE POLICY "delete_own_transactions" ON transactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ nfts table ============
CREATE TABLE IF NOT EXISTS nfts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text NOT NULL,
  network_key text NOT NULL,
  creator_address text NOT NULL,
  owner_address text NOT NULL,
  token_id text,
  contract_address text,
  mint_status text NOT NULL DEFAULT 'lazy' CHECK (mint_status IN ('lazy', 'minting', 'minted', 'failed')),
  mint_price text,
  is_listed boolean NOT NULL DEFAULT false,
  metadata_uri text,
  royalty_percent integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nfts_user_id_idx ON nfts(user_id);
CREATE INDEX IF NOT EXISTS nfts_created_at_idx ON nfts(created_at DESC);

ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_nfts" ON nfts;
CREATE POLICY "select_own_nfts" ON nfts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_nfts" ON nfts;
CREATE POLICY "insert_own_nfts" ON nfts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_nfts" ON nfts;
CREATE POLICY "update_own_nfts" ON nfts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_nfts" ON nfts;
CREATE POLICY "delete_own_nfts" ON nfts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ updated_at trigger for nfts ============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS nfts_updated_at ON nfts;
CREATE TRIGGER nfts_updated_at BEFORE UPDATE ON nfts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
