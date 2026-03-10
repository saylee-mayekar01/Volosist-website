import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, MailCheck, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '../ui/button';
import {
  acceptTeamAccessInvite,
  getTeamAccessInviteDetails,
  TeamAccessMemberRecord,
} from '../../lib/team-access';

interface TeamInviteAcceptPageProps {
  user: any;
}

export function TeamInviteAcceptPage({ user }: TeamInviteAcceptPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = String(searchParams.get('token') || '').trim();

  const [invite, setInvite] = useState<TeamAccessMemberRecord | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentUserId = String(user?.id || '').trim();
  const currentUserEmail = String(user?.email || '').trim().toLowerCase();

  const memberName = useMemo(() => {
    const metadata = user?.user_metadata || {};
    const fullName = String(metadata.full_name || '').trim();
    const firstName = String(metadata.first_name || '').trim();
    const lastName = String(metadata.last_name || '').trim();
    return fullName || `${firstName} ${lastName}`.trim() || currentUserEmail.split('@')[0] || 'User';
  }, [currentUserEmail, user?.user_metadata]);

  const isEmailMatched =
    !!invite &&
    !!currentUserEmail &&
    currentUserEmail === String(invite.memberEmail || '').trim().toLowerCase();

  const canAccept = !!invite && invite.status === 'pending' && isEmailMatched;

  useEffect(() => {
    if (!token) {
      setInvite(null);
      setErrorMessage('Invalid invitation link. Missing invite token.');
      return;
    }

    let cancelled = false;
    setLoadingInvite(true);
    setErrorMessage('');

    getTeamAccessInviteDetails(token)
      .then((data) => {
        if (cancelled) return;
        setInvite(data.invitation || null);
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'This invitation is no longer valid. Ask the owner to send a new invite.'
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingInvite(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleGoToSignIn = () => {
    const redirect = `${location.pathname}${location.search}`;
    navigate(`/signin?redirect=${encodeURIComponent(redirect)}`);
  };

  const handleAcceptInvite = async () => {
    if (!invite || !token) return;

    if (!currentUserId || !currentUserEmail) {
      setErrorMessage('Please sign in with the invited email account to continue.');
      return;
    }

    if (!isEmailMatched) {
      setErrorMessage(
        `This invite was sent to ${invite.memberEmail}. Sign in with that account to accept access.`
      );
      return;
    }

    if (invite.status !== 'pending') {
      setErrorMessage('This invitation is not in pending state and cannot be accepted again.');
      return;
    }

    setAccepting(true);
    setErrorMessage('');

    try {
      const result = await acceptTeamAccessInvite(token, {
        memberUserId: currentUserId,
        memberEmail: currentUserEmail,
        memberName,
      });

      setInvite(result.invitation || invite);
      setAccepted(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to accept invitation right now.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-black text-slate-900">Team Access Invitation</h1>
          <p className="mt-1 text-sm text-slate-500">
            Accept this invitation to collaborate on dashboard services and team operations.
          </p>

          {loadingInvite && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <Loader2 size={16} className="animate-spin" />
              Validating invitation details...
            </div>
          )}

          {errorMessage && !loadingInvite && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {!loadingInvite && invite && (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">Owner:</span> {invite.ownerName} ({invite.ownerEmail})
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">Invited user:</span> {invite.memberName} ({invite.memberEmail})
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">Role:</span> {invite.role}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">Status:</span> {invite.status}
                </p>
              </div>

              {!currentUserId || !currentUserEmail ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  <div className="flex items-start gap-2">
                    <MailCheck size={16} className="mt-0.5 shrink-0" />
                    <p>Sign in with the invited email account to accept this access.</p>
                  </div>
                  <Button className="mt-3" onClick={handleGoToSignIn}>Sign In to Continue</Button>
                </div>
              ) : accepted || invite.status === 'active' ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    <p>Access granted successfully. You can now collaborate using team access features.</p>
                  </div>
                  <Button className="mt-3 gap-2" onClick={() => navigate('/dashboard')}>
                    <UserCheck size={16} /> Open Dashboard
                  </Button>
                </div>
              ) : invite.status === 'revoked' || invite.status === 'expired' ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  This invitation is {invite.status}. Ask the owner to send a new invite.
                </div>
              ) : (
                <>
                  {!isEmailMatched && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                      This invitation is addressed to <strong>{invite.memberEmail}</strong>. You are signed in as <strong>{currentUserEmail}</strong>.
                    </div>
                  )}

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                    <div className="flex items-start gap-2">
                      <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                      <p>
                        By accepting, you join this owner's team workspace with role <strong>{invite.role}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleAcceptInvite}
                      disabled={!canAccept}
                      loading={accepting}
                    >
                      Accept Invitation
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {!loadingInvite && !invite && !errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>Unable to load invitation details. Please ask the owner to re-send the invite.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
