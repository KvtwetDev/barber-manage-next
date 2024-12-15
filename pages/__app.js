// pages/_app.js
import Index from '../components/index';
import '../pages/css/Layout.css';

function MyApp({ Component, pageProps }) {
  return (
    <Index>
      <Component {...pageProps} />
    </Index>
  );
}

export default MyApp;
