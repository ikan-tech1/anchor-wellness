import { BottomNav, SidebarNav } from "@anchor/ui";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 pb-20 md:pb-0 md:overflow-auto">
        <div className="mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
