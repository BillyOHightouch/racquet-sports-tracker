// pages/_app.tsx or pages/_app.js
import '@/styles/globals.css'; // or '../styles/globals.css' if you don't have a tsconfig path alias

import type { AppProps } from 'next/app';
export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
