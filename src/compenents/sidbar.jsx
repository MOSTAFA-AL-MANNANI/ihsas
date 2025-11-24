import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faGraduationCap,
  faBuilding,
  faSignOutAlt,
  faBars,
  faTimes,
  faHome,
  faChartBar,
  faFilter,
  faExchangeAlt
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import axios from "axios";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      path: "/candidat",
      name: "Candidats",
      icon: faUsers,
      description: "Gérer les candidats"
    },
    {
      path: "/filiere",
      name: "Filières",
      icon: faGraduationCap,
      description: "Gérer les filières"
    },
    {
      path: "/center",
      name: "Centres",
      icon: faBuilding,
      description: "Gérer les centres"
    },
    {
      path: "/filter",
      name: "Changer Statut",
      icon: faExchangeAlt,
      description: "Modifier les statuts"
    },
    {
      path: "/candidatfilter",
      name: "Filtrer Candidats",
      icon: faFilter,
      description: "Filtrer les candidats"
    },
    {
      path: "/dashboard",
      name: "Statistiques",
      icon: faChartBar,
      description: "Statistiques et rapports"
    }
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e40af',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, se déconnecter',
      cancelButtonText: 'Annuler',
      background: '#f8fafc',
      customClass: {
        title: 'text-blue-800 font-bold text-xl',
        confirmButton: 'px-6 py-3 rounded-lg font-semibold',
        cancelButton: 'px-6 py-3 rounded-lg font-semibold'
      }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.post("https://ihsas-back.vercel.app/api/admin/logout", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        await Swal.fire({
          title: 'Déconnecté !',
          text: 'Vous avez été déconnecté avec succès',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#f8fafc'
        });
      } catch (err) { 
        console.error('Erreur de déconnexion:', err);
      } finally {
        localStorage.removeItem("adminToken");
        window.location.href = "/login";
      }
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-4 bg-blue-700 text-white rounded-2xl shadow-2xl hover:bg-blue-800 transition-all duration-300 transform hover:scale-110 border-2 border-white/20 backdrop-blur-sm"
      >
        <FontAwesomeIcon 
          icon={isOpen ? faTimes : faBars} 
          className="text-xl transition-transform duration-300" 
        />
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 animate-fade-in"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-80 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 shadow-2xl
        transform transition-all duration-500 ease-in-out
        ${isOpen ? 'translate-x-0 shadow-3xl' : '-translate-x-full lg:translate-x-0'}
        flex flex-col border-r border-blue-600/30
        backdrop-blur-lg
      `}>
        
        {/* En-tête et Logo */}
        <div className="p-8 ">
          <div className="flex items-center gap-4 animate-slide-in">
            <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center backdrop-blur-md  shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <img 
                src="/jadara.png" 
                alt="Jadara Logo" 
                className="w-12 h-12 object-contain filter drop-shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full items-center justify-center text-white font-bold text-lg">
                J
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-white truncate drop-shadow-lg">
                Admin Panel
              </h1>
              <p className="text-blue-200/90 text-sm font-medium truncate">
                Gestion des candidatures
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`group relative flex items-center gap-4 p-5 rounded-3xl transition-all duration-500 transform hover:scale-105 ${
                isActive(item.path)
                  ? "bg-white/25 text-white shadow-2xl scale-105 border-2 border-white/30" 
                  : "text-blue-100/90 hover:bg-white/15 hover:text-white hover:border-white/20 border-2 border-transparent"
              } animate-rise`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Fond animé */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r transition-all duration-500 ${
                isActive(item.path) 
                  ? 'from-white/20 to-white/10' 
                  : 'group-hover:from-white/15 group-hover:to-transparent'
              }`}></div>
              
              {/* Icône */}
              <div className={`relative z-10 p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 ${
                isActive(item.path) 
                  ? "bg-white/30 shadow-lg" 
                  : "bg-white/15 group-hover:bg-white/25"
              }`}>
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className="text-xl drop-shadow-lg" 
                />
              </div>
              
              {/* Texte */}
              <div className="relative z-10 flex-1 min-w-0">
                <span className="font-bold text-lg block leading-tight drop-shadow-lg">
                  {item.name}
                </span>
                <span className="text-blue-200/80 text-sm font-medium block leading-tight mt-1">
                  {item.description}
                </span>
              </div>

              {/* Indicateur actif */}
              {isActive(item.path) && (
                <div className="relative z-10">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping"></div>
                </div>
              )}

              {/* Effet de surbrillance au hover */}
              <div className="absolute inset-0 rounded-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
          ))}
        </nav>

        {/* Pied de page - Déconnexion */}
        <div className="p-6 border-t border-blue-600/30 bg-gradient-to-t from-blue-900/50 to-transparent">
          <button
            onClick={handleLogout}
            className="w-full group relative flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-r from-red-500/25 to-red-600/20 text-red-100 hover:from-red-600/35 hover:to-red-700/30 hover:text-white transition-all duration-500 transform hover:scale-105 border-2 border-red-500/30 hover:border-red-500/50 backdrop-blur-sm"
          >
            {/* Animation de fond */}
            <div className="absolute inset-0 rounded-3xl bg-red-500/10 group-hover:bg-red-500/20 transition-all duration-500"></div>
            
            {/* Icône */}
            <div className="relative z-10 p-3 rounded-2xl bg-red-500/40 group-hover:bg-red-500/60 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <FontAwesomeIcon 
                icon={faSignOutAlt} 
                className="text-xl drop-shadow-lg" 
              />
            </div>
            
            {/* Texte */}
            <div className="relative z-10 flex-1 text-left">
              <span className="font-bold text-lg block leading-tight drop-shadow-lg">
                Déconnexion
              </span>
              <span className="text-red-200/80 text-sm font-medium block leading-tight mt-1">
                Se déconnecter du panel
              </span>
            </div>

            {/* Effet de pulsation */}
            <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            </div>
          </button>

          {/* Version de l'application */}
          <div className="mt-4 text-center">
            <span className="text-blue-300/60 text-xs font-medium">
              Version 1.0.0
            </span>
          </div>
        </div>
      </div>

      {/* Styles d'animation personnalisés */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in {
          from { 
            opacity: 0; 
            transform: translateX(-20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0) scale(1); 
          }
        }
        @keyframes rise {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        .animate-rise {
          animation: rise 0.6s ease-out both;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default Sidebar;