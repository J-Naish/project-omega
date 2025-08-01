import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import Chat from "@/components/chat/chat";

export default function Home() {
  return (
    <SidebarProvider defaultOpen={false}>
      <main className="w-full flex justify-center px-6">
        <Chat />
      </main>
      <Sidebar side="right"></Sidebar>
    </SidebarProvider>
  );
}
