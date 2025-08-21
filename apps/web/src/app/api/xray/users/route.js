import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const protocol = searchParams.get('protocol'); // vmess, vless, trojan

    let query = `
      SELECT id, uuid, email, protocol, expired_date, created_at, is_active,
             upload_bytes, download_bytes,
             CASE WHEN expired_date < CURRENT_DATE THEN false ELSE true END as active_status
      FROM xray_users 
    `;
    let params = [];

    if (protocol) {
      query += ` WHERE protocol = $1`;
      params.push(protocol);
    }

    query += ` ORDER BY created_at DESC`;

    const users = await sql(query, params);

    // Calculate total bandwidth usage
    const totalUpload = users.reduce((sum, user) => sum + parseInt(user.upload_bytes || 0), 0);
    const totalDownload = users.reduce((sum, user) => sum + parseInt(user.download_bytes || 0), 0);

    return Response.json({ 
      users,
      statistics: {
        total: users.length,
        active: users.filter(u => u.active_status).length,
        protocols: {
          vmess: users.filter(u => u.protocol === 'vmess').length,
          vless: users.filter(u => u.protocol === 'vless').length,
          trojan: users.filter(u => u.protocol === 'trojan').length
        },
        bandwidth: {
          upload: totalUpload,
          download: totalDownload,
          total: totalUpload + totalDownload
        }
      }
    });
  } catch (error) {
    console.error("Xray users error:", error);
    return Response.json({ error: "Failed to fetch Xray users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, protocol = 'vless', days = 30 } = await request.json();

    if (!email || !protocol) {
      return Response.json({ error: "Email and protocol required" }, { status: 400 });
    }

    if (!['vmess', 'vless', 'trojan'].includes(protocol)) {
      return Response.json({ error: "Invalid protocol. Use: vmess, vless, or trojan" }, { status: 400 });
    }

    // Generate UUID
    const uuid = generateUUID();

    // Calculate expiry date
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + parseInt(days));

    // Create Xray user
    const result = await sql`
      INSERT INTO xray_users (uuid, email, protocol, expired_date)
      VALUES (${uuid}, ${email}, ${protocol}, ${expiredDate.toISOString().split('T')[0]})
      RETURNING id, uuid, email, protocol, expired_date, created_at
    `;

    // Generate configuration based on protocol
    let config = {};
    
    if (protocol === 'vless') {
      config = {
        protocol: 'vless',
        uuid: uuid,
        address: process.env.VPN_DOMAIN || 'your-vps-domain.com',
        port: 443,
        id: uuid,
        aid: 0,
        net: 'ws',
        type: 'none',
        host: process.env.VPN_DOMAIN || 'your-vps-domain.com',
        path: '/vless',
        tls: 'tls'
      };
    } else if (protocol === 'vmess') {
      config = {
        protocol: 'vmess',
        address: process.env.VPN_DOMAIN || 'your-vps-domain.com',
        port: 443,
        id: uuid,
        aid: 0,
        net: 'ws',
        type: 'none',
        host: process.env.VPN_DOMAIN || 'your-vps-domain.com',
        path: '/vmess',
        tls: 'tls'
      };
    } else if (protocol === 'trojan') {
      config = {
        protocol: 'trojan',
        password: uuid,
        address: process.env.VPN_DOMAIN || 'your-vps-domain.com',
        port: 443,
        sni: process.env.VPN_DOMAIN || 'your-vps-domain.com'
      };
    }

    return Response.json({ 
      success: true, 
      user: result[0],
      config: config,
      message: `${protocol.toUpperCase()} user created successfully` 
    });
  } catch (error) {
    console.error("Create Xray user error:", error);
    return Response.json({ error: "Failed to create Xray user" }, { status: 500 });
  }
}