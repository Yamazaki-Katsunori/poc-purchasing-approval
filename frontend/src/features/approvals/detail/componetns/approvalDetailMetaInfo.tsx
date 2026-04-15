export type ApprovalDetailMetaInfoProps = {
  label: string;
  value: string | undefined;
};

export const ApprovalDetailMetaInfo = ({ label, value }: ApprovalDetailMetaInfoProps) => {
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">{label}</span>{' '}
      <span className="font-medium text-foreground">{value}</span>
    </p>
  );
};
