import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faGraduationCap,
  faBuilding,
  faSignOutAlt,
  faBars,
  faTimes,
  faHome
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: "/candidat",
      name: "Candidats",
      icon: faUsers,
      protected: true
    },
    {
      path: "/filiere",
      name: "Filières",
      icon: faGraduationCap,
      protected: false
    },
    {
      path: "/center",
      name: "Centres",
      icon: faBuilding,
      protected: false
    }
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, se déconnecter',
      cancelButtonText: 'Annuler',
      background: '#f8fafc'
    });

    if (result.isConfirmed) {
      try {
        await axios.post("http://localhost:3000/api/admin/logout", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) { 
        console.error(err);
      } finally {
        localStorage.removeItem("adminToken");
        window.location.href = "/login";
      }
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-blue-700 text-white rounded-2xl shadow-2xl hover:bg-blue-800 transition-all duration-300 transform hover:scale-110"
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="text-xl" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-80 bg-gradient-to-b from-blue-700 to-blue-800 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        
        {/* Logo and Header */}
        <div className="p-6 border-b border-blue-600/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <img 
                src="/jadara.png" 
                alt="Jadara Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Admin Panel</h1>
              <p className="text-blue-200 text-sm">Gestion des candidatures</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-6 space-y-3">
          {/* Home Link */}
          {/* <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
              location.pathname === "/" 
                ? "bg-white/20 text-white shadow-lg" 
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${
              location.pathname === "/" ? "bg-white/20" : "bg-white/10"
            }`}>
              <FontAwesomeIcon icon={faHome} className="text-lg" />
            </div>
            <span className="font-semibold text-lg">Accueil</span>
          </Link> */}

          {/* Main Menu Items */}
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                isActive(item.path)
                  ? "bg-white/20 text-white shadow-lg transform scale-105" 
                  : "text-blue-100 hover:bg-white/10 hover:text-white hover:transform hover:scale-105"
              }`}
            >
              <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                isActive(item.path) ? "bg-white/20" : "bg-white/10"
              }`}>
                <FontAwesomeIcon icon={item.icon} className="text-lg" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-lg">{item.name}</span>
              </div>
              {isActive(item.path) && (
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer with Logout */}
        <div className="p-6 border-t border-blue-600/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/20 text-red-100 hover:bg-red-500/30 hover:text-white transition-all duration-300 transform hover:scale-105 group"
          >
            <div className="p-3 rounded-xl bg-red-500/30 group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
            <span className="font-semibold text-lg">Déconnexion</span>
          </button>

        </div>
      </div>
    </>
  );
};

export default Sidebar;