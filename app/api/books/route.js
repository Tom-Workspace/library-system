import { NextResponse } from 'next/server';
import getExecutor from '@/lib/db';

export async function GET() {
  try {
    const executeQuery = await getExecutor();
    const books = await executeQuery(`
      SELECT Books.*, Authors.Name as AuthorName 
      FROM Books 
      LEFT JOIN Authors ON Books.AuthorID = Authors.ID 
      ORDER BY Books.ID DESC
    `);
    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const executeQuery = await getExecutor();
    const body = await request.json();
    const { title, authorId, category, isbn, price, stock } = body;
    
    await executeQuery(`
      INSERT INTO Books (Title, AuthorID, Category, ISBN, Price, StockAmount, IsForSale) 
      VALUES ('${title}', ${authorId}, '${category}', '${isbn}', ${price}, ${stock}, 1)
    `);
    
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const executeQuery = await getExecutor();
    const body = await request.json();
    const { id, title, authorId, category, isbn, price, stock } = body;
    
    await executeQuery(`
      UPDATE Books 
      SET Title='${title}', AuthorID=${authorId}, Category='${category}', ISBN='${isbn}', Price=${price}, StockAmount=${stock}
      WHERE ID=${id}
    `);
    
    return NextResponse.json({ message: 'Updated' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const executeQuery = await getExecutor();
    const body = await request.json();
    const { id } = body;
    await executeQuery(`DELETE FROM Books WHERE ID=${id}`);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}