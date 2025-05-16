import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Contact } from '@/lib/supabase';
import ImageUpload from './ImageUpload';
import { supabase } from '@/lib/supabase';

const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNMjAgMjFWMTlDMjAgMTYuNzkwOCAxOC4yMDkxIDE1IDE2IDE1SDhDNS43OTA4NiAxNSA0IDE2Ljc5MDkgNCAxOVYyMU0xNiA3QzE2IDkuMjA5MTQgMTQuMjA5MSAxMSAxMiAxMUM5Ljc5MDg2IDExIDggOS4yMDkxNCA4IDdDOCA0Ljc5MDg2IDkuNzkwODYgMyAxMiAzQzE0LjIwOTEgMyAxNiA0Ljc5MDg2IDE2IDdaIi8+PC9zdmc+';

interface ContactModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ contact, isOpen, onClose }: ContactModalProps) {
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_AVATAR);

  useEffect(() => {
    const refreshImageUrl = async () => {
      if (contact?.image_url) {
        // If the URL is already a signed URL and not expired, use it
        if (contact.image_url.includes('token=')) {
          setImageUrl(contact.image_url);
          return;
        }

        // Extract the file path from the URL
        const filePath = contact.image_url.split('/').pop();
        if (filePath) {
          const { data } = await supabase.storage
            .from('contacts')
            .createSignedUrl(filePath, 60 * 60 * 24); // 24 hours

          if (data?.signedUrl) {
            setImageUrl(data.signedUrl);
          }
        }
      } else {
        setImageUrl(DEFAULT_AVATAR);
      }
    };

    refreshImageUrl();
  }, [contact?.image_url]);

  const handleImageUpload = (newImageUrl: string) => {
    setImageUrl(newImageUrl);
    // The contact will be automatically updated in the database
    // You might want to trigger a refresh of the network visualization here
    window.location.reload(); // Simple solution - you might want to implement a more elegant refresh
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Contact Details
                </Dialog.Title>

                {contact && (
                  <div className="mt-4">
                    {/* Profile Image Section */}
                    <div className="mb-6 flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-4">
                        <img
                          src={imageUrl}
                          alt={contact.name}
                          className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                          onError={() => setImageUrl(DEFAULT_AVATAR)}
                        />
                      </div>
                      <ImageUpload
                        contactId={contact.id.toString()}
                        currentImageUrl={contact.image_url}
                        onUploadComplete={handleImageUpload}
                      />
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <p className="mt-1 text-gray-900">{contact.name}</p>
                      </div>

                      {contact.company && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Company
                          </label>
                          <p className="mt-1 text-gray-900">{contact.company}</p>
                        </div>
                      )}

                      {contact.contact && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Contact
                          </label>
                          <p className="mt-1 text-gray-900">{contact.contact}</p>
                        </div>
                      )}

                      {contact.tags && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Tags
                          </label>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {contact.tags.split(',').map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Intimacy Level
                        </label>
                        <p className="mt-1 text-gray-900">{contact.intimacy}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 