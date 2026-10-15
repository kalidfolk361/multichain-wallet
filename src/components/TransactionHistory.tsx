import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { NETWORKS } from '@/lib/networks';
import { formatBalance, shortenAddress, timeAgo } from '@/lib/format';
import { ArrowDownLeft, ArrowUpRight, Loader2, ExternalLink, Search, Filter } from 'lucide-react';

interface Transaction {
  id: string;
  network_key: string;
  tx_hash: string;
  tx_type: string;
  token_symbol: string;
  token_type: string;
  amount: string;
  counterparty_address: string;
  status: string;
  created_at: string;
  confirmed_at: string | null;
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'send' | 'receive'>('all');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('tx_type', filter);
    if (networkFilter !== 'all') query = query.eq('network_key', networkFilter);
    const { data, error } = await query.limit(100);
    if (error) {
      setTransactions([]);
    } else {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
  }, [filter, networkFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = transactions.filter((tx) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      tx.tx_hash.toLowerCase().includes(q) ||
      tx.counterparty_address.toLowerCase().includes(q) ||
      tx.token_symbol.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Transactions</h2>
        <p className="text-sm text-gray-400">Your send and receive history across all networks</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by address, hash, or token..."
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'send', 'receive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                filter === f ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
          <select
            value={networkFilter}
            onChange={(e) => setNetworkFilter(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Networks</option>
            {Object.values(NETWORKS).map((n) => (
              <option key={n.key} value={n.key}>{n.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-sm text-gray-400">No transactions found</p>
          <p className="text-xs text-gray-600 mt-1">Transactions will appear here after you send or receive crypto</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => {
            const network = NETWORKS[tx.network_key];
            const isSend = tx.tx_type === 'send';
            return (
              <div
                key={tx.id}
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSend ? 'bg-orange-500/10' : 'bg-green-500/10'
                  }`}>
                    {isSend ? (
                      <ArrowUpRight className="w-5 h-5 text-orange-400" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white capitalize">{tx.tx_type}</p>
                      <span className="text-xs text-gray-500">{tx.token_symbol}</span>
                      {network && (
                        <span className="text-xs text-gray-600 bg-white/[0.03] px-1.5 py-0.5 rounded">
                          {network.shortName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isSend ? 'To' : 'From'} {shortenAddress(tx.counterparty_address, 5)}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{timeAgo(tx.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${isSend ? 'text-orange-400' : 'text-green-400'}`}>
                      {isSend ? '-' : '+'}{formatBalance(tx.amount)} {tx.token_symbol}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 justify-end">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        tx.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                        tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                  {network && (
                    <a
                      href={`${network.explorerUrl}/tx/${tx.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-white flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
