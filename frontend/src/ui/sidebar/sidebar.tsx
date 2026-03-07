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
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="h-full w-full bg-[color:var(--color-paper)] p-4">
      <nav className="flex h-full flex-col gap-2 pt-8 text-center">
        {SIDEBAR_ITEMS.map((item: SidebarItem) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-neutral-200"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
