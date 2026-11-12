import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router';
import Footer from './components/Footer';
import Header from './components/Header';
import Main from './components/Main';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// ページを移動したら先頭から表示する
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const NotFound = () => (
  <main className="page">
    <title>ページが見つかりません - Smart Changer</title>
    <h1>ページが見つかりません</h1>
    <p>
      <Link to="/">トップページへ戻る</Link>
    </p>
  </main>
);

const App = () => (
  <div className="app">
    <ScrollToTop />
    <Header />
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Footer />
  </div>
);

export default App;
