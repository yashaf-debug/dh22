'use client';

import { useEffect, useState } from 'react';
import Turnstile from 'react-turnstile';

type Props = {
  onVerify: (token: string) => void;
};

export default function TurnstileWidget({ onVerify }: Props) {
  const [siteKey, setSiteKey] = useState<string | null>(null);

  useEffect(() => {
    setSiteKey(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null);
  }, []);

  if (!siteKey) return null;

  return (
    <Turnstile
      sitekey={siteKey}
      onVerify={(token) => onVerify(token)}
      // @ts-ignore
      options={{ appearance: 'interaction-only' }}
    />
  );
}
