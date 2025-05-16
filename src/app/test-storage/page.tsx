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

      // 1. Test bucket access
      log('\n1. Testing bucket access...');
      const { data: files, error: listError } = await supabase.storage
        .from('contacts')
        .list();

      if (listError) {
        log('❌ Error accessing contacts bucket: ' + JSON.stringify(listError));
        return;
      }
      log('✅ Successfully accessed contacts bucket');
      log('✅ Current files in bucket: ' + JSON.stringify(files));

      // 2. Test file upload
      log('\n2. Testing file upload...');
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