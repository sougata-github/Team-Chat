import ModalProvider from "@/components/providers/ModalProvider";
import ServerSidebar from "@/components/server/ServerSidebar";


const ServerIdLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <ModalProvider />
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  );
};

export default ServerIdLayout;
