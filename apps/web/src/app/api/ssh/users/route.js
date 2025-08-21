import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await sql`
      SELECT id, username, expired_date, created_at, is_active, 
             CASE WHEN expired_date < CURRENT_DATE THEN false ELSE true END as active_status
      FROM ssh_users 
      ORDER BY created_at DESC
    `;

    return Response.json({ users });
  } catch (error) {
    console.error("SSH users error:", error);
    return Response.json({ error: "Failed to fetch SSH users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, password, days = 30 } = await request.json();

    if (!username || !password) {
      return Response.json({ error: "Username and password required" }, { status: 400 });
    }

    // Check if username exists
    const existing = await sql`
      SELECT id FROM ssh_users WHERE username = ${username}
    `;

    if (existing.length > 0) {
      return Response.json({ error: "Username already exists" }, { status: 400 });
    }

    // Calculate expiry date
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + parseInt(days));

    // Create SSH user
    const result = await sql`
      INSERT INTO ssh_users (username, password, expired_date)
      VALUES (${username}, ${password}, ${expiredDate.toISOString().split('T')[0]})
      RETURNING id, username, expired_date, created_at
    `;

    return Response.json({ 
      success: true, 
      user: result[0],
      message: "SSH user created successfully" 
    });
  } catch (error) {
    console.error("Create SSH user error:", error);
    return Response.json({ error: "Failed to create SSH user" }, { status: 500 });
  }
}