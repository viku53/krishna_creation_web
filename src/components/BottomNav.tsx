import { Home, Film, Camera, Video, ShoppingCart, Contact } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { trackBottomNavClick } from '../gtm';

const navLinks = [
  { to: '/', label: 'Home', icon: <Home size={24} /> },
  { to: '/reels', label: 'Reels', icon: <Film size={24} /> },
  { to: '/photos', label: 'Photos', icon: <Camera size={24} /> },
  { to: '/videos', label: 'Videos', icon: <Video size={24} /> },
  { to: '/instant-printing', label: 'Print', icon: <ShoppingCart size={24} /> },
  { to: '/contact', label: 'Contact', icon: <Contact size={24} /> },
];
interface BottomNavProps {
  scrollToTop: () => void;
}

/** Highlight matching top-level tab including product, checkout, and track-order sub-routes. */
function isRouteActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/';
  if (to === '/instant-printing') {
    return (
      pathname === '/instant-printing' ||
      pathname.startsWith('/instant-printing/') ||
      pathname === '/checkout' ||
      pathname === '/track-order'
    );
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function BottomNav({ scrollToTop }: BottomNavProps) {
  const location = useLocation();
  return (
    <nav className="nav--fixed" aria-label="Main navigation">
      {navLinks.map(link => {
        const isActive = isRouteActive(location.pathname, link.to);
        return (
          <Link
            key={link.to}
            to={link.to}
            aria-label={link.label}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => {
              trackBottomNavClick(link.label);
              setTimeout(scrollToTop, 100);
            }}
            className={`nav--item ${isActive ? 'nav--item__active' : ''}`}
          >
            <span className="nav--icon">{link.icon}</span>
            <span className="nav--text">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;
