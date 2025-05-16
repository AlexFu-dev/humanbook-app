'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';

export default function AnalyticsTest() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <h1 className="text-2xl font-bold">Analytics Test Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Navigation</h2>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/contacts')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Contacts
              </button>
              <button
                onClick={() => router.push('/map')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Go to Map
              </button>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test User Interaction</h2>
            <div className="space-y-4">
              <div>
                <p>Counter: {count}</p>
                <button
                  onClick={() => setCount(prev => prev + 1)}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  Increment Counter
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Deploy this app to Vercel</li>
              <li>Visit this page in production</li>
              <li>Click different buttons and navigate between pages</li>
              <li>Wait 30-60 seconds</li>
              <li>Check your Vercel Analytics dashboard</li>
              <li>You should see:
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Page views for this test page</li>
                  <li>Navigation events to other pages</li>
                  <li>User interactions (button clicks)</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
} 