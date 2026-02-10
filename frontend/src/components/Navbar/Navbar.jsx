import icon from "../../assets/icon.svg";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext";
import { useContext, useState } from "react";

function Navbar() {
  const { loggedInUser, setLoggedInUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  function handleLogOut() {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
    setIsDropdownOpen(false);
    navigate("/login");
  }

  function toggleDropdown(event) {
    event.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-bg-sidebar fixed top-0 left-0 right-0 z-50 h-16 border-b border-border-subtle">
      <div className="flex items-center justify-between h-full px-xl max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-sm">
          <img className="w-8 h-8" src={icon} alt="Finance Planner" />
          <span className="text-h2 text-accent-primary font-bold">FinTrack</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-lg">
          {!loggedInUser ? (
            <>
              <Link
                to="/sign-up"
                className="text-nav text-text-secondary hover:text-text-primary transition-colors"
              >
                Create account
              </Link>
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`text-nav transition-colors ${
                  isActive("/")
                    ? "text-text-primary font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Home
              </Link>
              <Link
                to="/transactions"
                className={`text-nav transition-colors ${
                  isActive("/transactions")
                    ? "text-text-primary font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Transactions
              </Link>
              <Link
                to="/charts"
                className={`text-nav transition-colors ${
                  isActive("/charts")
                    ? "text-text-primary font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Charts
              </Link>
              <Link
                to="/import"
                className={`text-nav transition-colors ${
                  isActive("/import")
                    ? "text-text-primary font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Import
              </Link>
              <Link
                to="/import/queue"
                className={`text-nav transition-colors ${
                  isActive("/import/queue") || location.pathname.startsWith("/import/review")
                    ? "text-text-primary font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Queue
              </Link>
              <Link
                to="/import/history"
                className={`text-nav transition-colors ${
                  isActive("/import/history")
                    ? "text-text-primary font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Imported
              </Link>

              <Link
                to="/tagging-rules"
                className={`text-nav transition-colors ${
                  isActive("/tagging-rules")
                    ? "text-text-primary font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Rules
              </Link>

              {/* User dropdown */}
              <div className="relative ml-lg">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-sm focus:outline-none"
                >
                  <img
                    className="w-10 h-10 rounded-full object-cover border-2 border-border-subtle hover:border-accent-purple transition-colors"
                    src={
                      loggedInUser?.profileImage ||
                      "https://res.cloudinary.com/dcj6uxtqe/image/upload/v1729036082/profpic_htzaix.jpg"
                    }
                    alt="Profile"
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-sm w-48 bg-bg-card rounded-card shadow-lg border border-border-subtle animate-fade-in">
                    <div className="py-sm">
                      <Link
                        to="/profile"
                        className="block px-lg py-md text-body text-text-primary hover:bg-bg-nav-hover transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogOut}
                        className="w-full text-left px-lg py-md text-body text-text-outcome hover:bg-bg-nav-hover transition-colors"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
