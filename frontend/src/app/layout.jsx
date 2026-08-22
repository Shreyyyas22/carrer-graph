import "./globals.css";

import Nav from "@/components/layout/Nav";

export const metadata = {
  title: "CareerGraph",
  description: "A graph-powered career exploration platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <Nav />
        {children}
      </body>
    </html>
  );
}
