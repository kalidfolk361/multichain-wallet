import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { AuthScreen } from '@/components/AuthScreen';
import { MainLayout, type Tab } from '@/components/MainLayout';
import { HomePage } from '@/components/home/HomePage';
import { DiscoverPage } from '@/components/discover/DiscoverPage';
import { CreatePage } from '@/components/create/CreatePage';
import { Dashboard } from '@/components/Dashboard';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { NotificationsModal } from '@/components/NotificationsModal';
import { SettingsModal } from '@/components/SettingsModal';
import { NFTDetailModal } from '@/components/NFTDetailModal';
import { P2PPage } from '@/components/p2p/P2PPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [viewingNftId, setViewingNftId] = useState<string | null>(null);
  const [showP2P, setShowP2P] = useState(false);

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

  const handleOpenProfile = (userId: string) => {
    setViewingProfileId(userId);
    setActiveTab('profile');
  };

  const handleOpenNftDetail = (nftId: string) => {
    setViewingNftId(nftId);
  };

  return (
    <WalletProvider>
      <ProfileProvider>
        <MainLayout
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setViewingProfileId(null);
          }}
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenProfile={handleOpenProfile}
          onOpenNftDetail={handleOpenNftDetail}
          onOpenP2P={() => setShowP2P(true)}
        >
          {activeTab === 'home' && (
            <HomePage onOpenProfile={handleOpenProfile} onOpenNftDetail={handleOpenNftDetail} />
          )}
          {activeTab === 'discover' && (
            <DiscoverPage onOpenProfile={handleOpenProfile} onOpenNftDetail={handleOpenNftDetail} onOpenP2P={() => setShowP2P(true)} />
          )}
          {activeTab === 'create' && <CreatePage onPosted={() => setActiveTab('home')} />}
          {activeTab === 'wallet' && <Dashboard />}
          {activeTab === 'profile' && (
            <ProfilePage
              userId={viewingProfileId ?? user.id}
              isOwn={viewingProfileId === null || viewingProfileId === user.id}
              onOpenNftDetail={handleOpenNftDetail}
              onEditProfile={() => setShowSettings(true)}
            />
          )}
        </MainLayout>

        {showNotifications && (
          <NotificationsModal onClose={() => setShowNotifications(false)} onOpenProfile={handleOpenProfile} />
        )}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {viewingNftId && (
          <NFTDetailModal nftId={viewingNftId} onClose={() => setViewingNftId(null)} onOpenProfile={handleOpenProfile} />
        )}
        {showP2P && <P2PPage onClose={() => setShowP2P(false)} />}
      </ProfileProvider>
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
