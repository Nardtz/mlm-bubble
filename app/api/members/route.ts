import { NextResponse } from 'next/server';
import { addMember, deleteMember, updateMemberParent } from '@/lib/supabase-queries';
import { createClient } from '@/lib/supabase-server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getUserId() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    // Fallback to getSession
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      throw new Error('Unauthorized');
    }
    return { userId: session.user.id, supabase };
  }
  
  return { userId: user.id, supabase };
}

export async function POST(request: Request) {
  try {
    const { userId, supabase } = await getUserId();
    const body = await request.json();
    let { id, name, startingCapital, level, parentId } = body;

    if (!id || !name || startingCapital === undefined || level === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If level 1 and parentId is null, find the user's ME member
    if (level === 1 && !parentId) {
      const { data: meMember } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', userId)
        .eq('level', 0)
        .single();
      
      if (meMember) {
        parentId = meMember.id;
      } else {
        return NextResponse.json(
          { success: false, error: 'ME member not found. Please refresh the page.' },
          { status: 400 }
        );
      }
    }

    const member = await addMember(id, name, startingCapital, level, parentId, userId, supabase);
    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    console.error('Error adding member:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Please sign in to add members' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add member' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, supabase } = await getUserId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    await deleteMember(id, userId, supabase);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting member:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Please sign in to delete members' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete member' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, supabase } = await getUserId();
    const body = await request.json();
    const { id, parentId } = body;

    if (!id || parentId === undefined) {
      return NextResponse.json(
        { success: false, error: 'Member ID and parent ID are required' },
        { status: 400 }
      );
    }

    const member = await updateMemberParent(id, parentId, userId, supabase);
    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    console.error('Error updating member:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Please sign in to update members' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update member' },
      { status: 500 }
    );
  }
}

