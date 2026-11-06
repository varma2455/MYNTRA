import supabase from '../lib/supabase';

// Helper to assemble full user profile & role
const formatUserProfile = async (authUser) => {
  if (!authUser) return null;

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  // 2. Fetch User Roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', authUser.id);

  const roles = (userRoles || []).map((r) => r.role);
  
  // Determine canonical and primary application role
  let role = 'customer';
  if (roles.includes('ADMIN') || roles.includes('super_admin') || roles.includes('admin')) {
    role = 'super_admin';
  } else if (roles.includes('LOGISTICS_PARTNER') || roles.includes('company_staff') || roles.includes('transport_manager')) {
    if (roles.includes('transport_manager')) {
      role = 'transport_manager';
    } else {
      role = 'company_staff';
    }
  } else if (roles.includes('DELIVERY_PARTNER') || roles.includes('delivery_staff')) {
    role = 'delivery_staff';
  } else {
    role = 'customer';
  }

  // 3. Fetch Addresses
  const { data: addresses } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', authUser.id)
    .order('is_default', { ascending: false });

  const savedAddresses = (addresses || []).map((a) => ({
    _id: a.id,
    id: a.id,
    name: a.name,
    mobile: a.mobile,
    pincode: a.pincode,
    street: a.street,
    locality: a.locality || '',
    city: a.city,
    state: a.state,
    isDefault: a.is_default,
    type: a.type || 'HOME',
  }));

  return {
    _id: authUser.id,
    id: authUser.id,
    email: authUser.email,
    name: profile?.name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email.split('@')[0],
    phone: profile?.phone || authUser.user_metadata?.phone || '',
    avatarUrl: profile?.avatar_url || authUser.user_metadata?.avatar_url || '',
    status: profile?.status || 'active',
    blockReason: profile?.block_reason || '',
    role,
    roles,
    savedAddresses,
    preferredCategories: profile?.preferred_categories || [],
  };
};

export const authService = {
  async login(credentials) {
    const { email, password } = credentials;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const err = new Error(error.message);
      err.response = { data: { message: error.message } };
      throw err;
    }

    const user = await formatUserProfile(data.user);
    if (user.status === 'blocked') {
      await supabase.auth.signOut();
      const err = new Error('Your account has been restricted by platform administration.');
      err.response = { data: { message: err.message } };
      throw err;
    }

    return {
      token: data.session.access_token,
      user,
    };
  },

  async register(userData) {
    const { email, password, name, phone, role } = userData;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name?.trim(),
          phone: phone?.trim(),
          role: role || 'CUSTOMER',
        },
      },
    });

    if (error) {
      const err = new Error(error.message);
      err.response = { data: { message: error.message } };
      throw err;
    }

    // Auto sign in or format user
    let user = null;
    let token = data.session?.access_token || '';

    if (data.user) {
      user = await formatUserProfile(data.user);
    }

    return {
      token,
      user,
    };
  },

  async getProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return { user: null };
    }

    const user = await formatUserProfile(session.user);
    return { user };
  },

  async updateProfile(profileData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updatePayload = {};
    if (profileData.name) updatePayload.name = profileData.name;
    if (profileData.phone) updatePayload.phone = profileData.phone;
    if (profileData.avatarUrl) updatePayload.avatar_url = profileData.avatarUrl;
    if (profileData.preferredCategories) updatePayload.preferred_categories = profileData.preferredCategories;

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (error) throw error;

    const updated = await formatUserProfile(user);
    return { user: updated };
  },

  async addAddress(addressData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // If default, unset others first
    if (addressData.isDefault) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { error } = await supabase.from('user_addresses').insert({
      user_id: user.id,
      name: addressData.name,
      mobile: addressData.mobile,
      pincode: addressData.pincode,
      street: addressData.street,
      locality: addressData.locality || '',
      city: addressData.city,
      state: addressData.state,
      is_default: !!addressData.isDefault,
      type: addressData.type || 'HOME',
    });

    if (error) throw error;

    const updatedProfile = await formatUserProfile(user);
    return { savedAddresses: updatedProfile.savedAddresses };
  },

  async deleteAddress(addressId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', user.id);

    if (error) throw error;

    const updatedProfile = await formatUserProfile(user);
    return { savedAddresses: updatedProfile.savedAddresses };
  },

  async setDefaultAddress(addressId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);

    const { error } = await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', user.id);

    if (error) throw error;

    const updatedProfile = await formatUserProfile(user);
    return { savedAddresses: updatedProfile.savedAddresses };
  },

  async forgotPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      const err = new Error(error.message);
      err.response = { data: { message: error.message } };
      throw err;
    }
    return { success: true, message: 'Password recovery email sent.' };
  },

  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  },

  async logout() {
    await supabase.auth.signOut();
  },
};

export default authService;
