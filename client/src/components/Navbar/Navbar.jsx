import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutLocal } from "../../redux/auth/authSlice.js";
import NotificationBell from "../Notification/NotificationBell.jsx";

const dashboardPathByRole = {
  victim: "/victim",
  volunteer: "/volunteer",
  ngo: "/ngo",
  admin: "/admin",
};

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutLocal());
    navigate("/login");
  };

  const navLink =
    "whitespace-nowrap text-sm font-medium text-slate-600 transition-colors hover:text-teal-700";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-teal-700 text-xl text-white shadow-md">
            ✚
          </span>

          <span className="flex flex-col">
            <span className="font-display text-lg font-bold leading-tight tracking-tight text-slate-900">
              Jeevan <span className="text-teal-700">Link</span>
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-slate-500 sm:block">
              Emergency Response Network
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-5">
          <Link to="/relief-camps" className={navLink}>
            <span className="hidden sm:inline">Relief Camps</span>
            <span className="sm:hidden">Camps</span>
          </Link>

          <Link to="/resources" className={navLink}>
            Resources
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={dashboardPathByRole[user?.role] || "/"}
                className={navLink}
              >
                Dashboard
              </Link>

              <Link to="/profile" className={navLink}>
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Me</span>
              </Link>

              <Link to="/chat" className={navLink}>
                Chat
              </Link>

              <NotificationBell />

              <button
                type="button"
                onClick={handleLogout}
                className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLink}>
                Log in
              </Link>

              <Link
                to="/register"
                className="whitespace-nowrap rounded-lg bg-gradient-to-r from-slate-900 to-teal-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-4"
              >
                <span className="hidden sm:inline">Get Help / Join Us</span>
                <span className="sm:hidden">Get Help</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="h-[3px] w-full bg-gradient-to-r from-slate-900 via-teal-600 to-cyan-400" />
    </header>
  );
};

export default Navbar;