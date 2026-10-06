"use client";

import { useState } from "react";

import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="admin-layout">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* =====================================
          MAIN AREA
      ===================================== */}

      <div className="admin-main">

        {/* TOPBAR */}

        <AdminTopbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        {/* PAGE CONTENT */}

        <main className="admin-content">
          {children}
        </main>

      </div>

      <style jsx global>{`
        /* =====================================
           ADMIN LAYOUT
        ===================================== */

        .admin-layout {
          min-height: 100vh;

          width: 100%;

          background: #f7f7f5;

          color: #111111;
        }

        /* =====================================
           MAIN AREA
        ===================================== */

        .admin-main {
          min-height: 100vh;

          margin-left: 250px;

          display: flex;

          flex-direction: column;
        }

        /* =====================================
           CONTENT
        ===================================== */

        .admin-content {
          flex: 1;

          width: 100%;

          min-width: 0;

          box-sizing: border-box;

          padding: 30px;
        }

        /* =====================================
           TABLET
        ===================================== */

        @media (max-width: 900px) {
          .admin-main {
            margin-left: 0;
          }

          .admin-content {
            padding: 24px 20px;
          }
        }

        /* =====================================
           MOBILE
        ===================================== */

        @media (max-width: 480px) {
          .admin-content {
            padding: 18px 14px;
          }
        }
      `}</style>
    </div>
  );
}