import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ navItems, sidebarItems, sidebarActiveKey, title, subtitle, actions, fullBleed = false, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-page">
      <Sidebar
        items={sidebarItems ?? navItems}
        activeKey={sidebarActiveKey}
        mobileOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={title} subtitle={subtitle} actions={actions} onMenuClick={() => setDrawerOpen(true)} />
        <main
          className={
            fullBleed
              ? "min-h-0 flex-1 overflow-hidden"
              : "flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
