import React, { useState, useEffect } from 'react';
import { SettingsLayout } from '../../components/layout/SettingsLayout';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  security_alerts: boolean;
}

export function NotificationSettings() {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    security_alerts: true,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('notification_preferences')
          .eq('id', user.id)
          .single();
        
        if (profile?.notification_preferences) {
          setPreferences(profile.notification_preferences);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
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
          notification_preferences: preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Notification preferences updated successfully!' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage({ type: 'error', text: 'Failed to update notification preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <SettingsLayout>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Preferences</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Choose how you want to receive notifications.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <fieldset>
              <legend className="sr-only">Notification Options</legend>
              <div className="space-y-4">
                {Object.entries(preferences).map(([key, value]) => (
                  <div key={key} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={key}
                        name={key}
                        type="checkbox"
                        checked={value}
                        onChange={() => handleToggle(key as keyof NotificationPreferences)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={key} className="font-medium text-gray-700">
                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>

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
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </SettingsLayout>
  );
}