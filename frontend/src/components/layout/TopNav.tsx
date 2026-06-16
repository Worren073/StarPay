import { useState, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import { adminNavItems, athleteNavItems } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import useNotifications from '../../hooks/useNotifications';
import { AnimatePresence, motion } from 'framer-motion';

export default function TopNav() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifClosing, setNotifClosing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsClosing, setSettingsClosing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifAnimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsAnimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeNotif = useCallback(() => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotifClosing(true);
    setNotifOpen(false);
    notifAnimTimer.current = setTimeout(() => setNotifClosing(false), 200);
  }, []);

  const closeSettings = useCallback(() => {
    if (settingsTimer.current) clearTimeout(settingsTimer.current);
    setSettingsClosing(true);
    setSettingsOpen(false);
    settingsAnimTimer.current = setTimeout(() => setSettingsClosing(false), 200);
  }, []);

  const openNotif = useCallback(() => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    if (settingsOpen) closeSettings();
    setNotifOpen(true);
    setNotifClosing(false);
  }, [settingsOpen, closeSettings]);

  const openSettings = useCallback(() => {
    if (settingsTimer.current) clearTimeout(settingsTimer.current);
    if (notifOpen) closeNotif();
    setSettingsOpen(true);
    setSettingsClosing(false);
  }, [notifOpen, closeNotif]);

  const handleNotifEnter = useCallback(() => openNotif(), [openNotif]);
  const handleNotifLeave = useCallback(() => {
    notifTimer.current = setTimeout(() => closeNotif(), 1000);
  }, [closeNotif]);

  const handleSettingsEnter = useCallback(() => openSettings(), [openSettings]);
  const handleSettingsLeave = useCallback(() => {
    settingsTimer.current = setTimeout(() => closeSettings(), 1000);
  }, [closeSettings]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
    if (notifOpen) closeNotif();
    if (settingsOpen) closeSettings();
  }, [notifOpen, settingsOpen, closeNotif, closeSettings]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const notifVisible = notifOpen || notifClosing;
  const settingsVisible = settingsOpen || settingsClosing;
  const notifAnimClass = notifClosing ? 'dropdown-animate-out' : 'dropdown-animate-in';
  const settingsAnimClass = settingsClosing ? 'dropdown-animate-out' : 'dropdown-animate-in';

  return (
    <>
      <style>{`
        .dropdown-animate-in {
          animation: slideDown 200ms ease-out forwards;
        }
        .dropdown-animate-out {
          animation: slideUp 200ms ease-in forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scaleY(0.95); }
          to { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        @keyframes slideUp {
          from { opacity: 1; transform: translateY(0) scaleY(1); }
          to { opacity: 0; transform: translateY(-8px) scaleY(0.95); }
        }
      `}</style>

      {/* Desktop TopNav */}
      <nav className={`hidden md:flex fixed top-4 right-4 left-24 h-16 rounded-xl backdrop-blur-md border shadow-lg font-montserrat items-center justify-between px-gutter w-auto z-40 ml-4 transition-all duration-200 ${
        isDark
          ? 'bg-white/5 border-white/10 text-primary'
          : 'bg-white/60 border-black/10 text-primary'
      }`}>
        <div className="flex items-center gap-4">
          <span className="font-montserrat font-bold text-xl text-primary">StarPay</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div
            className="relative"
            onMouseEnter={handleNotifEnter}
            onMouseLeave={handleNotifLeave}
          >
            <button className="text-on-surface-variant hover:text-primary-fixed-dim transition-colors relative p-2">
              <Icon name="notifications" className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              )}
            </button>
            {notifVisible && (
              <div
                className={`absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl border ${
                  isDark
                    ? 'bg-black/60 border-white/10'
                    : 'bg-white/80 border-black/10'
                } ${notifAnimClass}`}
                onMouseEnter={handleNotifEnter}
                onMouseLeave={handleNotifLeave}
              >
                <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  <h3 className="font-montserrat text-sm font-semibold text-on-surface">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:text-primary/80 font-inter transition-colors"
                    >
                      Marcar todo leído
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-sm text-on-surface-variant font-inter">Sin notificaciones</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                        className={`p-3 border-b cursor-pointer ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-black/5'} transition-colors ${
                          !notif.is_read ? (isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]') : ''
                        }`}
                      >
                        <p className="text-sm text-on-surface font-inter">{notif.title}</p>
                        <p className="text-xs text-on-surface-variant mt-1 font-inter">{notif.message}</p>
                        <p className="text-xs text-on-surface-variant/60 mt-0.5 font-inter">
                          {new Date(notif.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div
            className="relative"
            onMouseEnter={handleSettingsEnter}
            onMouseLeave={handleSettingsLeave}
          >
            <button className="text-on-surface-variant hover:text-primary-fixed-dim transition-colors p-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {settingsVisible && (
              <div
                className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl border ${
                  isDark
                    ? 'bg-black/60 border-white/10'
                    : 'bg-white/80 border-black/10'
                } ${settingsAnimClass}`}
                onMouseEnter={handleSettingsEnter}
                onMouseLeave={handleSettingsLeave}
              >
                <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  <h3 className="font-montserrat text-sm font-semibold text-on-surface">Configuración</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isDark ? (
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386-6.364l-1.591 1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                      )}
                      <span className="text-sm text-on-surface font-inter">Modo {isDark ? 'oscuro' : 'claro'}</span>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        isDark ? 'bg-primary' : 'bg-surface-variant'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          isDark ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className={`pt-3 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                    <p className="text-xs text-on-surface-variant font-inter">Sesión</p>
                    <p className="text-sm text-on-surface font-inter mt-1">{user?.email}</p>
                    <button
                      onClick={logout}
                      className="mt-3 w-full text-sm text-error hover:text-error/80 font-inter transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full bg-surface-container overflow-hidden border flex items-center justify-center bg-surface-container-high ${isDark ? 'border-white/10' : 'border-black/10'}`}>
            <Icon name="person" className="w-6 h-6 text-on-surface-variant" />
          </div>
        </div>
      </nav>

      {/* Mobile TopNav */}
      <nav className={`flex md:hidden fixed top-0 left-0 right-0 h-16 backdrop-blur-md border-b shadow-lg font-montserrat items-center justify-between px-4 z-50 ${
        isDark
          ? 'bg-background/95 border-white/10'
          : 'bg-white/95 border-black/10'
      }`}>
        <div className="flex items-center gap-3">
          {/* Hamburger Menu */}
          <button
            onClick={toggleMobileMenu}
            className="text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <span className="font-montserrat font-bold text-lg text-primary">StarPay</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <button
            onClick={() => { openNotif(); closeSettings(); }}
            className="text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-white/10 transition-colors relative"
          >
            <Icon name="notifications" className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => { openSettings(); closeNotif(); }}
            className="text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Icon name="settings" className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Notifications Dropdown */}
      <AnimatePresence>
        {notifOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed md:hidden top-16 left-4 right-4 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl border ${
              isDark ? 'bg-black/90 border-white/10' : 'bg-white/95 border-black/10'
            }`}
          >
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-black/10'}`}>
              <h3 className="font-montserrat text-sm font-semibold text-on-surface">Notificaciones</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 font-inter"
                  >
                    Leer todo
                  </button>
                )}
                <button
                  onClick={closeNotif}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-white/10"
                >
                  <Icon name="cancel" className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-on-surface-variant font-inter">Sin notificaciones</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                    className={`p-3 border-b cursor-pointer ${isDark ? 'border-white/5' : 'border-black/5'} ${
                      !notif.is_read ? (isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]') : ''
                    }`}
                  >
                    <p className="text-sm text-on-surface font-inter">{notif.title}</p>
                    <p className="text-xs text-on-surface-variant mt-1 font-inter">{notif.message}</p>
                    <p className="text-xs text-on-surface-variant/60 mt-0.5 font-inter">
                      {new Date(notif.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Settings Dropdown */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed md:hidden top-16 left-4 right-4 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl border ${
              isDark ? 'bg-black/90 border-white/10' : 'bg-white/95 border-black/10'
            }`}
          >
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-black/10'}`}>
              <h3 className="font-montserrat text-sm font-semibold text-on-surface">Configuración</h3>
              <button
                onClick={closeSettings}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-white/10"
              >
                <Icon name="cancel" className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386-6.364l-1.591 1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  )}
                  <span className="text-sm text-on-surface font-inter">Modo {isDark ? 'oscuro' : 'claro'}</span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isDark ? 'bg-primary' : 'bg-surface-variant'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      isDark ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className={`pt-3 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                <p className="text-xs text-on-surface-variant font-inter">Sesión</p>
                <p className="text-sm text-on-surface font-inter mt-1">{user?.email}</p>
                <button
                  onClick={logout}
                  className="mt-3 w-full text-sm text-error hover:text-error/80 font-inter transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 left-0 bottom-0 w-72 z-50 md:hidden backdrop-blur-2xl border-r shadow-2xl ${
                isDark ? 'bg-background/95 border-white/10' : 'bg-white/95 border-black/10'
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-surface-container flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-7 h-7">
                    <defs>
                      <linearGradient id="starGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <path d="M50 15 L58 35 L80 35 L62 48 L70 70 L50 56 L30 70 L38 48 L20 35 L42 35 Z" fill="url(#starGradMobile)" />
                    <path d="M20 85 Q50 75 80 85" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-montserrat text-sm font-bold text-primary">StarPay</h2>
                  <p className="text-xs text-on-surface-variant">Elite Performance</p>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="ml-auto text-on-surface-variant hover:text-on-surface p-2 rounded-lg hover:bg-white/10"
                >
                  <Icon name="cancel" className="w-5 h-5" />
                </button>
              </div>

              {/* Nav Items */}
              <nav className="flex flex-col gap-1 p-3">
                {(user?.role === 'athlete' ? athleteNavItems : adminNavItems).map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isActive
                          ? 'text-primary font-bold bg-white/10'
                          : 'text-on-surface-variant hover:bg-white/10 hover:text-primary'
                      }`}
                    >
                      <Icon name={item.icon} className="w-5 h-5" solid={isActive} />
                      <span className="font-inter text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="mt-auto p-3 border-t border-white/10">
                <button
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:bg-white/10 hover:text-primary transition-colors w-full"
                >
                  <Icon name="logout" className="w-5 h-5" />
                  <span className="font-inter text-sm">Cerrar sesión</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
