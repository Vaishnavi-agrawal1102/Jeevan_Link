
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="mt-16 border-t-4 border-teal-600 bg-[#082F38] text-slate-300">
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

      {/* Main Footer */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

        {/* Brand Section */}
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-2xl font-bold text-white shadow-lg">
              +
            </div>

            <div>
              <p className="text-xl font-bold tracking-tight text-white">
                Jeevan <span className="text-teal-400">Link</span>
              </p>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">
                EMERGENCY RESPONSE NETWORK
              </p>
            </div>
          </Link>

          <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
            Connecting people, volunteers and NGOs through an integrated
            emergency response and disaster relief coordination platform.
            Bringing assistance closer to communities when it matters most.
          </p>

          <p className="mt-5 text-sm font-semibold text-teal-400">
            Connecting Help. Supporting Lives.
          </p>
        </div>

        {/* Platform Links */}
        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
            Platform
          </h3>

          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/relief-camps" className="transition-colors hover:text-teal-400">
                Relief Camps
              </Link>
            </li>
            <li>
              <Link to="/resources" className="transition-colors hover:text-teal-400">
                Relief Resources
              </Link>
            </li>
            <li>
              <Link to="/register" className="transition-colors hover:text-teal-400">
                Get Help
              </Link>
            </li>
          </ul>
        </div>

        {/* Information Links */}
        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
            Information
          </h3>

          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/about" className="transition-colors hover:text-teal-400">
                About Jeevan Link
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-teal-400">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Divider */}
      <div className="my-9 border-t border-white/10" />

      {/* Bottom Footer */}
      <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Jeevan Link. All rights reserved.
        </p>

        <p className="text-xs font-medium tracking-wide text-slate-400">
          EMERGENCY RESPONSE & RELIEF COORDINATION
        </p>
      </div>

    </div>
  </footer>
);

export default Footer;
