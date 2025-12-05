import getExecutor from '@/lib/db';
import SalesManager from '@/components/sales/SalesManager';

async function getData() {
  const executeQuery = await getExecutor();
  
  const books = await executeQuery('SELECT * FROM Books WHERE IsForSale = 1 ORDER BY Title');
  const staff = await executeQuery('SELECT * FROM Staff ORDER BY Name');
  
  const salesHistory = await executeQuery(`
    SELECT Sales.*, Books.Title as BookTitle 
    FROM Sales 
    JOIN Books ON Sales.BookID = Books.ID 
    ORDER BY Sales.ID DESC
  `);

  return { books, salesHistory, staff };
}

export default async function SalesPage() {
  const { books, salesHistory, staff } = await getData();
  return <SalesManager books={books} salesHistory={salesHistory} staff={staff} />;
}