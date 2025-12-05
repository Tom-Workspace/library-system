import getExecutor from '@/lib/db';
import BorrowManager from '@/components/borrow/BorrowManager';

async function getData() {
  const executeQuery = await getExecutor();
  const books = await executeQuery('SELECT * FROM Books ORDER BY Title');
  const members = await executeQuery('SELECT * FROM Members ORDER BY Name');
  const staff = await executeQuery('SELECT * FROM Staff ORDER BY Name'); 
  
  const borrows = await executeQuery(`
    SELECT Borrows.*, Books.Title as BookTitle, Members.Name as MemberName 
    FROM Borrows 
    JOIN Books ON Borrows.BookID = Books.ID
    JOIN Members ON Borrows.MemberID = Members.ID
    ORDER BY Borrows.ID DESC
  `);

  return { books, members, borrows, staff };
}

export default async function BorrowPage() {
  const { books, members, borrows, staff } = await getData();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">إدارة الاستعارة والإرجاع</h1>
      <BorrowManager books={books} members={members} activeLoans={borrows} staff={staff} />
    </div>
  );
}