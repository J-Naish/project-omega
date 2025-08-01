import { SidebarProvider } from "@/components/ui/sidebar";
import Chat from "@/components/chat/chat";

export default function Home() {
  return (
    <SidebarProvider>
      <main className="w-full flex justify-center px-6">
        <Chat />
      </main>
    </SidebarProvider>
  );
}
