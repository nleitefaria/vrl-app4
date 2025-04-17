import "src/styles/globals.css";

import AppLayout from "src/components/Layout";

export default function App({ Component, pageProps }) {
  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );
}
