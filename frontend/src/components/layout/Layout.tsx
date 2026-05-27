import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import Footer from './Footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-on-background min-h-screen font-inter overflow-x-hidden">
      <Sidebar />
      <TopNav />
      <main className="pt-28 md:pt-32 pb-24 md:pb-12 px-container-padding-mobile md:px-container-padding-desktop md:ml-[112px] min-h-screen flex flex-col gap-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
