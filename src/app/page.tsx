'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { supabase, type Contact } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchContacts();
  }, []);

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
    contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.tags.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search contacts..."
          className="w-full p-2 border rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="grid gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 bg-white rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{contact.name}</h2>
                  <p className="text-gray-600">{contact.company}</p>
                  <p className="text-sm text-gray-500">{contact.contact}</p>
                  <p className="text-sm text-blue-500">{contact.tags}</p>
                  <p className="mt-2 text-gray-700">{contact.notes}</p>
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
} 