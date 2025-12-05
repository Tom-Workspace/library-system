import { NextResponse } from 'next/server';
import getExecutor from '@/lib/db';

export async function GET() {
  try {
    const executeQuery = await getExecutor();
    const members = await executeQuery('SELECT * FROM Members ORDER BY ID DESC');
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const executeQuery = await getExecutor();
    const body = await request.json();
    const { name, phone, date } = body;
    await executeQuery(`INSERT INTO Members (Name, Phone, MembershipDate) VALUES ('${name}', '${phone}', '${date}')`);
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const executeQuery = await getExecutor();
    const body = await request.json();
    const { id, name, phone, date } = body;
    await executeQuery(`UPDATE Members SET Name='${name}', Phone='${phone}', MembershipDate='${date}' WHERE ID=${id}`);
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
    await executeQuery(`DELETE FROM Members WHERE ID=${id}`);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}