import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Import FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faLink, 
  faFilePdf, 
  faPaperPlane,
  faBuilding,
  faRocket
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";

export default function Add() {
  const [fullName, setFullName] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [cv, setCv] = useState(null);
  const [cover, setCover] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filieres, setFilieres] = useState([]);
const [centers, setCenters] = useState([]);

const [filiere, setFiliere] = useState("");
const [center, setCenter] = useState("");

useEffect(() => {
  const loadData = async () => {
    const f = await axios.get("https://ihsas-back.vercel.app/api/filiere");
    const c = await axios.get("https://ihsas-back.vercel.app/api/center");
    setFilieres(f.data);
    setCenters(c.data);
  };

  loadData();
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("linkedin", linkedin);
      formData.append("portfolio", portfolio);
      formData.append("filiere", filiere);
      formData.append("center", center);

      if (cv) formData.append("cv", cv);
      if (cover) formData.append("cover", cover);

      const res = await axios.post("https://ihsas-back.vercel.app/api/candidat/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await Swal.fire({
        icon: 'success',
        title: 'Succès!',
        text: res.data.message,
        confirmButtonColor: '#2563eb',
        background: '#f8fafc',
        timer: 3000,
        showConfirmButton: true
      });

      // Reset form
      setFullName("");
      setLinkedin("");
      setPortfolio("");
      setCv(null);
      setCover(null);
      document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
      
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de l\'envoi des données.',
        confirmButtonColor: '#dc2626',
        background: '#f8fafc'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-start py-8 px-4">
      {/* Header avec Logos */}
      <div className="w-full max-w-4xl mb-12">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 lg:gap-24 mb-8">
          {/* Logo Jadara */}
          <div className="group flex items-center gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-blue-100">
            <div className="relative">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <img src="jadara.png" alt="" />
              </div>
              <div className="absolute -inset-2 bg-blue-600 rounded-full opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-700 font-bold text-xl tracking-tight">Jadara</span>
              <span className="text-blue-600 text-sm opacity-80">Fondation</span>
            </div>
          </div>
        </div>

        {/* Titre Principal */}
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent mb-4">
            Rejoignez Notre Équipe
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Postulez dès maintenant et participez à des projets innovants avec Jadara Fondation
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-blue-100 hover:shadow-2xl transition-all duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <FontAwesomeIcon icon={faUser} className="text-blue-600" />
            Ajouter un Candidat
          </h2>
          <p className="text-gray-600">Remplissez le formulaire ci-dessous pour postuler</p>
        </div>

        <div className="space-y-6">
          {/* Champ Nom Complet */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
              Nom Complet *
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faUser} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 group-hover:text-amber-500 transition-colors duration-300" 
              />
              <input
                type="text"
                placeholder="Votre nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border border-gray-300 rounded-2xl p-4 pl-12 w-full focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 bg-white/50 backdrop-blur-sm"
                required
              />
            </div>
          </div>

          
          {/* Select Filiere */}
<div className="group">
  <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
    Choisir la Filière *
  </label>
  <div className="relative">
    <FontAwesomeIcon 
      icon={faRocket} 
      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 transition-colors duration-300" 
    />
    <select
      value={filiere}
      onChange={(e) => setFiliere(e.target.value)}
      required
      className="border border-gray-300 rounded-2xl p-4 pl-12 w-full bg-white/50 backdrop-blur-sm 
      focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 
      hover:border-blue-400 transition-all duration-300"
    >
      <option value="">-- Sélectionner la filière --</option>
      {filieres.map(f => (
        <option key={f._id} value={f._id}>{f.name}</option>
      ))}
    </select>
  </div>
</div>

{/* Select Center */}
<div className="group">
  <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
    Choisir le Centre *
  </label>
  <div className="relative">
    <FontAwesomeIcon 
      icon={faBuilding} 
      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 transition-colors duration-300" 
    />
    <select
      value={center}
      onChange={(e) => setCenter(e.target.value)}
      required
      className="border border-gray-300 rounded-2xl p-4 pl-12 w-full bg-white/50 backdrop-blur-sm 
      focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 
      hover:border-blue-400 transition-all duration-300"
    >
      <option value="">-- Sélectionner le centre --</option>
      {centers.map(c => (
        <option key={c._id} value={c._id}>{c.name}</option>
      ))}
    </select>
  </div>
</div>


          {/* Champ CV */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
              Curriculum Vitae (CV) (PDF) *
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faFilePdf} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 group-hover:text-amber-500 transition-colors duration-300 z-10" 
              />
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setCv(e.target.files[0])}
                className="border border-gray-300 rounded-2xl p-4 pl-12 w-full focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 bg-white/50 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Champ Lettre de Motivation */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
              Lettre de Motivation (PDF) *
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faFilePdf} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 group-hover:text-amber-500 transition-colors duration-300 z-10" 
              />
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setCover(e.target.files[0])}
                className="border border-gray-300 rounded-2xl p-4 pl-12 w-full focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 bg-white/50 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Champ LinkedIn */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
              LinkedIn *
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faLinkedin} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 group-hover:text-amber-500 transition-colors duration-300" 
              />
              <input
                type="url"
                placeholder="https://linkedin.com/in/votre-profil"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="border border-gray-300 rounded-2xl p-4 pl-12 w-full focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 bg-white/50 backdrop-blur-sm"
                required
              />
            </div>
          </div>

          {/* Champ Portfolio */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
              Portfolio *
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faLink} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 group-hover:text-amber-500 transition-colors duration-300" 
              />
              <input
                type="url"
                placeholder="https://votre-portfolio.com"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="border border-gray-300 rounded-2xl p-4 pl-12 w-full focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 bg-white/50 backdrop-blur-sm"
                required
             />
            </div>
          </div>

        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg group relative overflow-hidden"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            <FontAwesomeIcon 
              icon={isLoading ? faPaperPlane : faPaperPlane} 
              className={`${isLoading ? 'animate-spin' : 'group-hover:scale-110'} transition-transform duration-300`} 
            />
            {isLoading ? 'Envoi en cours...' : 'Envoyer la Candidature'}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </button>
      </form>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>© 2025 Jadara & Noucer Wings Tech. Tous droits réservés.</p>
      </div>
    </div>
  );
}