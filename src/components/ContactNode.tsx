import { memo } from 'react';
import type { Contact } from '@/lib/supabase';

interface ContactNodeProps {
  data: {
    contact: Contact;
    isUser?: boolean;
  };
}

function ContactNode({ data }: ContactNodeProps) {
  const { contact, isUser } = data;
  
  const getBgColor = () => {
    if (isUser) return 'bg-blue-500';
    switch (contact.intimacy) {
      case 'Close Contact': return 'bg-green-500';
      case 'Regular Contact': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div 
      className={`
        flex items-center justify-center
        ${isUser ? 'w-32 h-32' : 'w-24 h-24'}
        rounded-full
        ${getBgColor()}
        shadow-lg
        transition-transform duration-200
        hover:scale-105
        text-white
      `}
    >
      <div className="flex flex-col items-center">
        <span className={`font-bold ${isUser ? 'text-2xl' : 'text-xl'}`}>
          {contact.name.charAt(0).toUpperCase()}
        </span>
        <span className={`${isUser ? 'text-sm' : 'text-xs'} font-medium`}>
          {contact.name}
        </span>
      </div>
    </div>
  );
}

export default memo(ContactNode); 