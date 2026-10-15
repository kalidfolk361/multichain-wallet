import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { NETWORKS } from '@/lib/networks';
import { shortenAddress, timeAgo, copyToClipboard } from '@/lib/format';
import {
  X, Copy, Check, ExternalLink, Tag, Clock, User, Network as NetworkIcon,
  Loader2, AlertCircle, Sparkles, DollarSign, Trash2
} from 'lucide-react';

interface NFT {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  network_key: string;
  creator_address: string;
  owner_address: string;
  token_id: string | null;
  contract_address: string | null;
  mint_status: string;
  mint_price: string | null;
  is_listed: boolean;
  metadata_uri: string | null;
  royalty_percent: number;
  created_at: string;
}

interface NFTDetailModalProps {
  nft: NFT;
  onClose: () => void;
  onUpdate: () => void;
}

export function NFTDetailModal({ nft, onClose, onUpdate }: NFTDetailModalProps) {
  const network = NETWORKS[nft.network_key];
  const [copied, setCopied] = useState(false);
  const [listingPrice, setListingPrice] = useState(nft.mint_price ?? '');
  const [listing, setListing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleList = async () => {
    setError(null);
    if (!listingPrice || parseFloat(listingPrice) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    setListing(true);
    const { error: updateError } = await supabase
      .from('nfts')
      .update({ is_listed: true, mint_price: listingPrice })
      .eq('id', nft.id);
    setListing(false);
    if (updateError) {
      setError('Could not list NFT. Please try again.');
      return;
    }
    onUpdate();
  };

  const handleUnlist = async () => {
    setError(null);
    setListing(true);
    const { error: updateError } = await supabase
      .from('nfts')
      .update({ is_listed: false })
      .eq('id', nft.id);
    setListing(false);
    if (updateError) {
      setError('Could not unlist NFT. Please try again.');
      return;
    }
    onUpdate();
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error: deleteError } = await supabase
      .from('nfts')
      .delete()
      .eq('id', nft.id);
    setDeleting(false);
    if (deleteError) {
      setError('Could not delete NFT. Please try again.');
      return;
    }
    onUpdate();
  };

  if (!network) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-[#0D0E14] border border-white/[0.06] rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-square md:aspect-auto bg-white/[0.02]">
            <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover md:rounded-l-2xl" />
            <div className="absolute top-3 left-3">
              <span className={`text-xs px-2.5 py-1 rounded-lg backdrop-blur-md ${
                nft.mint_status === 'minted' ? 'bg-green-500/20 text-green-300' :
                nft.mint_status === 'lazy' ? 'bg-blue-500/20 text-blue-300' :
                'bg-amber-500/20 text-amber-300'
              }`}>
                {nft.mint_status === 'minted' ? 'On-Chain' : nft.mint_status === 'lazy' ? 'Lazy Minted' : nft.mint_status}
              </span>
            </div>
          </div>

          <div className="p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{nft.name}</h3>
                {network && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`w-4 h-4 rounded bg-gradient-to-br ${network.logoGradient}`} />
                    <span className="text-xs text-gray-400">{network.name}</span>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {nft.description && (
              <p className="text-sm text-gray-400 mb-4">{nft.description}</p>
            )}

            <div className="space-y-2.5 mb-4">
              <DetailRow icon={User} label="Creator" value={shortenAddress(nft.creator_address, 6)} onCopy={() => handleCopy(nft.creator_address)} copied={copied} />
              <DetailRow icon={User} label="Owner" value={shortenAddress(nft.owner_address, 6)} />
              <DetailRow icon={NetworkIcon} label="Network" value={network.name} />
              <DetailRow icon={Clock} label="Created" value={timeAgo(nft.created_at)} />
              {nft.token_id && <DetailRow icon={Tag} label="Token ID" value={nft.token_id} />}
              {nft.royalty_percent > 0 && <DetailRow icon={DollarSign} label="Royalty" value={`${nft.royalty_percent}%`} />}
            </div>

            {nft.is_listed && nft.mint_price && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-400/80">Listed for sale</p>
                    <p className="text-lg font-bold text-white">{nft.mint_price} {network.currencySymbol}</p>
                  </div>
                  <button
                    onClick={handleUnlist}
                    disabled={listing}
                    className="text-xs text-gray-400 hover:text-white bg-white/[0.04] px-3 py-1.5 rounded-lg"
                  >
                    Unlist
                  </button>
                </div>
              </div>
            )}

            {!nft.is_listed && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-400 mb-2">List for sale</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="any"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{network.currencySymbol}</span>
                  </div>
                  <button
                    onClick={handleList}
                    disabled={listing || !listingPrice}
                    className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium px-4 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {listing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Tag className="w-3.5 h-3.5" /> List</>}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2 mt-auto">
              {nft.contract_address && (
                <a
                  href={`${network.explorerUrl}/address/${nft.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl py-2.5 text-xs font-medium text-white transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Contract
                </a>
              )}
              {nft.mint_status === 'lazy' && (
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-medium rounded-xl py-2.5 transition-all shadow-lg shadow-blue-500/20"
                  title="Mint on-chain (requires gas)"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Mint On-Chain
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl px-3 py-2.5 text-xs font-medium transition-all flex items-center gap-1.5"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  onCopy,
  copied,
}: {
  icon: typeof User;
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-white font-mono">{value}</span>
        {onCopy && (
          <button onClick={onCopy} className="text-gray-500 hover:text-white">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}
