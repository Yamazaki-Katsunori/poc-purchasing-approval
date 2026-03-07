// features/layouts/AppShell.tsx（要点だけ）
'use client';

import { useCallback, useState } from 'react';
import { Header } from '@/ui/header';
import { Sidebar } from '@/ui/sidebar';
import { useLogout } from './hooks/logout-hook';

export default function AppShell({ children, isAuthed }: { children: React.ReactNode; isAuthed: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const effectiveSidebarOpen = isAuthed && sidebarOpen;

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const { handleLogout } = useLogout();

  return (
    <div className="min-h-dvh">
      <Header
        isAuthed={isAuthed}
        sidebarOpen={effectiveSidebarOpen}
        onToggleSidebar={toggleSidebar}
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
      {isAuthed && effectiveSidebarOpen ? (
        <aside className="fixed left-0 bottom-0 top-14 z-50 w-72 border-r-2 border-neutral-300 bg-[color:var(--color-paper)]">
          <Sidebar onNavigate={closeSidebar} />
        </aside>
      ) : null}
    </div>
  );
}
