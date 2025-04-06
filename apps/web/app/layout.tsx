"use client";

import { client } from "@/lib/apollo-client";
import { ApolloProvider } from "@apollo/client";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloProvider client={client}>
          <Navbar />
          <main className="flex min-h-screen flex-col items-center p-24">
            {children}
          </main>
        </ApolloProvider>
      </body>
    </html>
  );
}
