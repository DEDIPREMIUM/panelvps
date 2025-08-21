"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Users,
  Shield,
  Settings,
  BarChart3,
  Download,
  Upload,
  Clock,
  Globe,
  Activity,
  ChevronRight,
  Power,
  Zap,
  LogOut,
} from "lucide-react";

export default function VPSManagerDashboard() {
  const { data: user, loading } = useUser();
  const [selectedService, setSelectedService] = useState("overview");
  const [serverStats, setServerStats] = useState({
    cpu: 13,
    ram: { used: 218, total: 1971 },
    swap: { used: 1, total: 1900 },
    uptime: "2 days",
    ip: "140.99.83.87",
  });

  const services = [
    {
      id: "ssh",
      name: "SSH",
      count: 7,
      status: "ON",
      gradient: "linear-gradient(135deg, #7C9EDB 0%, #5A7BC5 100%)",
    },
    {
      id: "vmess",
      name: "VMESS",
      count: 0,
      status: "ON",
      gradient: "linear-gradient(135deg, #8ED1B8 0%, #1DB584 100%)",
    },
    {
      id: "vless",
      name: "VLESS",
      count: 0,
      status: "ON",
      gradient: "linear-gradient(135deg, #B8A8E8 0%, #9B7FE8 100%)",
    },
    {
      id: "trojan",
      name: "TROJAN",
      count: 0,
      status: "ON",
      gradient: "linear-gradient(135deg, #F2C794 0%, #F0905A 100%)",
    },
  ];

  const menuItems = [
    {
      id: "ssh",
      label: "SSH Management",
      icon: Shield,
      description: "Manage SSH users and connections",
    },
    {
      id: "vmess",
      label: "VMESS Protocol",
      icon: Zap,
      description: "Configure VMESS connections",
    },
    {
      id: "vless",
      label: "VLESS Protocol",
      icon: Wifi,
      description: "Setup VLESS configurations",
    },
    {
      id: "trojan",
      label: "TROJAN Protocol",
      icon: Users,
      description: "Manage TROJAN accounts",
    },
    {
      id: "settings",
      label: "Server Settings",
      icon: Settings,
      description: "System configuration",
    },
    {
      id: "trial",
      label: "Trial Accounts",
      icon: Clock,
      description: "Manage trial users",
    },
    {
      id: "backup",
      label: "Backup & Restore",
      icon: Download,
      description: "Data backup management",
    },
    {
      id: "addhost",
      label: "Add Host",
      icon: Globe,
      description: "Domain management",
    },
    {
      id: "running",
      label: "Running Services",
      icon: Activity,
      description: "Monitor active services",
    },
    {
      id: "wsport",
      label: "WS Port (OVPN)",
      icon: Wifi,
      description: "WebSocket configuration",
    },
    {
      id: "installbot",
      label: "Install Bot",
      icon: Zap,
      description: "Telegram bot setup",
    },
    {
      id: "bandwidth",
      label: "Bandwidth Monitor",
      icon: BarChart3,
      description: "Network usage statistics",
    },
    {
      id: "theme",
      label: "Menu Theme",
      icon: Settings,
      description: "Customize appearance",
    },
    {
      id: "update",
      label: "Update Script",
      icon: Upload,
      description: "System updates",
    },
  ];

  const domains = [
    "ws-r52tn.ilyass.my.id",
    "flare-r52tn.ilyass.my.id",
    "ns-r52tn.ilyass.my.id",
  ];

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-opacity-60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = "/account/signin";
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#121212] border-b border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[72px] gap-4">
            {/* Left cluster */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Server className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-poppins font-medium text-sm text-white text-opacity-87">
                  ILYASS VPS Manager
                </span>
                <div className="text-xs text-white text-opacity-60">
                  Ubuntu 20.04.6 LTS • {serverStats.ip}
                </div>
              </div>
            </div>

            {/* Center cluster - Domains */}
            <div className="hidden lg:flex items-center gap-4">
              {domains.map((domain, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-white text-opacity-70">
                    {domain}
                  </span>
                </div>
              ))}
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-white text-opacity-60">
                  Admin: {user.email}
                </div>
                <div className="text-sm font-medium text-white text-opacity-87">
                  CPU: {serverStats.cpu}%
                </div>
              </div>
              <a
                href="/account/logout"
                className="w-8 h-8 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-red-400" />
              </a>
              <div className="w-8 h-8 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                <Power className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Server Stats Overview */}
        <div className="mb-8">
          <h1 className="font-poppins font-semibold text-2xl text-white text-opacity-87 mb-6">
            Server Overview
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* CPU Usage */}
            <div className="bg-[#1E1E1E] rounded-[16px] p-6">
              <div className="flex items-center justify-between mb-4">
                <Cpu className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white text-opacity-87">
                  {serverStats.cpu}%
                </span>
              </div>
              <div className="text-sm text-white text-opacity-60">
                CPU Usage
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${serverStats.cpu}%` }}
                ></div>
              </div>
            </div>

            {/* RAM Usage */}
            <div className="bg-[#1E1E1E] rounded-[16px] p-6">
              <div className="flex items-center justify-between mb-4">
                <HardDrive className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white text-opacity-87">
                  {Math.round(
                    (serverStats.ram.used / serverStats.ram.total) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="text-sm text-white text-opacity-60">
                RAM: {serverStats.ram.used}Mi / {serverStats.ram.total}MB
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(serverStats.ram.used / serverStats.ram.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Active Services */}
            <div className="bg-[#1E1E1E] rounded-[16px] p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white text-opacity-87">
                  7
                </span>
              </div>
              <div className="text-sm text-white text-opacity-60">
                Active Services
              </div>
              <div className="text-xs text-green-400 mt-2">
                All services running
              </div>
            </div>

            {/* Total Users */}
            <div className="bg-[#1E1E1E] rounded-[16px] p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-orange-400" />
                <span className="text-2xl font-bold text-white text-opacity-87">
                  7
                </span>
              </div>
              <div className="text-sm text-white text-opacity-60">
                Total Users
              </div>
              <div className="text-xs text-orange-400 mt-2">SSH: 7 users</div>
            </div>
          </div>
        </div>

        {/* VPN Services Status */}
        <div className="mb-8">
          <h2 className="font-poppins font-semibold text-xl text-white text-opacity-87 mb-6">
            VPN Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[#1E1E1E] rounded-[16px] p-6 cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all duration-200"
                onClick={() => setSelectedService(service.id)}
              >
                {/* Status indicator */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl opacity-80"
                    style={{
                      background: service.gradient,
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-400">
                      {service.status}
                    </span>
                  </div>
                </div>

                <div className="mb-2">
                  <h3 className="font-poppins font-medium text-lg text-white text-opacity-87">
                    {service.name}
                  </h3>
                  <div className="text-sm text-white text-opacity-60">
                    {service.count} active connections
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Management Menu */}
        <div className="mb-8">
          <h2 className="font-poppins font-semibold text-xl text-white text-opacity-87 mb-6">
            Management Panel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  className="bg-[#1E1E1E] rounded-[16px] p-6 text-left hover:bg-[#252525] hover:scale-[1.02] transition-all duration-200 group"
                  onClick={() => setSelectedService(item.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <IconComponent className="w-8 h-8 text-white text-opacity-70 group-hover:text-white group-hover:text-opacity-87 transition-colors" />
                    <ChevronRight className="w-5 h-5 text-white text-opacity-40 group-hover:text-white group-hover:text-opacity-70 transition-colors" />
                  </div>

                  <h3 className="font-poppins font-medium text-base text-white text-opacity-87 mb-2">
                    {item.label}
                  </h3>
                  <p className="text-sm text-white text-opacity-60">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-poppins font-medium transition-all duration-200 hover:scale-[1.02]">
            Restart All Services
          </button>
          <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-poppins font-medium transition-all duration-200 hover:scale-[1.02]">
            Create Backup
          </button>
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-poppins font-medium transition-all duration-200 hover:scale-[1.02]">
            Check Updates
          </button>
        </div>
      </div>

      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
    </div>
  );
}
