'use client';

type HeaderProps = {
  isAuthed: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
};

export function Header({ isAuthed, sidebarOpen, onToggleSidebar, onLogin, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-[60] border-b border-neutral-200 bg-[color:var(--color-paper)]/80 backdrop-blur">
      <div className="relative h-14">
        {/* ハンバーガー：左端寄せ */}
        {isAuthed ? (
          <button
            type="button"
            className="ui-btn ui-btn--secondary ui-btn--sm absolute left-2 top-1/2 -translate-y-1/2"
            aria-label={sidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
            aria-expanded={sidebarOpen}
            onClick={onToggleSidebar}
          >
            <span aria-hidden className="grid gap-1">
              <span className="block h-[2px] w-4 bg-neutral-800" />
              <span className="block h-[2px] w-4 bg-neutral-800" />
              <span className="block h-[2px] w-4 bg-neutral-800" />
            </span>
          </button>
        ) : null}

        {/* 中央コンテナ */}
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {/* 左：ロゴ（ハンバーガーと被らないように余白） */}
          <div className="flex items-center gap-2 pl-10">
            <div className="h-8 w-8 rounded-md bg-brand-700" aria-hidden />
            <span className="font-semibold tracking-wide">poc-purchasing-approval</span>
          </div>

          {/* 右：ログイン/ログアウト（復活） */}
          <div className="flex items-center gap-2">
            {isAuthed ? (
              <button className="ui-btn ui-btn--secondary ui-btn--sm" type="button" onClick={onLogout}>
                ログアウト
              </button>
            ) : (
              <button className="ui-btn ui-btn--primary ui-btn--sm" type="button" onClick={onLogin}>
                ログイン
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
