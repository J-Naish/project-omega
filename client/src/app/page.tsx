import { SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider>
      <main className="w-full flex justify-center px-6">
        <div className="w-full max-w-6xl flex flex-col bg-yellow-50">
          <div className="flex-1">{/* Message Area */}</div>
          <div className="sticky bottom-0 pb-6">{/* Chat Input */}</div>
        </div>
      </main>
    </SidebarProvider>
  );
}
