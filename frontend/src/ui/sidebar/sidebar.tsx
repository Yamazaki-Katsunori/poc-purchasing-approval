import Link from 'next/link';

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="h-full w-full bg-white p-4">
      <nav className="space-y-2">
        <Link
          href="/applications/new"
          onClick={onNavigate}
          className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          新規申請作成
        </Link>
      </nav>
    </aside>
  );
}
