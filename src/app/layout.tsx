import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { auth } from "~/server/auth";
import { TRPCReactProvider } from "~/trpc/react";
import { Navbar } from "./_components/Navbar";
import { ChatSidebar } from "./_components/ChatSidebar";
import { WheelItemsProvider } from "./_components/WheelItemsProvider";

export const metadata: Metadata = {
  title: "Randoo",
  description: "지도 검색과 돌림판으로 원하는 결과를 골라보세요",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="ko" className={`${geist.variable}`}>
      <body className="bg-gray-50">
        <TRPCReactProvider>
          <WheelItemsProvider>
            <Navbar session={session} />
            <div className="flex pt-16">
              <main className="min-h-[calc(100vh-4rem)] flex-1 overflow-auto pb-20 md:mr-72 md:pb-0">
                {children}
              </main>
              <ChatSidebar />
            </div>
          </WheelItemsProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
