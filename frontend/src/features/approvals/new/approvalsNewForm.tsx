'use client';

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input, Select, Textarea } from '@/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ApprovalsNewFormSchema, ApprovalsNewFormTypes } from './schemas/approvals-new-schema';
import { useApprovalButton } from './hooks/action-approval-button';

export function ApprovalsNewForm() {
  const {
    register,
    formState: { errors, isSubmitted },
    handleSubmit,
  } = useForm<ApprovalsNewFormTypes>({
    resolver: zodResolver(ApprovalsNewFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      purchese_type: '',
      amount: '',
      reason: '',
    },
  });

  const { onSubmit, onCancel } = useApprovalButton();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>購買新規申請フォーム</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="p-2">
            <label htmlFor="title">タイトル</label>
            <span>{errors.title && 'エラー'}</span>
            <Input id="title" type="text" placeholder="申請タイトルを入力してください" {...register('title')} />
          </div>

          <div className="p-2">
            <label htmlFor="purchase_type">購買種別</label>
            <Select
              id="purchase_type"
              defaultValue=""
              error={errors.purchese_type && '選択してください'}
              options={[
                { value: 'goods', label: '物品' },
                { value: 'service', label: 'サービス' },
                { value: 'equipment', label: '備品' },
              ]}
              {...register('purchese_type')}
            />
          </div>

          <div className="p-2">
            <label htmlFor="amount">購入金額</label>
            <span>{errors.amount && 'エラー'}</span>
            <Input id="amount" type="text" placeholder="購入金額を入力してください" {...register('amount')} />
          </div>

          <div className="p-2">
            <label htmlFor="reason">申請理由</label>
            <span>{errors.reason && 'エラー'}</span>
            <Textarea id="reason" placeholder="申請理由を入力してください" {...register('reason')} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" className="" variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>

          <Button type="submit" className="" variant="primary">
            確認
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
