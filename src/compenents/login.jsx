import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Import FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEnvelope, 
  faLock, 
  faSignInAlt, 
  faShieldAlt,
  faUserShield,
  faRocket
} from "@fortawesome/free-solid-svg-icons";


export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


    useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      navigate("/candidat");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("https://ihsas-back.vercel.app/api/admin/login", { 
        email, 
        password 
      });
      
      const { token } = res.data;

      // حفظ الـ JWT في localStorage
      localStorage.setItem("adminToken", token);

      // عرض رسالة نجاح
      await Swal.fire({
        icon: 'success',
        title: 'Connexion Réussie!',
        text: 'Bienvenue dans votre espace administrateur',
        confirmButtonColor: '#2563eb',
        background: '#f8fafc',
        timer: 2000,
        showConfirmButton: true,
        timerProgressBar: true
      });

      // إعادة التوجيه إلى صفحة المترشحين
      navigate("/candidat");

    } catch (err) {
      console.error(err);
      
      let errorMessage = "Erreur lors de la connexion.";
      
      if (err.response) {
        errorMessage = err.response.data.message || "Identifiants incorrects.";
      } else if (err.request) {
        errorMessage = "Erreur de réseau. Vérifiez votre connexion.";
      }

      await Swal.fire({
        icon: 'error',
        title: 'Erreur de Connexion',
        text: errorMessage,
        confirmButtonColor: '#dc2626',
        background: '#f8fafc',
        confirmButtonText: 'Réessayer'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-amber-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header avec Logo et Titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="w-20 h-20  rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <img src="jadara.png" alt="" />
              </div>
              <div className="absolute -inset-3 bg-amber-400 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 animate-pulse"></div>
              <div className="absolute -inset-1 bg-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent mb-3">
            Espace Admin
          </h1>
          <p className="text-gray-600 text-lg">
            Accédez à votre dashboard administrateur
          </p>
        </div>

        {/* Formulaire de Connexion */}
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-blue-100 hover:shadow-2xl transition-all duration-500">
          <div className="space-y-6">
            {/* Champ Email */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-1 flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-blue-600 text-sm" />
                Adresse Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-gray-300 rounded-2xl p-4 pl-12 w-full focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 bg-white/50 backdrop-blur-sm"
                  required
                  disabled={isLoading}
                />
                <FontAwesomeIcon 
                  icon={faEnvelope} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 group-hover:text-amber-500 transition-colors duration-300" 
                />
              </div>
            </div>

            {/* Champ Mot de Passe */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-1 flex items-center gap-2">
                <FontAwesomeIcon icon={faLock} className="text-blue-600 text-sm" />
                Mot de Passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border border-gray-300 rounded-2xl p-4 pl-12 w-full focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 bg-white/50 backdrop-blur-sm"
                  required
                  disabled={isLoading}
                />
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 group-hover:text-amber-500 transition-colors duration-300" 
                />
              </div>
            </div>

            {/* Bouton de Connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg group relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <FontAwesomeIcon 
                  icon={isLoading ? faRocket : faSignInAlt} 
                  className={`${isLoading ? 'animate-bounce' : 'group-hover:scale-110'} transition-transform duration-300`} 
                />
                {isLoading ? 'Connexion en cours...' : 'Se Connecter'}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Effet de chargement */}
              {isLoading && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400 animate-pulse"></div>
              )}
            </button>
          </div>

          {/* Informations de Sécurité */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Sécurité</p>
                <p className="text-xs text-blue-600">
                  Votre session sera sécurisée et cryptée. Déconnectez-vous après utilisation.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faShieldAlt} className="text-amber-500" />
            Accès réservé aux administrateurs autorisés
          </p>
        </div>

        {/* Effets de fond décoratifs */}
        <div className="fixed top-10 left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="fixed bottom-10 right-10 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Styles d'animation personnalisés */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}