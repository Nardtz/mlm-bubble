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

