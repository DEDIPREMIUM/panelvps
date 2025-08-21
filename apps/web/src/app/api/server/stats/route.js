import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get latest server stats
    const stats = await sql`
      SELECT * FROM server_stats 
      ORDER BY recorded_at DESC 
      LIMIT 1
    `;

    // Get SSH user count
    const sshStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true AND expired_date >= CURRENT_DATE) as active,
        COUNT(*) FILTER (WHERE expired_date < CURRENT_DATE) as expired
      FROM ssh_users
    `;

    // Get Xray user count
    const xrayStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true AND expired_date >= CURRENT_DATE) as active,
        COUNT(*) FILTER (WHERE protocol = 'vless') as vless,
        COUNT(*) FILTER (WHERE protocol = 'vmess') as vmess,
        COUNT(*) FILTER (WHERE protocol = 'trojan') as trojan
      FROM xray_users
    `;

    const serverData = stats[0] || {
      cpu_usage: 0,
      ram_used: 0,
      ram_total: 1024,
      disk_used: 0,
      disk_total: 10240,
      uptime: '0 days'
    };

    return Response.json({
      server: {
        cpu: serverData.cpu_usage,
        ram: {
          used: serverData.ram_used,
          total: serverData.ram_total,
          percentage: Math.round((serverData.ram_used / serverData.ram_total) * 100)
        },
        disk: {
          used: serverData.disk_used,
          total: serverData.disk_total,
          percentage: Math.round((serverData.disk_used / serverData.disk_total) * 100)
        },
        uptime: serverData.uptime
      },
      users: {
        ssh: {
          total: parseInt(sshStats[0].total),
          active: parseInt(sshStats[0].active),
          expired: parseInt(sshStats[0].expired)
        },
        xray: {
          total: parseInt(xrayStats[0].total),
          active: parseInt(xrayStats[0].active),
          vless: parseInt(xrayStats[0].vless),
          vmess: parseInt(xrayStats[0].vmess),
          trojan: parseInt(xrayStats[0].trojan)
        }
      },
      services: {
        ssh: "running",
        nginx: "running", 
        xray: "running",
        database: "running"
      }
    });
  } catch (error) {
    console.error("Server stats error:", error);
    return Response.json({ error: "Failed to fetch server stats" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cpu_usage, ram_used, ram_total, disk_used, disk_total, uptime } = await request.json();

    // Update server stats
    const result = await sql`
      INSERT INTO server_stats (cpu_usage, ram_used, ram_total, disk_used, disk_total, uptime)
      VALUES (${cpu_usage}, ${ram_used}, ${ram_total}, ${disk_used}, ${disk_total}, ${uptime})
      RETURNING *
    `;

    return Response.json({
      success: true,
      message: "Server stats updated",
      stats: result[0]
    });
  } catch (error) {
    console.error("Update server stats error:", error);
    return Response.json({ error: "Failed to update server stats" }, { status: 500 });
  }
}