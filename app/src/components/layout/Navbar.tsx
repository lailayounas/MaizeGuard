import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Chatbot', path: '/chatbot' },
    { name: 'History', path: '/history' },
    { name: 'App', path: '/app' },
  ];

  if (profile?.role === 'admin') {
    navLinks.push({ name: 'Admin', path: '/admin' });
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Top Navbar */}
      <nav className="md:hidden sticky top-0 z-50 w-full border-b border-emerald-900/20 bg-emerald-950 text-white backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-emerald-100 transition-colors">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Maize Guard</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-emerald-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-emerald-950 flex-col border-r border-emerald-900/20 h-full">
        <div className="p-6 flex items-center space-x-3">
          <Link to="/" className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Maize Guard</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navLinks.map((link) => {
            const isLinkActive = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                  isLinkActive
                    ? 'bg-emerald-800/50 text-emerald-100 border border-emerald-700/50'
                    : 'text-emerald-300 hover:bg-emerald-800/30'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto mb-4 border-t border-emerald-900/50 pt-6">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2 text-white">
                <div className="w-8 h-8 rounded-full border border-emerald-500 bg-emerald-800 flex items-center justify-center shrink-0">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span className="text-sm truncate w-full">{user.email}</span>
              </div>
              <Button onClick={signOut} className="w-full bg-emerald-800 hover:bg-emerald-700 text-white border-0 gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/login" className="block">
               <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-0">Log In</Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-16 left-0 right-0 z-40 bg-emerald-950 border-b border-emerald-900/20 shadow-xl overflow-hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-base font-medium ${
                    isActive(link.path)
                      ? 'bg-emerald-800/50 text-emerald-100 border border-emerald-700/50'
                      : 'text-emerald-300 hover:bg-emerald-800/30'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-6 pt-6 border-t border-emerald-900/50">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                       <div className="w-8 h-8 rounded-full border border-emerald-500 bg-emerald-800 flex items-center justify-center text-white shrink-0">
                         <UserIcon className="h-4 w-4" />
                       </div>
                       <span className="text-sm font-medium text-white truncate">{user.email}</span>
                    </div>
                    <Button className="w-full justify-start gap-2 bg-emerald-800 text-white hover:bg-emerald-700 border-0" onClick={() => { signOut(); setIsMobileMenuOpen(false); }}>
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-0">Log In / Register</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
