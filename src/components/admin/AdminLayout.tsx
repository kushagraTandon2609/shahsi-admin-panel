import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ClientErrorLogger } from './ClientErrorLogger';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="admin-shell min-h-screen bg-[#f6f6f3] text-gray-950">
      <ClientErrorLogger />

      <Sidebar />

      <main className="min-h-screen transition-all duration-200 lg:ml-64">
        <Topbar />

        <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="admin-fade-in">{children}</div>
        </div>
      </main>
    </div>
  );
}