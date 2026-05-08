export default function SiteFooter() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-cols">
        <div>
          <h4>контакти</h4>
          <address>
            email: <a href="mailto:hello@plant-care-hub.test">hello@plant-care-hub.test</a>
          </address>
        </div>
        <div>
          <h4>посилання</h4>
          <ul>
            <li><a href="/catalog">каталог</a></li>
            <li><a href="/community">спільнота</a></li>
          </ul>
        </div>
      </div>
      <p className="copyright">© 2026 plant-care-hub</p>
    </footer>
  );
}
