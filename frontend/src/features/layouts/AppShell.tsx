'use client';

import { Header } from '@/ui/header';
import { Sidebar } from '@/ui/sidebar';
import { useLogout } from './hooks/logout-hook';
import { useSidebar } from './hooks/useSidebar';
import { useCurrentUser } from './hooks/useCurrentUser';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle, close } = useSidebar();

  const { data: currentUser, isLoading, isError } = useCurrentUser();
  const isAuthed = !!currentUser && !isError;
  const { handleLogout } = useLogout();

  return (
    <div className="min-h-dvh">
      <Header
        isAuthed={isAuthed}
        onToggleSidebar={toggle}
        userName={currentUser?.name ?? ''}
        email={currentUser?.email ?? ''}
        positionName={currentUser?.positionName ?? ''}
        roleName={currentUser?.roleName ?? ''}
        isLoading={isLoading}
        onLogout={handleLogout}
      />

      {/* ✅ Main は常に中央 */}
      <main className="px-4 py-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className="ui-card">
            <div className="ui-card-content">{children}</div>
          </div>
        </div>
      </main>

      {/* ✅ Sidebar は fixed drawer（画面左端） */}
      {isAuthed ? <Sidebar isOpen={isOpen} onClose={close} /> : null}
    </div>
  );
}
