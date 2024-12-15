// pages/_app.js
import Dashboard from '../pages/index';
import '../pages/css/Layout.css';

function MyApp({ Component, pageProps }) {
  return (
    <Dashboard>
      <Component {...pageProps} />
    </Dashboard>
  );
}

export default MyApp;
