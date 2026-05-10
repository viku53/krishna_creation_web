import { Home, Film, Camera, Video, ShoppingCart, Contact } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
function BottomNav({ scrollToTop }: BottomNavProps) {
  const location = useLocation();
  return (
    <nav className="nav--fixed">
      {navLinks.map(link => (
        <Link
          key={link.to}
          to={link.to}
          onClick={() => { setTimeout(scrollToTop, 100); }}
          className={`group flex flex-col items-center justify-center flex-1 nav--item ${location.pathname === link.to ? 'nav--item__active' : 'text-gray-500 hover:text-rose-400'} transition-all`}
        >
          {link.icon}
          <span className="nav--text hidden group-hover:block">{link.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
