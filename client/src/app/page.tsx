import { SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider>
      <main className="w-full"></main>
    </SidebarProvider>
  );
}
