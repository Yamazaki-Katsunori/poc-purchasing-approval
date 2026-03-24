'use client';

import dynamic from 'next/dynamic';

/**
 * TODO:
 * atomWithStoreを利用して、sessionStorageに入力フォームを保持しているため、
 * SSR化せず、Cliant Only のコンポーネントとして扱う設定
 **/
const ApprovalsNewConfirm = dynamic(
  () => import('@/features/approvals/confirm/approvalsNewConfirm').then((mod) => mod.ApprovalsNewConfirm),
  { ssr: false },
);

export function ConfirmClient() {
  return <ApprovalsNewConfirm />;
}
