import { SupabaseClient } from '@supabase/supabase-js';

// Initialize root member for a new user (using username)
// Accepts a server-side Supabase client to bypass RLS with proper auth context
export async function initializeUserMLM(userId: string, supabase: SupabaseClient) {
  // Check if user already has a root member (level 0)
  const { data: existingMe, error: checkError } = await supabase
    .from('members')
    .select('id, name')
    .eq('user_id', userId)
    .eq('level', 0)
    .maybeSingle();

  // If root member already exists, return it (but update name if username changed or if it's still "ME")
  if (existingMe && !checkError) {
    // Try to get username and update if it changed or if name is still "ME"
    let shouldUpdate = existingMe.name === 'ME';
    let newName = existingMe.name;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      
      if (profile?.username) {
        if (existingMe.name !== profile.username) {
          shouldUpdate = true;
          newName = profile.username;
        }
      }
    } catch (err) {
      // Profile might not exist, that's okay
      console.log('Could not fetch profile:', err);
    }
    
    // Update if needed (e.g., name is "ME" or username changed)
    if (shouldUpdate && newName !== existingMe.name) {
      const { error: updateError } = await supabase
        .from('members')
        .update({ name: newName })
        .eq('id', existingMe.id);
      
      if (!updateError) {
        existingMe.name = newName;
      }
    }
    
    return { success: true, message: 'User already initialized', data: existingMe };
  }

  // Get username from profiles table
  let username = 'User';
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
    
    if (!profileError && profile?.username) {
      username = profile.username;
    }
  } catch (err) {
    // If we can't get username, use default
    console.log('Could not fetch username, using default:', err);
  }

  // Create the root member for this user with unique ID
  const meId = `me-${userId}`;
  const { data, error } = await supabase
    .from('members')
    .insert({
      id: meId,
      name: username,
      starting_capital: 0,
      level: 0,
      parent_id: null,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error initializing user MLM:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

