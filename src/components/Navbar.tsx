import React from 'react';
import { Home, Camera, Video, ShoppingCart, Contact, Film } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home', icon: <Home size={20}/> },
  { to: '/reels', label: 'Reels', icon: <Film size={20}/> },
  { to: '/photos', label: 'Photos', icon: <Camera size={20}/> },
  { to: '/videos', label: 'Videos', icon: <Video size={20}/> },
  { to: '/instant-printing', label: 'Print', icon: <ShoppingCart size={20}/> },
  { to: '/contact', label: 'Contact', icon: <Contact size={20}/> },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="navbar flex justify-between items-center px-4 py-2 bg-white shadow-sm rounded-b-xl sticky top-0 z-50">
      <div className="font-bold text-xl tracking-tight text-dark-gray">Krishna Creation</div>
      <div className="navbar-links flex gap-4 sm:gap-6">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-gray-700 hover:text-black transition-all ${location.pathname === link.to ? 'bg-light-gray font-bold' : ''}`}
          >
            {link.icon} <span className="hidden sm:inline">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
