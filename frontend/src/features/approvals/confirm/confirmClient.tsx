'use client';

import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { useAtomValue } from 'jotai';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
  const router = useRouter();
  const formData = useAtomValue(approvalCreateAtom);

  {
    /**
     * NOTE:
     * 直接urlで確認画面にアクセスした際にformDataがnullの場合、
     * 新規申請入力画面にリダイレクトさせるため宣言
     **/
  }
  useEffect(() => {
    if (formData !== null) return;

    router.replace('/approvals/new?error=missing-form-data');
  }, [formData, router]);

  return <ApprovalsNewConfirm />;
}
