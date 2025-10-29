import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, Loader2, User } from 'lucide-react';
import { SettingsLayout } from '../../components/layout/SettingsLayout';

export function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      setUser(user);
      setEmail(user.email || '');

      // Attempt to fetch or create the profile using upsert
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .upsert({ 
          id: user.id,
          full_name: '',
          phone: '',
          avatar_url: null
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) throw error;
      
      if (profile) {
        setProfileData(profile);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to load profile: ${error.message || 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  }

  // Helper function to set profile data
  function setProfileData(profile: any) {
    setFullName(profile.full_name || '');
    setPhone(profile.phone || '');
    setAvatar(profile.avatar_url);
  }

  async function updateProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const updates = {
        id: user.id,
        full_name: fullName,
        phone,
        avatar_url: avatar,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(updates);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: `Error updating profile: ${error.message || 'Please try again'}`
      });
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatar(publicUrl);
      setMessage({ type: 'success', text: 'Avatar updated successfully!' });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setMessage({ 
        type: 'error', 
        text: `Error uploading avatar: ${error.message || 'Please try again'}`
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SettingsLayout>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-8">
            {/* Avatar Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
              <div className="mt-2 flex items-center space-x-5">
                <div className="relative">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg cursor-pointer"
                  >
                    <Camera className="h-4 w-4 text-gray-500" />
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={uploadAvatar}
                      disabled={loading}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => setAvatar(null)}
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  disabled
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
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
                type="button"
                onClick={updateProfile}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}