import { SidebarProvider } from "@/components/ui/sidebar";
import Chat from "@/components/chat";
import ContentPanel from "@/components/content-panel/content-panel";

export default function Home() {
  return (
    <SidebarProvider defaultOpen={false}>
      <main className="w-full flex justify-center px-6">
        <Chat />
      </main>
      <ContentPanel />
    </SidebarProvider>
  );
}
