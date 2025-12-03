import { SupabaseClient } from '@supabase/supabase-js';
import { MLMData, DownlineMember } from '@/types/mlm';

// Fetch all members from database for a specific user
export async function getAllMembers(userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', userId)
    .order('level', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    throw error;
  }

  return data || [];
}

// Transform database data to MLMData format
export function transformToMLMData(members: any[]): MLMData {
  // Find ME (level 0) - can be id='me' or any level 0 member
  const me = members.find(m => m.level === 0);
  if (!me) {
    // Return empty structure if ME doesn't exist yet
    return {
      me: {
        id: undefined,
        name: 'ME',
        startingCapital: 0,
      },
      firstLevel: [],
      secondLevel: {},
      thirdLevel: {},
    };
  }

  // Get first level members (parent_id matches ME's id)
  const firstLevel = members
    .filter(m => m.level === 1 && m.parent_id === me.id)
    .map(m => ({
      id: m.id,
      name: m.name,
      startingCapital: parseFloat(m.starting_capital),
      level: m.level,
    }));

  // Get second level members grouped by parent
  const secondLevel: Record<string, DownlineMember[]> = {};
  firstLevel.forEach(firstLevelMember => {
    const children = members
      .filter(m => m.level === 2 && m.parent_id === firstLevelMember.id)
      .map(m => ({
        id: m.id,
        name: m.name,
        startingCapital: parseFloat(m.starting_capital),
        level: m.level,
      }));
    if (children.length > 0) {
      secondLevel[firstLevelMember.id] = children;
    }
  });

  // Get third level members grouped by parent
  const thirdLevel: Record<string, DownlineMember[]> = {};
  Object.values(secondLevel).flat().forEach(secondLevelMember => {
    const children = members
      .filter(m => m.level === 3 && m.parent_id === secondLevelMember.id)
      .map(m => ({
        id: m.id,
        name: m.name,
        startingCapital: parseFloat(m.starting_capital),
        level: m.level,
      }));
    if (children.length > 0) {
      thirdLevel[secondLevelMember.id] = children;
    }
  });

    return {
      me: {
        id: me.id, // Include ME member ID
        name: me.name,
        startingCapital: parseFloat(me.starting_capital),
      },
      firstLevel,
      secondLevel,
      thirdLevel,
    };
}

// Fetch MLM data in the correct format for a specific user
export async function getMLMData(userId: string, supabase: SupabaseClient): Promise<MLMData> {
  const members = await getAllMembers(userId, supabase);
  return transformToMLMData(members);
}

// Add a new member
export async function addMember(
  id: string,
  name: string,
  startingCapital: number,
  level: number,
  parentId: string | null,
  userId: string,
  supabase: SupabaseClient
) {
  // Verify parent exists if parentId is provided
  if (parentId) {
    const { data: parent, error: parentError } = await supabase
      .from('members')
      .select('id')
      .eq('id', parentId)
      .eq('user_id', userId)
      .single();

    if (parentError || !parent) {
      console.error('Parent check error:', parentError);
      throw new Error(`Parent with ID "${parentId}" does not exist. Please ensure the parent member exists before adding a downline.`);
    }
  }

  const { data, error } = await supabase
    .from('members')
    .insert({
      id,
      name,
      starting_capital: startingCapital,
      level,
      parent_id: parentId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding member:', error);
    if (error.code === '23503') { // Foreign key violation
      throw new Error(`Parent member does not exist. Please ensure the parent member exists in the database.`);
    }
    throw error;
  }

  return data;
}

// Delete a member (cascade will handle children)
export async function deleteMember(id: string, userId: string, supabase: SupabaseClient) {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
}

// Update member's parent (reassign)
export async function updateMemberParent(id: string, newParentId: string | null, userId: string, supabase: SupabaseClient) {
  // Verify new parent exists and belongs to user
  if (newParentId) {
    const { data: parent, error: parentError } = await supabase
      .from('members')
      .select('id')
      .eq('id', newParentId)
      .eq('user_id', userId)
      .single();

    if (parentError || !parent) {
      throw new Error(`New parent with ID "${newParentId}" does not exist.`);
    }
  }

  const { data, error } = await supabase
    .from('members')
    .update({ parent_id: newParentId })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating member parent:', error);
    throw error;
  }

  return data;
}

// Get children count for a member
export async function getChildrenCount(parentId: string, userId: string, supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', parentId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error getting children count:', error);
    return 0;
  }

  return count || 0;
}

// Check if user is super admin
export async function isSuperAdmin(userId: string, supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error checking super admin status:', error);
    return false;
  }

  return data.is_super_admin === true;
}

// Get all users (for super admin)
export async function getAllUsers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email')
    .order('username', { ascending: true });

  if (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }

  return data || [];
}

// Get all members from all users (for super admin)
export async function getAllMembersForSuperAdmin(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('user_id', { ascending: true })
    .order('level', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching all members for super admin:', error);
    throw error;
  }

  return data || [];
}

// Get user info for super admin view
export async function getUserInfoForSuperAdmin(userIds: string[], supabase: SupabaseClient) {
  const userInfo: Record<string, { username: string; email: string }> = {};
  
  // First, try to get profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, email')
    .in('id', userIds);

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
  } else if (profiles) {
    profiles.forEach(profile => {
      userInfo[profile.id] = {
        username: profile.username || 'Unknown',
        email: profile.email || '',
      };
    });
  }

  // Find users without profiles and get their emails from auth.users
  const missingUserIds = userIds.filter(id => !userInfo[id]);
  
  if (missingUserIds.length > 0) {
    try {
      // Call the database function to get emails from auth.users
      const { data: authEmails, error: authError } = await supabase
        .rpc('get_user_emails', { user_ids: missingUserIds });

      if (authError) {
        console.error('Error fetching emails from auth.users:', authError);
      } else if (authEmails) {
        authEmails.forEach((item: { user_id: string; email: string | null }) => {
          if (item.email) {
            userInfo[item.user_id] = {
              username: item.email.split('@')[0] || 'User',
              email: item.email,
            };
          }
        });
      }
    } catch (err) {
      console.error('Error calling get_user_emails function:', err);
    }
  }

  return userInfo;
}

// Transform all users' MLM data for super admin view
export async function transformAllUsersMLMData(members: any[], supabase: SupabaseClient): Promise<Record<string, { userInfo: { username: string; email: string }; mlmData: MLMData }>> {
  const usersData: Record<string, { userInfo: { username: string; email: string }; mlmData: MLMData }> = {};

  // Group members by user_id
  const membersByUser: Record<string, any[]> = {};
  members.forEach(member => {
    const userId = member.user_id;
    if (!membersByUser[userId]) {
      membersByUser[userId] = [];
    }
    membersByUser[userId].push(member);
  });

  // Get user info for all users
  const userIds = Object.keys(membersByUser);
  const userInfo = await getUserInfoForSuperAdmin(userIds, supabase);

  // Transform each user's data
  Object.keys(membersByUser).forEach(userId => {
    const info = userInfo[userId];
    
    // Prioritize email address - use it as the display name
    const email = info?.email || '';
    const username = info?.username || email.split('@')[0] || '';
    
    // If we have email, use it; otherwise fallback to username or userId
    usersData[userId] = {
      userInfo: info || { 
        username: email ? email.split('@')[0] : `User ${userId.substring(0, 8)}...`, 
        email: email || '' 
      },
      mlmData: transformToMLMData(membersByUser[userId]),
    };
  });

  return usersData;
}

