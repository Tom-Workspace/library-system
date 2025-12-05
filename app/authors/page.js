import getExecutor from '@/lib/db';
import AuthorManager from '@/components/authors/AuthorManager';

async function getData() {
  const executeQuery = await getExecutor();
  const authors = await executeQuery('SELECT * FROM Authors ORDER BY ID DESC');
  return authors;
}

export default async function AuthorsPage() {
  const data = await getData();
  return <AuthorManager initialData={data} />;
}