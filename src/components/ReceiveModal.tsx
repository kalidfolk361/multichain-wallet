import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { NETWORKS } from '@/lib/networks';
import { copyToClipboard } from '@/lib/format';
import { X, Copy, Check, Download, ExternalLink } from 'lucide-react';

interface ReceiveModalProps {
  networkKey: string;
  address: string;
  onClose: () => void;
}

export function ReceiveModal({ networkKey, address, onClose }: ReceiveModalProps) {
  const network = NETWORKS[networkKey];
  const [copied, setCopied] = useState(false);

  if (!network) return null;

  const handleCopy = async () => {
    const ok = await copyToClipboard(address);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-[#0D0E14] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${network.logoGradient} flex items-center justify-center`}>
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Receive</h3>
              <p className="text-xs text-gray-500">{network.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl mb-4">
            <QRCodeSVG value={address} size={180} level="M" />
          </div>

          <p className="text-xs text-gray-400 text-center mb-2">
            Send only {network.currencySymbol} or USDT ({network.shortName}) to this address on the {network.name} network.
          </p>

          <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-1">Your Address</p>
            <p className="text-sm text-white font-mono break-all">{address}</p>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleCopy}
              className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl py-3 text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Address'}
            </button>
            <a
              href={`${network.explorerUrl}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl py-3 text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Explorer
            </a>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mt-4 w-full">
            <p className="text-xs text-amber-400/80 text-center leading-relaxed">
              Sending tokens from a different network may result in permanent loss of funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
