import { useState } from 'react';
import { supabase, isAuthenticated, checkContactsBucket } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  contactId: string;
  currentImageUrl?: string;
  onUploadComplete: (url: string) => void;
}


// Add test function to check storage configuration
async function checkStorageConfig() {
  try {
    console.log('Checking storage configuration...');
    
    // Check authentication first
    const isAuthed = await isAuthenticated();
    if (!isAuthed) {
      return {
        success: false,
        error: 'User not authenticated',
        details: 'Please sign in to upload images'
      };
    }

    // Check if contacts bucket exists
    const bucketResult = await checkContactsBucket();
    if (!bucketResult.success) {
      return {
        success: false,
        error: 'Failed to access contacts bucket',
        details: bucketResult.error
      };
    }

    // Try to list files in the bucket to test permissions
    const { data: files, error: listError } = await supabase
      .storage
      .from('contacts')
      .list();

    if (listError) {
      console.error('Error listing files:', listError);
      return {
        success: false,
        error: 'Unable to access contacts bucket',
        details: listError
      };
    }

    console.log('Storage configuration check completed successfully');
    return {
      success: true,
      files: files
    };
  } catch (error) {
    console.error('Error checking storage configuration:', error);
    return {
      success: false,
      error: 'Unexpected error checking storage',
      details: error
    };
  }
}

export default function ImageUpload({ contactId, currentImageUrl, onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [configChecked, setConfigChecked] = useState(false);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      // Check authentication first
      const isAuthed = await isAuthenticated();
      if (!isAuthed) {
        throw new Error('Please sign in to upload images');
      }

      // Check storage configuration first if not checked yet
      if (!configChecked) {
        const configCheck = await checkStorageConfig();
        setConfigChecked(true);

        if (!configCheck.success) {
          console.error('Storage configuration check failed:', configCheck);
          throw new Error(`Storage configuration error: ${configCheck.error}`);
        }
      }

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${contactId}-${Math.random()}.${fileExt}`;
      const filePath = fileName;

      console.log('Attempting to upload file:', {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type,
        bucket: 'contacts'
      });

      // Upload image to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('contacts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Get signed URL instead of public URL
      const { data: urlData } = await supabase.storage
        .from('contacts')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

      if (!urlData?.signedUrl) {
        throw new Error('Failed to get signed URL for uploaded file');
      }

      console.log('Got signed URL:', urlData.signedUrl);

      // Update contact with new image URL
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ image_url: urlData.signedUrl })
        .eq('id', contactId);

      if (updateError) {
        console.error('Error updating contact:', updateError);
        throw updateError;
      }

      // Delete old image if it exists
      if (currentImageUrl) {
        try {
          const oldFilePath = currentImageUrl.split('/').pop();
          if (oldFilePath) {
            const { error: deleteError } = await supabase.storage
              .from('contacts')
              .remove([oldFilePath]);
            
            if (deleteError) {
              console.warn('Error deleting old image:', deleteError);
            }
          }
        } catch (deleteError) {
          console.warn('Error during old image cleanup:', deleteError);
        }
      }

      onUploadComplete(urlData.signedUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error in image upload process:', error);
      toast.error(error instanceof Error ? error.message : 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={uploadImage}
          disabled={uploading}
          className="hidden"
        />
        <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          {uploading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          {uploading ? 'Uploading...' : 'Upload Image'}
        </div>
      </label>
    </div>
  );
} 