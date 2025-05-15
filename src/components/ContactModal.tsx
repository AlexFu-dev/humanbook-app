import { Contact } from '@/lib/supabase';

interface ContactModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ contact, isOpen, onClose }: ContactModalProps) {
  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Contact information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold
              ${contact.intimacy === 'Close Contact' ? 'bg-green-500' : 'bg-blue-500'}`}>
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{contact.name}</h2>
              <p className="text-gray-500">{contact.company}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Info</h3>
              <p className="mt-1 text-gray-900">{contact.contact || 'No contact information'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Level</h3>
              <p className="mt-1 text-gray-900">{contact.intimacy}</p>
            </div>

            {contact.tags && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {contact.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {contact.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500">Added On</h3>
              <p className="mt-1 text-gray-900">
                {new Date(contact.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 