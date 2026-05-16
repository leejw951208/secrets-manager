'use client';
// 상태 머신 컨테이너. setup-required / locked / unlocked 분기와 idle 카운트다운을 관리한다.
import { useCallback, useEffect, useState } from 'react';
import { getStatus, lockVault, type VaultStatus } from '@/lib/vault-client';
import { UnlockScreen } from './UnlockScreen';
import { EntriesScreen } from './EntriesScreen';

export function VaultView() {
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await getStatus();
      setStatus(next);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // unlocked 상태일 때 1초 간격으로 idle 카운트다운을 갱신한다.
  useEffect(() => {
    if (status?.state !== 'unlocked') return;
    const id = setInterval(() => {
      setStatus((prev) => {
        if (!prev || prev.state !== 'unlocked' || typeof prev.idleSecondsRemaining !== 'number') return prev;
        const remaining = prev.idleSecondsRemaining - 1;
        if (remaining <= 0) {
          void refresh();
          return prev;
        }
        return { ...prev, idleSecondsRemaining: remaining };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [status?.state, refresh]);

  const handleLock = useCallback(async () => {
    try {
      await lockVault();
    } finally {
      await refresh();
    }
  }, [refresh]);

  if (status === null) {
    return (
      <section>
        <h1>비밀번호 보관함</h1>
        {error && <div className="error-box">{error}</div>}
        {!error && <p className="muted">상태를 확인하고 있습니다...</p>}
      </section>
    );
  }

  if (status.state === 'setup-required' || status.state === 'locked') {
    return (
      <UnlockScreen
        mode={status.state === 'setup-required' ? 'setup' : 'unlock'}
        onSuccess={refresh}
      />
    );
  }

  return (
    <EntriesScreen
      onLock={handleLock}
      onStatusRefresh={refresh}
      idleSecondsRemaining={status.idleSecondsRemaining}
    />
  );
}
