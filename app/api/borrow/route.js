import { NextResponse } from 'next/server';
import getExecutor from '@/lib/db';

export async function GET() {
  try {
    const executeQuery = await getExecutor();
    const borrows = await executeQuery(`
      SELECT Borrows.*, Books.Title as BookTitle, Members.Name as MemberName 
      FROM Borrows 
      JOIN Books ON Borrows.BookID = Books.ID
      JOIN Members ON Borrows.MemberID = Members.ID
      ORDER BY Borrows.ID DESC
    `);
    return NextResponse.json(borrows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const executeQuery = await getExecutor();
    const body = await request.json();
    const { bookId, memberId, date, registeredBy } = body;
    
    await executeQuery(`
      INSERT INTO Borrows (BookID, MemberID, BorrowDate, Status, RegisteredBy) 
      VALUES (${bookId}, ${memberId}, '${date}', 'Active', '${registeredBy}')
    `);
    
    await executeQuery(`UPDATE Books SET StockAmount = StockAmount - 1 WHERE ID = ${bookId}`);
    
    return NextResponse.json({ message: 'Borrowed' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const executeQuery = await getExecutor();
    const body = await request.json();
    const { id, bookId, returnDate } = body;
    
    await executeQuery(`
      UPDATE Borrows 
      SET ReturnDate = '${returnDate}', Status = 'Returned' 
      WHERE ID = ${id}
    `);
    
    await executeQuery(`UPDATE Books SET StockAmount = StockAmount + 1 WHERE ID = ${bookId}`);
    
    return NextResponse.json({ message: 'Returned' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}