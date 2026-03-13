const Footer = () => (
  <footer className="bg-primary py-12">
    <div className="container">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-display font-bold text-primary-foreground">
            Vantage<span className="text-gold">.</span>
          </h3>
          <p className="text-primary-foreground/50 text-sm font-body mt-1">
            Psychosocial Risk Assessment for Creative Industries
          </p>
        </div>
        <div className="text-primary-foreground/40 text-xs font-body text-center md:text-right">
          <p>© {new Date().getFullYear()} Vantage Psychosocial Consulting. Melbourne, Australia.</p>
          <p className="mt-1">All data processed under Australian data sovereignty.</p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
