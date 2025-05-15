import { supabase } from './supabase';

async function testStorage() {
  console.log('Testing Supabase Storage Configuration...');

  try {
    // 1. List all buckets
    console.log('\n1. Listing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('✅ Available buckets:', buckets);

    // 2. Create contacts bucket if it doesn't exist
    if (!buckets.find(b => b.name === 'contacts')) {
      console.log('\n2. Creating contacts bucket...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('contacts', {
        public: false
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return;
      }
      console.log('✅ Created contacts bucket:', newBucket);
    } else {
      console.log('\n✅ Contacts bucket already exists');
    }

    // 3. Test bucket access
    console.log('\n3. Testing bucket access...');
    const { data: files, error: listError } = await supabase.storage
      .from('contacts')
      .list();

    if (listError) {
      console.error('❌ Error listing files:', listError);
      return;
    }
    console.log('✅ Successfully listed files:', files);

    // 4. Test bucket policies
    console.log('\n4. Testing bucket policies...');
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contacts')
      .upload('test.txt', testFile);

    if (uploadError) {
      console.error('❌ Error uploading test file:', uploadError);
    } else {
      console.log('✅ Successfully uploaded test file:', uploadData);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('contacts')
        .remove(['test.txt']);
      
      if (deleteError) {
        console.error('❌ Error deleting test file:', deleteError);
      } else {
        console.log('✅ Successfully cleaned up test file');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testStorage().then(() => {
  console.log('\nStorage test complete');
}); 