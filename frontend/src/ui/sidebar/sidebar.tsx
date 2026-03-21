import Link from 'next/link';

// NOTE:
// サイドバーアイテム
type SidebarItem = {
  label: string;
  href: string;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'ホーム', href: '/' },
  { label: '新規申請作成', href: '/approvals/new' },
];

type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 bottom-0 top-18 z-50 w-72 border-r-2 border-neutral-300 bg-paper">
      {/* サイドバー本体 */}
      <div className="fixed left-0 top-18 z-50 h-[calc(100dvh-3.5rem)] w-72 border-r-2 border-neutral-300 bg-paper">
        <div className="flex items-center justify-between border-b-2 border-neutral-300 px-3 py-4">
          <span className="font-semibold">メニュー</span>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {SIDEBAR_ITEMS.map((item: SidebarItem) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-neutral-200"
                onClick={onClose}
              >
                {item.label}
              </Link>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
