import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { AuthScreen } from '@/components/AuthScreen';
import { MainLayout } from '@/components/MainLayout';
import { Dashboard } from '@/components/Dashboard';
import { TransactionHistory } from '@/components/TransactionHistory';
import { NFTGallery } from '@/components/NFTGallery';
import { Loader2 } from 'lucide-react';

type Page = 'dashboard' | 'transactions' | 'nfts';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0B0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <WalletProvider>
      <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'transactions' && <TransactionHistory />}
        {currentPage === 'nfts' && <NFTGallery />}
      </MainLayout>
    </WalletProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
