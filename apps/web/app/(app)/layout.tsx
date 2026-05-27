import { BottomNav, SidebarNav, PasscodeGate } from "@anchor/ui";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PasscodeGate>
      <div className="flex min-h-screen bg-mesh">
        <SidebarNav />
        <main className="flex-1 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:pb-0 md:overflow-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </PasscodeGate>
  );
}
