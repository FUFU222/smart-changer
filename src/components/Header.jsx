import { Link } from 'react-router';

const Header = () => (
  <header className="site-header">
    <p className="site-header__title">
      <Link to="/">Smart Changer</Link>
    </p>
    <p className="site-header__lead">
      画像の形式とサイズをまとめて変換できます。画像はお使いのブラウザの中だけで処理され、外部には送信されません。
    </p>
  </header>
);

export default Header;
