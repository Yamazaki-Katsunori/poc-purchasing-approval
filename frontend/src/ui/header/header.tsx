import { Hamburger } from '@/ui/hamburger';
import { Button } from '@/ui/button';

type HeaderProps = {
  isAuthed: boolean;
  onToggleSidebar: () => void;
  userNameDisplay?: string;
  emailDisplay?: string;
  positionAndRoleNameDisplay?: string;
  isLoading?: boolean;
  onLogout?: () => void;
};

export function Header({
  isAuthed,
  onToggleSidebar,
  userNameDisplay,
  emailDisplay,
  positionAndRoleNameDisplay,
  isLoading,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-60 border-b-2 border-neutral-300 bg-paper/80 backdrop-blur">
      <div className="relative h-14">
        {/* ハンバーガー：左端寄せ */}
        {isAuthed && (
          <Button
            type="button"
            className="ui-btn ui-btn--secondary ui-btn--sm absolute left-2 top-1/2 -translate-y-1/2"
            onClick={onToggleSidebar}
          >
            <Hamburger />
          </Button>
        )}

        {/* 中央コンテナ */}
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-8">
          {/* 左：ロゴ（ハンバーガーと被らないように余白） */}
          <div className="flex items-center gap-2 pl-10">
            <div className="h-8 w-8 rounded-md bg-brand-700" aria-hidden />
            <span className="font-semibold tracking-wide">poc-purchasing-approval</span>
          </div>

          {/* 右：ログインユーザー情報 ログアウトボタン */}
          <div className="flex items-center gap-2">
            {isAuthed && !isLoading && (
              <div className="text-sm text-right">
                <div className="font-semibold">{userNameDisplay}</div>
                <div>{emailDisplay}</div>
                <div>{positionAndRoleNameDisplay}</div>
              </div>
            )}

            {isAuthed && (
              <button className="ui-btn ui-btn--secondary ui-btn--sm" type="button" onClick={onLogout}>
                ログアウト
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
