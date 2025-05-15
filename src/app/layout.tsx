import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'Contacts Manager',
  description: 'A simple contacts management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
} 