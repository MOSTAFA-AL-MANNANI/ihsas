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
  faRocket,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faFileUpload
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

  // États pour la validation des fichiers
  const [cvValidation, setCvValidation] = useState({ isValid: true, message: "" });
  const [coverValidation, setCoverValidation] = useState({ isValid: true, message: "" });

  // Configuration de la validation
  const MAX_FILE_SIZE = 2000 * 1024; // 2000 Ko en bytes
  const ALLOWED_TYPES = ['application/pdf'];



  useEffect(() => {
    const loadData = async () => {
      try {
        const c = await axios.get("https://ihsas-back.vercel.app/api/center");
        setCenters(c.data);
      } catch (err) {
        console.error("Erreur chargement centres:", err);
        showError("Erreur lors du chargement des centres");
      }
    };

    loadData();
  }, []);

  // جلب filières حسب المركز
  const loadFilieresByCenter = async (centerId) => {
    if (!centerId) {
      setFilieres([]);
      return;
    }

    try {
      const res = await axios.get(`https://ihsas-back.vercel.app/api/filiere/by-center/${centerId}`);
      setFilieres(res.data);
    } catch (err) {
      console.log(err);
      showError("Erreur lors du chargement des filières");
    }
  };

  // Fonction de validation des fichiers
  const validateFile = (file, fieldName) => {
    const validation = { isValid: true, message: "" };

    // Vérifier le type de fichier
    if (!ALLOWED_TYPES.includes(file.type)) {
      validation.isValid = false;
      validation.message = "Format PDF requis";
      return validation;
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      validation.isValid = false;
      const fileSizeInKB = Math.round(file.size / 1024);
      validation.message = `Trop volumineux (${fileSizeInKB} Ko)`;
      return validation;
    }

    // Vérifier si le fichier n'est pas vide
    if (file.size === 0) {
      validation.isValid = false;
      validation.message = "Fichier vide";
      return validation;
    }

    validation.isValid = true;
    validation.message = `Valide (${Math.round(file.size / 1024)} Ko)`;
    return validation;
  };

  // Gestionnaire pour le CV
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateFile(file, "CV");
      setCvValidation(validation);
      
      if (validation.isValid) {
        setCv(file);
      } else {
        setCv(null);
        e.target.value = ''; // Reset l'input file
        showFileError(validation.message, "CV");
      }
    }
  };

  // Gestionnaire pour la lettre de motivation
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateFile(file, "Lettre de motivation");
      setCoverValidation(validation);
      
      if (validation.isValid) {
        setCover(file);
      } else {
        setCover(null);
        e.target.value = ''; // Reset l'input file
        showFileError(validation.message, "Lettre de motivation");
      }
    }
  };

  // Alertes personnalisées pour les fichiers
  const showFileError = (message, fileType) => {
    Swal.fire({
      icon: 'error',
      title: `Erreur - ${fileType}`,
      html: `
        <div class="text-center">
          <p class="mb-2 font-semibold">${message}</p>
          <p class="text-sm text-gray-600">Taille maximale: 2000 Ko</p>
        </div>
      `,
      confirmButtonColor: '#ef4444',
      background: '#f8fafc'
    });
  };

  const showError = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: message,
      confirmButtonColor: '#ef4444',
      background: '#f8fafc'
    });
  };

  // Vérification finale avant soumission
  const validateForm = () => {
    if (!cv) {
      showFileError("Veuillez sélectionner un CV", "CV");
      return false;
    }
    if (!cover) {
      showFileError("Veuillez sélectionner une lettre de motivation", "Lettre de motivation");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation finale
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("linkedin", linkedin);
      formData.append("portfolio", portfolio);
      formData.append("filiere", filiere);
      formData.append("center", center);
      formData.append("cv", cv);
      formData.append("cover", cover);

      const res = await axios.post("https://ihsas-back.vercel.app/api/candidat/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await Swal.fire({
        icon: 'success',
        title: 'Candidature Envoyée!',
        html: `
          <div class="text-center">
            <p class="text-lg font-semibold mb-4">${res.data.message}</p>
            <div class="flex justify-center gap-6 mt-4">
            </div>
          </div>
        `,
        confirmButtonColor: '#2563eb',
        background: '#f8fafc',
        timer: 5000,
        showConfirmButton: true
      });

      // Reset form
      setFullName("");
      setLinkedin("");
      setPortfolio("");
      setFiliere("");
      setCenter("");
      setCv(null);
      setCover(null);
      setCvValidation({ isValid: true, message: "" });
      setCoverValidation({ isValid: true, message: "" });
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
      <div className="w-full max-w-4xl mb-8">
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
        <div className="text-center mb-6">
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
            Espace Candidat
          </h2>
          <p className="text-gray-600">Remplissez le formulaire ci-dessous pour postuler</p>
        </div>

        <div className="space-y-6">
          {/* Champ Nom Complet */}
          <div className="group">
            <label className="block text-sm font-semibold text-blue-700 mb-3 ml-1">
              <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
              Nom Complet *
            </label>
            <input
              type="text"
              placeholder="Votre nom complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border-2 border-blue-200 rounded-2xl p-4 w-full focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 bg-white/80 backdrop-blur-sm"
              required
            />
          </div>

          {/* Select Center */}
          <div className="group">
            <label className="block text-sm font-semibold text-blue-700 mb-3 ml-1">
              <FontAwesomeIcon icon={faBuilding} className="mr-2 text-blue-600" />
              Choisir le Centre *
            </label>
            <select
              value={center}
              onChange={(e) => {
                const selectedCenter = e.target.value;
                setCenter(selectedCenter);
                setFiliere("");
                loadFilieresByCenter(selectedCenter);
              }}
              required
              className="border-2 border-blue-200 rounded-2xl p-4 w-full bg-white/80 backdrop-blur-sm 
              focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 
              hover:border-blue-400 transition-all duration-300"
            >
              <option value="">-- Sélectionner le centre --</option>
              {centers.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          {/* Select Filiere */}
          <div className="group">
            <label className="block text-sm font-semibold text-blue-700 mb-3 ml-1">
              <FontAwesomeIcon icon={faRocket} className="mr-2 text-blue-600" />
              Choisir la Filière *
            </label>
            <select
              value={filiere}
              onChange={(e) => setFiliere(e.target.value)}
              required
              className="border-2 border-blue-200 rounded-2xl p-4 w-full bg-white/80 backdrop-blur-sm 
              focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 
              hover:border-blue-400 transition-all duration-300"
            >
              <option value="">-- Sélectionner la filière --</option>
              {filieres.map(f => (
                <option key={f._id} value={f._id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Section Fichiers avec informations intégrées */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon icon={faFileUpload} className="text-blue-600 text-xl" />
              <div>
                <h3 className="font-semibold text-blue-800 text-lg">Documents à Fournir</h3>
                <p className="text-blue-600 text-sm">Format PDF - Maximum 2000 Ko par fichier</p>
              </div>
            </div>

            {/* Champ CV */}
            <div className="group mb-6">
              <label className="block text-sm font-semibold text-blue-700 mb-3">
                <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-blue-600" />
                Curriculum Vitae (CV) *
                <span className="ml-2 text-xs font-normal text-blue-500">
                  {cvValidation.message && (
                    <span className={`inline-flex items-center gap-1 ${cvValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      <FontAwesomeIcon icon={cvValidation.isValid ? faCheckCircle : faTimesCircle} />
                      {cvValidation.message}
                    </span>
                  )}
                </span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleCvChange}
                className={`border-2 rounded-2xl p-4 w-full focus:outline-none focus:ring-3 transition-all duration-300 bg-white/80 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold cursor-pointer ${
                  cvValidation.isValid 
                    ? 'border-blue-200 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200' 
                    : 'border-red-300 focus:border-red-500 focus:ring-red-500/50 hover:border-red-400 file:bg-red-100 file:text-red-700 hover:file:bg-red-200'
                }`}
                required
              />
            </div>

            {/* Champ Lettre de Motivation */}
            <div className="group">
              <label className="block text-sm font-semibold text-blue-700 mb-3">
                <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-blue-600" />
                Lettre de Motivation *
                <span className="ml-2 text-xs font-normal text-blue-500">
                  {coverValidation.message && (
                    <span className={`inline-flex items-center gap-1 ${coverValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      <FontAwesomeIcon icon={coverValidation.isValid ? faCheckCircle : faTimesCircle} />
                      {coverValidation.message}
                    </span>
                  )}
                </span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleCoverChange}
                className={`border-2 rounded-2xl p-4 w-full focus:outline-none focus:ring-3 transition-all duration-300 bg-white/80 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold cursor-pointer ${
                  coverValidation.isValid 
                    ? 'border-blue-200 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200' 
                    : 'border-red-300 focus:border-red-500 focus:ring-red-500/50 hover:border-red-400 file:bg-red-100 file:text-red-700 hover:file:bg-red-200'
                }`}
                required
              />
            </div>
          </div>

          {/* Champ LinkedIn */}
          <div className="group">
            <label className="block text-sm font-semibold text-blue-700 mb-3 ml-1">
              <FontAwesomeIcon icon={faLinkedin} className="mr-2 text-blue-600" />
              LinkedIn *
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/votre-profil"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="border-2 border-blue-200 rounded-2xl p-4 w-full focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 bg-white/80 backdrop-blur-sm"
              required
            />
          </div>

          {/* Champ Portfolio */}
          <div className="group">
            <label className="block text-sm font-semibold text-blue-700 mb-3 ml-1">
              <FontAwesomeIcon icon={faLink} className="mr-2 text-blue-600" />
              Portfolio *
            </label>
            <input
              type="url"
              placeholder="https://votre-portfolio.com"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              className="border-2 border-blue-200 rounded-2xl p-4 w-full focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-blue-400 bg-white/80 backdrop-blur-sm"
              required
            />
          </div>
        </div>

        {/* Indicateurs de validation */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
            cv && cvValidation.isValid 
              ? 'bg-green-50 text-green-700 border-green-300' 
              : cv 
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <FontAwesomeIcon icon={cv && cvValidation.isValid ? faCheckCircle : faFilePdf} />
            <span className="text-sm font-medium">
              {cv ? (cvValidation.isValid ? 'CV Validé' : 'CV Invalid') : 'CV Requis'}
            </span>
          </div>
          <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
            cover && coverValidation.isValid 
              ? 'bg-green-50 text-green-700 border-green-300' 
              : cover 
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <FontAwesomeIcon icon={cover && coverValidation.isValid ? faCheckCircle : faFilePdf} />
            <span className="text-sm font-medium">
              {cover ? (coverValidation.isValid ? 'Lettre Validée' : 'Lettre Invalide') : 'Lettre Requise'}
            </span>
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isLoading || !cvValidation.isValid || !coverValidation.isValid}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg group relative overflow-hidden"
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
    </div>
  );
}