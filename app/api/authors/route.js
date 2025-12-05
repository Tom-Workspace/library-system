import { NextResponse } from 'next/server';
import getExecutor from '@/lib/db';

export async function GET() {
  try {
    const executeQuery = await getExecutor();
    const authors = await executeQuery('SELECT * FROM Authors ORDER BY ID DESC');
    return NextResponse.json(authors);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const executeQuery = await getExecutor();
    const body = await request.json();
    const { name, bio } = body;
    await executeQuery(`INSERT INTO Authors (Name, Bio) VALUES ('${name}', '${bio}')`);
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const executeQuery = await getExecutor();
    const body = await request.json();
    const { id, name, bio } = body;
    await executeQuery(`UPDATE Authors SET Name = '${name}', Bio = '${bio}' WHERE ID = ${id}`);
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
    await executeQuery(`DELETE FROM Authors WHERE ID = ${id}`);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}