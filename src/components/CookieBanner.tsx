'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 flex items-center justify-between rounded-xl bg-white p-4 text-sm shadow-md">
      <span>
        Мы используем{' '}
        <Link href="/privacy" className="text-accent underline">
          cookie
        </Link>{' '}
        для улучшения работы сайта.
      </span>
      <button
        onClick={accept}
        className="ml-4 rounded-xl bg-accent px-4 py-1 text-xs font-bold uppercase tracking-wider text-white"
      >
        OK
      </button>
    </div>
  );
}
