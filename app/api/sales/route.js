import { NextResponse } from 'next/server';
import getExecutor from '@/lib/db';

export async function GET() {
  try {
    const executeQuery = await getExecutor();
 
    const sales = await executeQuery(`
      SELECT Sales.*, Books.Title as BookTitle 
      FROM Sales 
      JOIN Books ON Sales.BookID = Books.ID
      ORDER BY Sales.ID DESC
    `);
    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const executeQuery = await getExecutor();
    const body = await request.json();
    const { bookId, customerName, price, soldBy } = body;
    const date = new Date().toISOString().split('T')[0];

    await executeQuery(`
      INSERT INTO Sales (BookID, CustomerName, SaleDate, AmountPaid, SoldBy)
      VALUES (${bookId}, '${customerName}', '${date}', ${price}, '${soldBy}')
    `);

    await executeQuery(`
      UPDATE Books 
      SET StockAmount = StockAmount - 1 
      WHERE ID = ${bookId}
    `);

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}