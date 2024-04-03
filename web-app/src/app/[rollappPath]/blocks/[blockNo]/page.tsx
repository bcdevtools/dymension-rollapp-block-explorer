import PageBreadcrumb from '@/components/commons/PageBreadcrumb';

type BlockProps = Readonly<{
  params: { blockNo: string };
}>;

export default function Block({ params }: BlockProps) {
  return (
    <>
      <PageBreadcrumb />
    </>
  );
}
