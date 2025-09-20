// pages/_app.js
import '../styles/globals.css'; // use relative path unless you’ve set a @ alias

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
