'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { supabase, type Contact } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function EditContact({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<Contact>({
    id: 0,
    name: '',
    company: '',
    contact: '',
    tags: '',
    intimacy: 'Regular Contact',
    notes: '',
    created_at: ''
  });

  useEffect(() => {
    fetchContact();
  }, []);

  async function fetchContact() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      toast.error('Failed to fetch contact');
      router.push('/');
      return;
    }

    setFormData(data);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('contacts')
      .update({
        name: formData.name,
        company: formData.company,
        contact: formData.contact,
        tags: formData.tags,
        intimacy: formData.intimacy,
        notes: formData.notes
      })
      .eq('id', params.id);

    if (error) {
      toast.error('Failed to update contact');
      return;
    }

    toast.success('Contact updated successfully');
    router.push('/');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Contact</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Info</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Separate with commas"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Level</label>
            <select
              name="intimacy"
              value={formData.intimacy}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Close Contact">Close Contact</option>
              <option value="Regular Contact">Regular Contact</option>
              <option value="Potential Contact">Potential Contact</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Update Contact
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 