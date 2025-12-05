import getExecutor from '@/lib/db';
import BookManager from '@/components/books/BookManager';

async function getData() {
  const executeQuery = await getExecutor();
  
  const books = await executeQuery(`
    SELECT Books.*, Authors.Name as AuthorName 
    FROM Books 
    LEFT JOIN Authors ON Books.AuthorID = Authors.ID 
    ORDER BY Books.ID DESC
  `);

  const authors = await executeQuery('SELECT ID, Name FROM Authors ORDER BY Name');

  return { books, authors };
}

export default async function BooksPage() {
  const { books, authors } = await getData();
  return <BookManager initialBooks={books} authors={authors} />;
}