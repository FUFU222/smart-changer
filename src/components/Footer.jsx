import { Link } from 'react-router';

const Footer = () => (
  <footer className="site-footer">
    <ul>
      <li>
        <Link to="/privacy-policy">プライバシーポリシー</Link>
      </li>
      <li>
        <Link to="/terms-of-service">利用規約</Link>
      </li>
    </ul>
    <p className="copyright">Copyright © 2024 FUFU. All Rights Reserved.</p>
  </footer>
);

export default Footer;
