import { NextResponse } from 'next/server';
import getExecutor from '@/lib/db';

export async function GET() {
  try {
    const executeQuery = await getExecutor();
    const staff = await executeQuery('SELECT * FROM Staff ORDER BY ID DESC');
    return NextResponse.json(staff);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const executeQuery = await getExecutor();
    const body = await request.json();
    const { name, role, phone, salary } = body;
    await executeQuery(`INSERT INTO Staff (Name, Role, Phone, Salary) VALUES ('${name}', '${role}', '${phone}', ${salary})`);
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const executeQuery = await getExecutor();
    const body = await request.json();
    const { id, name, role, phone, salary } = body;
    
    await executeQuery(`
      UPDATE Staff 
      SET Name='${name}', Role='${role}', Phone='${phone}', Salary=${salary} 
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
    
    await executeQuery(`DELETE FROM Staff WHERE ID=${id}`);
    
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}