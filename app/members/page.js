import getExecutor from '@/lib/db';
import MemberManager from '@/components/members/MemberManager';

async function getData() {
  const executeQuery = await getExecutor();
  const members = await executeQuery('SELECT * FROM Members ORDER BY ID DESC');
  return members;
}

export default async function MembersPage() {
  const data = await getData();
  return <MemberManager initialData={data} />;
}