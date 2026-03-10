export type TeamAccessRole = 'Admin' | 'Editor' | 'Viewer';

export type TeamAccessStatus = 'pending' | 'active' | 'revoked' | 'expired';

export interface TeamAccessMemberRecord {
  id: string;
  ownerUserId: string;
  ownerEmail: string;
  ownerName: string;
  memberEmail: string;
  memberName: string;
  role: TeamAccessRole;
  status: TeamAccessStatus;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
  memberUserId?: string;
}

export interface CreateTeamInvitePayload {
  ownerUserId: string;
  ownerEmail: string;
  ownerName: string;
  memberEmail: string;
  memberName: string;
  role: TeamAccessRole;
}

export interface CreateTeamInviteResponse {
  invitation: TeamAccessMemberRecord;
  acceptUrl: string;
  delivery: 'sent' | 'preview';
}

export interface TeamInviteDetailsResponse {
  invitation: TeamAccessMemberRecord;
  acceptUrl: string;
}

export interface AcceptTeamInvitePayload {
  memberUserId: string;
  memberEmail: string;
  memberName: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const readApiError = async (res: Response) => {
  const fallback = 'Request failed. Please try again.';

  try {
    const data = await res.json();
    if (data?.message) return String(data.message);
    return fallback;
  } catch {
    return fallback;
  }
};

export async function createTeamAccessInvite(payload: CreateTeamInvitePayload): Promise<CreateTeamInviteResponse> {
  const res = await fetch(`${API_BASE}/team-access/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await readApiError(res));
  }

  return res.json();
}

export async function listTeamAccessMembers(ownerUserId: string, ownerEmail?: string): Promise<TeamAccessMemberRecord[]> {
  const safeOwnerUserId = String(ownerUserId || '').trim();
  if (!safeOwnerUserId) return [];

  const params = new URLSearchParams();
  if (ownerEmail) {
    params.set('ownerEmail', String(ownerEmail || '').trim().toLowerCase());
  }

  const query = params.toString();
  const endpoint = `${API_BASE}/team-access/members/${encodeURIComponent(safeOwnerUserId)}${query ? `?${query}` : ''}`;

  const res = await fetch(endpoint, { credentials: 'include' });

  if (!res.ok) {
    throw new Error(await readApiError(res));
  }

  const data = await res.json();
  return Array.isArray(data?.members) ? data.members : [];
}

export async function getTeamAccessInviteDetails(token: string): Promise<TeamInviteDetailsResponse> {
  const safeToken = String(token || '').trim();
  if (!safeToken) {
    throw new Error('Missing invite token.');
  }

  const res = await fetch(`${API_BASE}/team-access/invite/${encodeURIComponent(safeToken)}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await readApiError(res));
  }

  return res.json();
}

export async function acceptTeamAccessInvite(token: string, payload: AcceptTeamInvitePayload): Promise<TeamInviteDetailsResponse> {
  const safeToken = String(token || '').trim();
  if (!safeToken) {
    throw new Error('Missing invite token.');
  }

  const res = await fetch(`${API_BASE}/team-access/invite/${encodeURIComponent(safeToken)}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await readApiError(res));
  }

  return res.json();
}

export async function updateTeamAccessMemberRole(
  invitationId: string,
  payload: { ownerUserId: string; ownerEmail?: string; role: TeamAccessRole }
): Promise<TeamAccessMemberRecord> {
  const safeInvitationId = String(invitationId || '').trim();
  if (!safeInvitationId) {
    throw new Error('Missing invitation id.');
  }

  const res = await fetch(`${API_BASE}/team-access/members/${encodeURIComponent(safeInvitationId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await readApiError(res));
  }

  const data = await res.json();
  return data?.member as TeamAccessMemberRecord;
}

export async function revokeTeamAccessMember(
  invitationId: string,
  payload: { ownerUserId: string; ownerEmail?: string }
): Promise<{ success: true; invitationId: string }> {
  const safeInvitationId = String(invitationId || '').trim();
  if (!safeInvitationId) {
    throw new Error('Missing invitation id.');
  }

  const res = await fetch(`${API_BASE}/team-access/members/${encodeURIComponent(safeInvitationId)}/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await readApiError(res));
  }

  return res.json();
}
