'use client';

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input, Select, Textarea } from '@/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import {
  CreateApprovalRequestSchema,
  CreateApprovalRequestTypes,
} from '@/features/approvals/schemas/approvals-new-schema';
import { formatNumberWithComma, normalizeNumberInput } from '@/shared/numberInputs/numberInput';
import { useEffect, useState } from 'react';
import { useApprovalCreateAction } from '@/features/approvals/new/hooks/use-approval-create-action';
import { useAtomValue } from 'jotai';
import { approvalCreateAtom } from '@/store/approvals/approval-create-atom';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function ApprovalsNewForm() {
  const draft = useAtomValue(approvalCreateAtom);

  {
    /** NOTE: formDataがnullのまま確認画面にアクセスした場合にリダイレクトされた時のEffect **/
  }
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');

    if (error !== 'missing-form-data') return;

    toast.error('入力項目を入力してください', {
      id: 'missing-form-data',
    });

    router.replace(`/approvals/new`);
  }, [searchParams, router]);

  const {
    register,
    control,
    formState: { errors, isSubmitted },
    handleSubmit,
    setValue,
  } = useForm<CreateApprovalRequestTypes>({
    resolver: zodResolver(CreateApprovalRequestSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      title: draft?.title ?? '',
      purchase_type: draft?.purchase_type ?? '',
      amount: draft?.amount ?? '',
      reason: draft?.reason ?? '',
    },
  });

  const { onSubmit, onCancel, isPending, error } = useApprovalCreateAction();

  const [isAmountFocused, setIsAmountFocused] = useState(false);

  const amount = useWatch({
    control,
    name: 'amount',
  });

  const amountRegister = register('amount');

  const displayAmount = isAmountFocused ? amount : formatNumberWithComma(amount);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>購買新規申請フォーム</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="p-2">
            <label htmlFor="title">タイトル:</label>
            <span className="text-red-500 pl-2">{isSubmitted && errors.title && errors.title.message}</span>
            <Input id="title" type="text" placeholder="申請タイトルを入力してください" {...register('title')} />
          </div>

          <div className="p-2">
            <label htmlFor="purchase_type">購買種別:</label>
            <Select
              id="purchase_type"
              defaultValue=""
              error={errors.purchase_type && '選択してください'}
              options={[
                { value: 'goods', label: '物品' },
                { value: 'service', label: 'サービス' },
                { value: 'equipment', label: '備品' },
              ]}
              {...register('purchase_type')}
            />
          </div>

          <div className="p-2">
            <label htmlFor="amount">購入金額:</label>
            <span className="text-red-500 pl-2">{isSubmitted && errors.amount && errors.amount.message}</span>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              placeholder="購入金額を入力してください"
              name={amountRegister.name}
              value={displayAmount}
              onChange={(e) => {
                const normalized = normalizeNumberInput(e.target.value);
                console.log(normalized);
                setValue('amount', normalized, { shouldValidate: true });
              }}
              onFocus={() => {
                setIsAmountFocused(true);
              }}
              onBlur={(e) => {
                setIsAmountFocused(false);
                amountRegister.onBlur(e);
              }}
            />
          </div>

          <div className="p-2">
            <label htmlFor="reason">申請理由:</label>
            <span className="text-red-500 pl-2">{isSubmitted && errors.reason && errors.reason.message}</span>
            <Textarea id="reason" placeholder="申請理由を入力してください" {...register('reason')} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" className="" variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>

          {isPending ? (
            <Button type="submit" disabled className="" variant="primary">
              確認中...
            </Button>
          ) : (
            <Button type="submit" className="" variant="primary">
              確認
            </Button>
          )}
        </CardFooter>

        {error && error?.message}
      </Card>
    </form>
  );
}
