import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from './components/AuthForm';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { DashboardSidebar } from './components/layout/DashboardSidebar';
import { HomePage } from './pages/home';
import { CreatorDashboard } from './pages/creator/Dashboard';
import { CourierDashboard } from './pages/courier/Dashboard';
import { SenderDashboard } from './pages/sender/Dashboard';
import { AdminDashboard } from './pages/admin/Dashboard';
import { Distribution } from './pages/admin/Distribution';
import { Cards } from './pages/admin/Cards';
import { KeyManagement } from './pages/admin/KeyManagement';
import { ConsumerDashboard } from './pages/consumer/Dashboard';
import { Assets as ConsumerAssets } from './pages/consumer/Assets';
import { Referrals as ConsumerReferrals } from './pages/consumer/Referrals';
import { Earnings as ConsumerEarnings } from './pages/consumer/Earnings';
import { Purchases as ConsumerPurchases } from './pages/consumer/Purchases';
import { RetailerDashboard } from './pages/retailer/Dashboard';
import { AvailableBids } from './pages/retailer/AvailableBids';
import { MyBatches } from './pages/retailer/MyBatches';
import { ActivateCards } from './pages/retailer/ActivateCards';
import { ProfileSettings } from './pages/settings/Profile';
import { SecuritySettings } from './pages/settings/Security';
import { ContactSettings } from './pages/settings/Contact';
import { NotificationSettings } from './pages/settings/Notifications';
import { PrivacySettings } from './pages/settings/Privacy';
import { MarketplacePage } from './pages/marketplace';
import { DigitalAssetsPage } from './pages/products/digital-assets';
import { EncryptionPage } from './pages/products/encryption';
import { DistributionPage } from './pages/products/distribution';
import { CreatorsPage } from './pages/solutions/creators';
import { RetailersPage } from './pages/solutions/retailers';
import { CollectorsPage } from './pages/solutions/collectors';
import { PartnersPage } from './pages/partners';
import { PricingPage } from './pages/pricing';
import { PurchasePage } from './pages/purchase/[id]';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState<'admin' | 'creator' | 'retailer' | 'courier' | 'consumer' | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .upsert([{ 
              id: userId, 
              role: 'consumer',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select('role')
            .single();

          if (createError) throw createError;
          setUserRole(newUser.role as typeof userRole);
        } else {
          throw error;
        }
      } else if (data) {
        setUserRole(data.role as typeof userRole);
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      toast.error('Failed to load user role');
      setUserRole('consumer');
    }
  };

  return (
    <Router>
      <Toaster position="top-right" />
      {!session ? (
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/products/digital-assets" element={<DigitalAssetsPage />} />
              <Route path="/products/encryption" element={<EncryptionPage />} />
              <Route path="/products/distribution" element={<DistributionPage />} />
              <Route path="/solutions/creators" element={<CreatorsPage />} />
              <Route path="/solutions/retailers" element={<RetailersPage />} />
              <Route path="/solutions/collectors" element={<CollectorsPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/auth/*" element={<AuthForm />} />
              <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      ) : (
        <div className="min-h-screen flex flex-col md:flex-row">
          {userRole && <DashboardSidebar userRole={userRole} />}
          <div className="flex-1 flex flex-col">
            <main className="flex-1 bg-gray-100 overflow-y-auto">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/products/digital-assets" element={<DigitalAssetsPage />} />
                <Route path="/products/encryption" element={<EncryptionPage />} />
                <Route path="/products/distribution" element={<DistributionPage />} />
                <Route path="/solutions/creators" element={<CreatorsPage />} />
                <Route path="/solutions/retailers" element={<RetailersPage />} />
                <Route path="/solutions/collectors" element={<CollectorsPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/purchase/:id" element={<PurchasePage />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/distribution" element={<Distribution />} />
                <Route path="/admin/cards" element={<Cards />} />
                <Route path="/admin/key-management" element={<KeyManagement />} />

                {/* Creator Routes */}
                <Route path="/creator/*" element={<CreatorDashboard />} />

                {/* Courier Routes */}
                <Route path="/courier/*" element={<CourierDashboard />} />

                {/* Consumer Routes */}
                <Route path="/consumer" element={<Navigate to="/consumer/dashboard" replace />} />
                <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />
                <Route path="/consumer/assets" element={<ConsumerAssets />} />
                <Route path="/consumer/referrals" element={<ConsumerReferrals />} />
                <Route path="/consumer/earnings" element={<ConsumerEarnings />} />
                <Route path="/consumer/purchases" element={<ConsumerPurchases />} />

                {/* Retailer Routes */}
                <Route path="/retailer" element={<Navigate to="/retailer/dashboard" replace />} />
                <Route path="/retailer/dashboard" element={<RetailerDashboard />} />
                <Route path="/retailer/bids" element={<AvailableBids />} />
                <Route path="/retailer/batches" element={<MyBatches />} />
                <Route path="/retailer/activate" element={<ActivateCards />} />

                {/* Settings Routes */}
                <Route path="/settings/profile" element={<ProfileSettings />} />
                <Route path="/settings/security" element={<SecuritySettings />} />
                <Route path="/settings/contact" element={<ContactSettings />} />
                <Route path="/settings/notifications" element={<NotificationSettings />} />
                <Route path="/settings/privacy" element={<PrivacySettings />} />

                {/* Default Redirect */}
                <Route path="*" element={<Navigate to={`/${userRole}/dashboard`} replace />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;