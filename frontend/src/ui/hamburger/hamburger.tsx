type HamburgerProps = {
  className?: string;
  label?: string;
};

export function Hamburger({ className, label = 'メニュー' }: HamburgerProps) {
  return (
    <span aria-hidden className={['inline-grid gap-1', className].filter(Boolean).join(' ')}>
      <span className="block h-[2px] w-4 bg-neutral-800" />
      <span className="block h-[2px] w-4 bg-neutral-800" />
      <span className="block h-[2px] w-4 bg-neutral-800" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
