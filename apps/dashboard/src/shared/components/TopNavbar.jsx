
import React from "react";
import { motion } from "framer-motion";
import { Search, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { globalSearchAPI } from "../../services/globalSearchAPI";
import { useNavigate } from "react-router-dom";

const TopNavbar = ({ user, isCollapsed }) => {

  const { logout } = useAuth();
  const [search, setSearch] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = React.useState(false);
  const [showNotif, setShowNotif] = React.useState(false);
  const [showUser, setShowUser] = React.useState(false);
  const [pendingAdmins, setPendingAdmins] = React.useState([]);
  const [notifLoading, setNotifLoading] = React.useState(false);
  const notifRef = React.useRef();
  const userRef = React.useRef();
  const left = isCollapsed ? 128 : 336;
  const navigate = useNavigate();

  // Fetch pending admin approvals (most recent 4)
  const fetchPendingAdmins = async () => {
    setNotifLoading(true);
    try {
      const token = localStorage.getItem("alertx_admin_token");
      const res = await fetch("http://localhost:5000/api/v1/auth/admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingAdmins((data.data?.admins || []).slice(0, 4));
      } else {
        setPendingAdmins([]);
      }
    } catch {
      setPendingAdmins([]);
    } finally {
      setNotifLoading(false);
    }
  };

  // Fetch on dropdown open
  React.useEffect(() => {
    if (showNotif) fetchPendingAdmins();
  }, [showNotif]);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Search handler (replace with real search logic)
  // Real API call for global search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    setSearchLoading(true);
    setShowSearchDropdown(true);
    try {
      const data = await globalSearchAPI.search(search.trim());
      setSearchResults(data.results || []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Hide dropdown on blur
  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchDropdown(false), 150);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20, left }}
      animate={{ opacity: 1, y: 0, left }}
      transition={{ delay: 0.2, duration: 0.3 }}
      style={{ left, right: 32, position: 'fixed', top: 16, zIndex: 30 }}
      className="rounded-2xl border border-blue-100/60 bg-gradient-to-r from-white/70 via-blue-50/80 to-teal-50/80 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo/Brand */}
        <div className="flex items-center min-w-[180px] pl-2">
          <div className="flex items-center gap-2">
            {/* Medical cross icon */}
            <svg
              className="w-8 h-8 opacity-90"
              viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="25" y="5" width="10" height="50" rx="4" fill="#38bdf8"/>
              <rect x="5" y="25" width="50" height="10" rx="4" fill="#38bdf8"/>
              <rect x="27" y="7" width="6" height="46" rx="3" fill="#0ea5e9"/>
              <rect x="7" y="27" width="46" height="6" rx="3" fill="#0ea5e9"/>
            </svg>
            <h1 className="font-extrabold text-3xl tracking-tight text-blue-700 font-display select-none drop-shadow-sm pr-4 letter-spacing-wide">
              A&nbsp;l&nbsp;e&nbsp;r&nbsp;t&nbsp;<span className="text-teal-500">X</span>
            </h1>
          </div>
        </div>

        {/* Center: Search */}
        <form onSubmit={handleSearch} className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (e.target.value.trim()) setShowSearchDropdown(true);
                else setShowSearchDropdown(false);
              }}
              onFocus={() => { if (search.trim()) setShowSearchDropdown(true); }}
              onBlur={handleSearchBlur}
              placeholder="Search hospitals, patients, or emergencies..."
              className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pr-4 pl-12 font-sans text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              autoComplete="off"
            />
            {/* Search Results Dropdown */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 mt-2 z-40 rounded-xl border border-blue-100 bg-white shadow-2xl">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <ul className="divide-y divide-blue-50">
                    {searchResults.map(result => (
                      <li key={result.id}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors text-gray-800 focus:bg-blue-100 outline-none"
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setSearch("");
                            if (result.link) navigate(result.link);
                          }}
                        >
                          <span className="font-semibold text-blue-700 mr-2">[{result.type}]</span>
                          {result.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : search.trim() ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No results found</div>
                ) : null}
              </div>
            )}
          </div>
        </form>

        {/* Right: Notifications & User */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative rounded-xl p-3 transition-colors hover:bg-gray-100"
              onClick={() => setShowNotif(v => !v)}
            >
              <Bell className="h-5 w-5 text-gray-700" />
            </motion.button>
            {showNotif && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-80 rounded-2xl border border-blue-100 bg-white shadow-2xl z-50">
                {/* Arrow pointer */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 overflow-hidden">
                  <div className="w-6 h-6 bg-white border-l border-t border-blue-100 rotate-45 shadow-md"></div>
                </div>
                {/* Arrow pointer */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 overflow-hidden">
                  <div className="w-6 h-6 bg-white border-l border-t border-blue-100 rotate-45 shadow-md"></div>
                </div>
                <div className="p-3 font-semibold text-blue-700 border-b border-blue-50">Pending Admin Approvals</div>
                {notifLoading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                ) : pendingAdmins.length > 0 ? (
                  <ul className="max-h-60 overflow-y-auto divide-y divide-blue-50">
                    {pendingAdmins.map((admin) => (
                      <li key={admin._id}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer flex flex-col focus:outline-none focus:bg-blue-100 rounded"
                          onClick={() => window.location.href = '/dashboard/controls?section=users&tab=pending'}
                        >
                          <span className="font-semibold text-blue-700">{admin.name}</span>
                          <span className="text-xs text-gray-500">{admin.email}</span>
                          <span className="text-xs text-gray-400">Requested: {new Date(admin.createdAt).toLocaleString()}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-sm text-gray-500">No pending admin approvals</div>
                )}
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={userRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-xl px-4 py-2 transition-colors hover:bg-gray-100"
              onClick={() => setShowUser(v => !v)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-teal-500">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="font-sans text-sm font-medium text-gray-900">{user?.name || "Admin User"}</span>
            </motion.button>
            {showUser && (
              <div
                className="absolute left-1/2 mt-2 w-56 rounded-xl border border-blue-100 bg-white shadow-xl z-50 focus:outline-none -translate-x-1/2"
                tabIndex={-1}
                role="menu"
                aria-label="User menu"
              >
                {/* Arrow */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 overflow-hidden">
                  <div className="w-6 h-6 bg-white border-l border-t border-blue-100 rotate-45 shadow-md"></div>
                </div>
                <div className="p-4 border-b border-blue-50">
                  <div className="font-semibold text-gray-900">{user?.name || "Admin User"}</div>
                  <div className="text-xs text-gray-600">{user?.role || "Administrator"}</div>
                </div>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-red-600 hover:bg-red-50 font-semibold rounded-b-xl focus:outline-none focus:bg-red-100"
                  tabIndex={0}
                  role="menuitem"
                  aria-label="Log out"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { logout(); } }}
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default TopNavbar;
