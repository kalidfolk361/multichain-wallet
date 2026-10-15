import { useState, useRef } from 'react';
import { useWallet } from '@/context/WalletContext';
import { NETWORKS } from '@/lib/networks';
import { supabase } from '@/lib/supabase';
import { X, Upload, Loader2, Sparkles, Check, AlertCircle } from 'lucide-react';

interface NFTCreateModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function NFTCreateModal({ onClose, onCreated }: NFTCreateModalProps) {
  const { wallets } = useWallet();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedWalletKey, setSelectedWalletKey] = useState('');
  const [royalty, setRoyalty] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const walletsByNetwork = wallets.map((w) => ({
    wallet: w,
    network: NETWORKS[w.network_key],
  })).filter((w) => w.network);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }
    setImageFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    setError(null);
    if (!name.trim()) { setError('Please enter a name'); return; }
    if (!imageFile) { setError('Please upload an image'); return; }
    if (!selectedWalletKey) { setError('Please select a wallet'); return; }

    setLoading(true);
    try {
      const selectedWallet = wallets.find((w) => `${w.network_key}:${w.address}` === selectedWalletKey);
      if (!selectedWallet) { setError('Invalid wallet selection'); setLoading(false); return; }

      const fileName = `nft-${Date.now()}-${Math.random().toString(36).slice(2)}.${imageFile.name.split('.').pop()}`;
      const filePath = `${selectedWallet.user_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('nft-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        setError('Could not upload image. Please try again.');
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('nft-images')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;
      const metadataUri = `${imageUrl}#metadata`;

      const { error: insertError } = await supabase.from('nfts').insert({
        name: name.trim(),
        description: description.trim() || null,
        image_url: imageUrl,
        network_key: selectedWallet.network_key,
        creator_address: selectedWallet.address,
        owner_address: selectedWallet.address,
        mint_status: 'lazy',
        metadata_uri: metadataUri,
        royalty_percent: parseInt(royalty) || 0,
      });

      if (insertError) {
        setError('Could not create NFT. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => onCreated(), 1500);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-sm bg-[#0D0E14] border border-white/[0.06] rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">NFT Created!</h3>
          <p className="text-sm text-gray-400">Your NFT has been lazy minted and saved to your collection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#0D0E14] border border-white/[0.06] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create NFT</h3>
              <p className="text-xs text-gray-500">Free lazy minting - no gas fees</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">NFT Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative border border-dashed border-white/[0.1] rounded-xl p-6 cursor-pointer hover:border-white/[0.2] transition-all"
            >
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                    <p className="text-sm text-white">Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-600 mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
              placeholder="My Awesome NFT"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              placeholder="Describe your NFT..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Wallet</label>
            <select
              value={selectedWalletKey}
              onChange={(e) => setSelectedWalletKey(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="">Select a wallet...</option>
              {walletsByNetwork.map(({ wallet, network }) => (
                <option key={`${wallet.network_key}:${wallet.address}`} value={`${wallet.network_key}:${wallet.address}`}>
                  {network.name} - {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Creator Royalty (%)</label>
            <input
              type="number"
              min="0"
              max="25"
              value={royalty}
              onChange={(e) => setRoyalty(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
              placeholder="0"
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <p className="text-xs text-blue-300/90 leading-relaxed">
              Your NFT will be lazy minted (stored off-chain) for free. It will be minted on-chain when someone buys it or when you transfer it, with gas fees paid by the buyer.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Create NFT</>}
          </button>
        </div>
      </div>
    </div>
  );
}
