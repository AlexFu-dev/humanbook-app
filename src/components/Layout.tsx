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
          <div className="flex flex-col sm:flex-row justify-between h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <Link href="/map" className="text-xl font-bold text-gray-800">
                Contacts Manager
              </Link>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8">
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
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0">
              <Auth />
              <Link
                href="/add"
                className="w-full sm:w-auto text-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Add Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 