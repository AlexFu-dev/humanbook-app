'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';

export default function TestStorage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const log = (message: string) => {
    setResults(prev => [...prev, message]);
  };

  const runTest = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      log('Testing Supabase Storage Configuration...');

      // 1. List all buckets
      log('\n1. Listing buckets...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        log('❌ Error listing buckets: ' + JSON.stringify(bucketsError));
        return;
      }
      
      log('✅ Available buckets: ' + JSON.stringify(buckets));

      // 2. Create contacts bucket if it doesn't exist
      if (!buckets.find(b => b.name === 'contacts')) {
        log('\n2. Creating contacts bucket...');
        const { data: newBucket, error: createError } = await supabase.storage.createBucket('contacts', {
          public: false
        });

        if (createError) {
          log('❌ Error creating bucket: ' + JSON.stringify(createError));
          return;
        }
        log('✅ Created contacts bucket: ' + JSON.stringify(newBucket));
      } else {
        log('\n✅ Contacts bucket already exists');
      }

      // 3. Test bucket access
      log('\n3. Testing bucket access...');
      const { data: files, error: listError } = await supabase.storage
        .from('contacts')
        .list();

      if (listError) {
        log('❌ Error listing files: ' + JSON.stringify(listError));
        return;
      }
      log('✅ Successfully listed files: ' + JSON.stringify(files));

      // 4. Test bucket policies
      log('\n4. Testing bucket policies...');
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contacts')
        .upload('test.txt', testFile);

      if (uploadError) {
        log('❌ Error uploading test file: ' + JSON.stringify(uploadError));
      } else {
        log('✅ Successfully uploaded test file: ' + JSON.stringify(uploadData));
        
        // Clean up test file
        const { error: deleteError } = await supabase.storage
          .from('contacts')
          .remove(['test.txt']);
        
        if (deleteError) {
          log('❌ Error deleting test file: ' + JSON.stringify(deleteError));
        } else {
          log('✅ Successfully cleaned up test file');
        }
      }

    } catch (error) {
      log('❌ Unexpected error: ' + JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Storage Configuration Test</h1>
        <button
          onClick={runTest}
          disabled={loading}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Storage Test'}
        </button>
        
        <div className="bg-gray-100 p-4 rounded">
          <pre className="whitespace-pre-wrap">
            {results.join('\n')}
          </pre>
        </div>
      </div>
    </Layout>
  );
} 