'use client';

import { Header } from '@/ui/header';
import { Sidebar } from '@/ui/sidebar';
import { useLogout } from './hooks/logout-hook';
import { useSidebar } from './hooks/useSidebar';
import { useCurrentUser } from '@/shared/hooks/auth/useCurrentUser';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle, close } = useSidebar();

  const { data: currentUser, isLoading, isError } = useCurrentUser();
  const { handleLogout } = useLogout();

  // NOTE: JWT 認証中か確認する isAuthed
  const isAuthed = !!currentUser && !isError;

  const onLogout = async () => {
    close();
    await handleLogout();
  };

  // NOTE: ログインユーザー情報表示用
  const userNameDisplay = currentUser?.name ? `ログインユーザー:${currentUser.name}` : '';
  const emailDisplay = currentUser?.email ? `メールアドレス: ${currentUser.email}` : '';
  const positionAndRoleNameDisplay =
    currentUser?.position_name && currentUser?.role_name
      ? `役職 / 権限: ${currentUser.position_name} / ${currentUser.role_name}`
      : '';

  return (
    <div className="min-h-dvh">
      <Header
        isAuthed={isAuthed}
        onToggleSidebar={toggle}
        userNameDisplay={userNameDisplay}
        emailDisplay={emailDisplay}
        positionAndRoleNameDisplay={positionAndRoleNameDisplay}
        isLoading={isLoading}
        onLogout={onLogout}
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
