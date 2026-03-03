import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Select } from '@/ui/select';

export default function Page() {
  return (
    <main className="min-h-screen p-6 text-neutral-900">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>UI Test</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input placeholder="入力（正常）" />
            <Input placeholder="入力（エラー）" error="必須です" />
          </div>

          <div className="space-y-2">
            <Textarea placeholder="理由（正常）" />
            <Textarea placeholder="理由（エラー）" error="20文字以上で入力してください" />
          </div>

          <div className="space-y-2">
            <Select
              defaultValue=""
              options={[
                { value: 'goods', label: '物品' },
                { value: 'service', label: 'サービス' },
              ]}
            />
            <Select
              defaultValue=""
              error="選択してください"
              options={[
                { value: 'goods', label: '物品' },
                { value: 'service', label: 'サービス' },
              ]}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="primary">通常</Button>
            <Button disabled>disabled</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
