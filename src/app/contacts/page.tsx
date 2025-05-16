'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { supabase, type Contact } from '@/lib/supabase';
import toast from 'react-hot-toast';

const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNMjAgMjFWMTlDMjAgMTYuNzkwOCAxOC4yMDkxIDE1IDE2IDE1SDhDNS43OTA4NiAxNSA0IDE2Ljc5MDkgNCAxOVYyMU0xNiA3QzE2IDkuMjA5MTQgMTQuMjA5MSAxMSAxMiAxMUM5Ljc5MDg2IDExIDggOS4yMDkxNCA4IDdDOCA0Ljc5MDg2IDkuNzkwODYgMyAxMiAzQzE0LjIwOTEgMyAxNiA0Ljc5MDg2IDE2IDdaIi8+PC9zdmc+';

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const router = useRouter();

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    const refreshImageUrls = async () => {
      const newImageUrls: Record<number, string> = {};
      
      for (const contact of contacts) {
        if (contact.image_url) {
          // If the URL is already a signed URL and not expired, use it
          if (contact.image_url.includes('token=')) {
            newImageUrls[contact.id] = contact.image_url;
            continue;
          }

          // Extract the file path from the URL
          const filePath = contact.image_url.split('/').pop();
          if (filePath) {
            const { data } = await supabase.storage
              .from('contacts')
              .createSignedUrl(filePath, 60 * 60 * 24); // 24 hours

            if (data?.signedUrl) {
              newImageUrls[contact.id] = data.signedUrl;
            }
          }
        } else {
          newImageUrls[contact.id] = DEFAULT_AVATAR;
        }
      }

      setImageUrls(newImageUrls);
    };

    refreshImageUrls();
  }, [contacts]);

  async function fetchContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('Failed to fetch contacts');
      return;
    }
    
    setContacts(data || []);
  }

  async function deleteContact(id: number) {
    const confirmed = window.confirm('Are you sure you want to delete this contact?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete contact');
      return;
    }

    toast.success('Contact deleted successfully');
    fetchContacts();
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.company?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (contact.tags?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full p-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 bg-white rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12">
                    <img
                      src={imageUrls[contact.id] || DEFAULT_AVATAR}
                      alt={contact.name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = DEFAULT_AVATAR;
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{contact.name}</h2>
                    {contact.company && <p className="text-gray-600">{contact.company}</p>}
                    {contact.contact && <p className="text-sm text-gray-500">{contact.contact}</p>}
                    {contact.tags && <p className="text-sm text-blue-500">{contact.tags}</p>}
                    <p className="mt-2 text-gray-700">{contact.intimacy}</p>
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => router.push(`/edit/${contact.id}`)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ContactsPage; 