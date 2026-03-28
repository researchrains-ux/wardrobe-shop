import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>The Leftover Wardrobe</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Curated pre-loved and new clothing. Pickup in Nürnberg." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
