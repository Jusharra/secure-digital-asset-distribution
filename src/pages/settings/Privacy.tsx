import React, { useState, useEffect } from 'react';
import { SettingsLayout } from '../../components/layout/SettingsLayout';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'contacts';
  show_activity: boolean;
  allow_messages: boolean;
  show_email: boolean;
}

export function PrivacySettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    profile_visibility: 'public',
    show_activity: true,
    allow_messages: true,
    show_email: false,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('privacy_settings')
          .eq('id', user.id)
          .single();
        
        if (profile?.privacy_settings) {
          setSettings(profile.privacy_settings);
        }
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          privacy_settings: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Privacy settings updated successfully!' });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      setMessage({ type: 'error', text: 'Failed to update privacy settings' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsLayout>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Privacy Settings</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Manage your privacy preferences and control who can see your information.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profile Visibility
              </label>
              <select
                value={settings.profile_visibility}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile_visibility: e.target.value as PrivacySettings['profile_visibility']
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="contacts">Contacts Only</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="show_activity"
                    name="show_activity"
                    type="checkbox"
                    checked={settings.show_activity}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      show_activity: e.target.checked
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="show_activity" className="font-medium text-gray-700">
                    Show Activity Status
                  </label>
                  <p className="text-gray-500">Allow others to see when you're active</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="allow_messages"
                    name="allow_messages"
                    type="checkbox"
                    checked={settings.allow_messages}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      allow_messages: e.target.checked
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="allow_messages" className="font-medium text-gray-700">
                    Allow Messages
                  </label>
                  <p className="text-gray-500">Receive messages from other users</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="show_email"
                    name="show_email"
                    type="checkbox"
                    checked={settings.show_email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      show_email: e.target.checked
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="show_email" className="font-medium text-gray-700">
                    Show Email Address
                  </label>
                  <p className="text-gray-500">Display your email address on your profile</p>
                </div>
              </div>
            </div>

            {message && (
              <div
                className={`rounded-md p-4 ${
                  message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </SettingsLayout>
  );
}