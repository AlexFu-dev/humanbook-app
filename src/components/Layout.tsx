import Link from 'next/link';
import Auth from './Auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/map" className="text-xl font-bold text-gray-800">
                Contacts Manager
              </Link>
              <Link
                href="/contacts"
                className="text-gray-600 hover:text-gray-900"
              >
                Contact List
              </Link>
              <Link
                href="/map"
                className="text-gray-600 hover:text-gray-900"
              >
                Mind Map View
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Auth />
              <Link
                href="/add"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Add Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 