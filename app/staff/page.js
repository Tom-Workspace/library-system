import getExecutor from '@/lib/db';
import StaffManager from '@/components/staff/StaffManager';

async function getData() {
  const executeQuery = await getExecutor();
  const staff = await executeQuery('SELECT * FROM Staff ORDER BY ID DESC');
  return staff;
}

export default async function StaffPage() {
  const data = await getData();
  return <StaffManager initialData={data} />;
}