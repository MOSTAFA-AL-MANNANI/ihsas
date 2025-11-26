import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faFilter,
  faSearch,
  faSync,
  faBuilding,
  faGraduationCap,
  faUser,
  faDownload,
  faFilePdf,
  faFileAlt,
  faBriefcase,
  faChartLine,
  faEye,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

export default function CandidatFilterPage() {
  const [centers, setCenters] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [center, setCenter] = useState("");
  const [filiere, setFiliere] = useState("");
  const [status, setStatus] = useState("");
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFilieres, setLoadingFilieres] = useState(false);
  const [expandedCandidat, setExpandedCandidat] = useState(null);

  // Récupération des centres
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const centersRes = await axios.get("https://ihsas-back.vercel.app/api/center");
        setCenters(centersRes.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des centres :", err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des centres',
          confirmButtonColor: '#dc2626',
          background: '#f8fafc'
        });
      }
    };
    fetchCenters();
  }, []);

  // Récupération des filières quand un centre est sélectionné
  useEffect(() => {
    const fetchFilieresByCenter = async () => {
      if (!center) {
        setFilieres([]);
        setFiliere("");
        return;
      }

      setLoadingFilieres(true);
      try {
        const filieresRes = await axios.get(`https://ihsas-back.vercel.app/api/filiere/by-center/${center}`);
        setFilieres(filieresRes.data);
        setFiliere(""); // Réinitialiser la sélection de filière
      } catch (err) {
        console.error("Erreur lors de la récupération des filières :", err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des filières',
          confirmButtonColor: '#dc2626',
          background: '#f8fafc'
        });
        setFilieres([]);
      } finally {
        setLoadingFilieres(false);
      }
    };

    fetchFilieresByCenter();
  }, [center]);

  // Récupération des candidats filtrés
  const fetchCandidats = async () => {
    // Validation des filtres
    if (center && filieres.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Aucune filière disponible',
        text: 'Le centre sélectionné ne contient aucune filière',
        confirmButtonColor: '#f59e0b',
        background: '#f8fafc'
      });
      return;
    }

    const params = {};
    if (center) params.center = center;
    if (filiere) params.filiere = filiere;
    if (status) params.status = status;

    const token = localStorage.getItem("adminToken");
    if (!token) {
      await Swal.fire({
        icon: 'warning',
        title: 'Authentification requise',
        text: 'Veuillez vous reconnecter',
        confirmButtonColor: '#f59e0b',
        background: '#f8fafc'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get("https://ihsas-back.vercel.app/api/candidat/filters", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidats(res.data);

      if (res.data.length === 0) {
        await Swal.fire({
          icon: 'info',
          title: 'Aucun résultat',
          text: 'Aucun candidat trouvé avec ces critères de filtrage',
          confirmButtonColor: '#2563eb',
          background: '#f8fafc'
        });
      } else {
        await Swal.fire({
          icon: 'success',
          title: 'Recherche réussie!',
          text: `${res.data.length} candidat(s) trouvé(s)`,
          confirmButtonColor: '#10b981',
          background: '#f8fafc',
          timer: 1500
        });
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des candidats :", err);
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la recherche des candidats',
        confirmButtonColor: '#dc2626',
        background: '#f8fafc'
      });
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setCenter("");
    setFiliere("");
    setStatus("");
    setCandidats([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Stage": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Emploi": return "bg-green-100 text-green-800 border-green-200";
      case "Disponible": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Stage": return faBriefcase;
      case "Emploi": return faChartLine;
      case "Disponible": return faUser;
      default: return faUser;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const handleDownload = async (id, type, fileName) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      const response = await axios.get(`https://ihsas-back.vercel.app/api/candidat/${id}/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `${type}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      await Swal.fire({
        icon: 'success',
        title: 'Téléchargement réussi!',
        text: `Le fichier ${type} a été téléchargé`,
        confirmButtonColor: '#10b981',
        background: '#f8fafc',
        timer: 1500
      });
    } catch (err) {
      console.error("Erreur lors du téléchargement :", err);
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du téléchargement du fichier',
        confirmButtonColor: '#dc2626',
        background: '#f8fafc'
      });
    }
  };

  // Fonction pour calculer la durée restante du stage
  const getStageRemainingTime = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Terminé";
    if (diffDays === 0) return "Dernier jour";
    if (diffDays === 1) return "1 jour restant";
    return `${diffDays} jours restants`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-2xl">
              <FontAwesomeIcon icon={faUsers} className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
                Filtre des Candidats
              </h1>
              <p className="text-gray-600">Recherche avancée et consultation des profils</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-blue-100">
              <p className="text-sm text-gray-600">Total trouvé</p>
              <p className="text-2xl font-black text-blue-600">{candidats.length}</p>
            </div>
            {(center || filiere || status) && (
              <button
                onClick={resetFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Section Filtres */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-xl">
              <FontAwesomeIcon icon={faFilter} className="text-blue-600 text-lg" />
            </div>
            <h2 className="text-2xl font-black text-gray-800">Critères de Filtrage</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Filtre Centre */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faBuilding} className="text-blue-600 text-sm" />
                Centre de Formation
              </label>
              <select
                value={center}
                onChange={e => setCenter(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white/50"
              >
                <option value="">Tous les centres</option>
                {centers.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Filtre Filière */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faGraduationCap} className="text-amber-500 text-sm" />
                Filière
                {loadingFilieres && (
                  <FontAwesomeIcon icon={faSpinner} className="text-amber-500 text-sm animate-spin" />
                )}
              </label>
              <select
                value={filiere}
                onChange={e => setFiliere(e.target.value)}
                disabled={!center || loadingFilieres}
                className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-300 hover:border-amber-300 bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{center ? "Toutes les filières" : "Sélectionnez d'abord un centre"}</option>
                {filieres.map(f => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
              {center && !loadingFilieres && filieres.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Aucune filière disponible pour ce centre</p>
              )}
            </div>

            {/* Filtre Statut */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-green-600 text-sm" />
                Statut Actuel
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 hover:border-green-300 bg-white/50"
              >
                <option value="">Tous les statuts</option>
                <option value="Disponible">Disponible</option>
                <option value="Stage">Stage</option>
                <option value="Emploi">Emploi</option>
              </select>
            </div>

            {/* Bouton Recherche */}
            <div className="flex items-end">
              <button
                onClick={fetchCandidats}
                disabled={loading || (center && filieres.length === 0)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group font-semibold text-lg"
              >
                <FontAwesomeIcon 
                  icon={loading ? faSync : faSearch} 
                  className={`${loading ? 'animate-spin' : 'group-hover:scale-110'} transition-transform`} 
                />
                {loading ? 'Recherche...' : 'Appliquer les Filtres'}
              </button>
            </div>
          </div>

          {/* Indicateur de filtre actif */}
          {(center || filiere || status) && (
            <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faFilter} className="text-blue-600" />
                Filtres actifs :
              </h4>
              <div className="flex flex-wrap gap-2">
                {center && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <FontAwesomeIcon icon={faBuilding} className="text-xs" />
                    Centre: {centers.find(c => c._id === center)?.name}
                  </span>
                )}
                {filiere && (
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-xs" />
                    Filière: {filieres.find(f => f._id === filiere)?.name}
                  </span>
                )}
                {status && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <FontAwesomeIcon icon={faUser} className="text-xs" />
                    Statut: {status}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Résultats */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <FontAwesomeIcon icon={faEye} className="text-blue-600" />
              Résultats de la Recherche
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {candidats.length} candidat(s)
              </span>
            </h2>
          </div>

          {candidats.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {center || filiere || status ? "Aucun candidat trouvé" : "Aucun filtre appliqué"}
              </h3>
              <p className="text-gray-500">
                {center || filiere || status 
                  ? "Ajustez vos critères de recherche pour afficher les résultats" 
                  : "Sélectionnez des critères de filtrage pour commencer votre recherche"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {candidats.map((c) => {
                const isExpanded = expandedCandidat === c._id;
                const currentStatus = c.statusTracking?.currentStatus || "Disponible";
                const stageRemainingTime = c.statusTracking?.stageEndDate ? 
                  getStageRemainingTime(c.statusTracking.stageEndDate) : null;

                return (
                  <div 
                    key={c._id} 
                    className="border-2 border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm overflow-hidden"
                  >
                    {/* En-tête du candidat */}
                    <div 
                      className="p-6 cursor-pointer"
                      onClick={() => setExpandedCandidat(isExpanded ? null : c._id)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {c.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-gray-900 mb-1">{c.fullName}</h3>
                            <div className="flex flex-wrap gap-2">
                              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                <FontAwesomeIcon icon={faBuilding} className="text-blue-600 text-xs" />
                                {c.center?.name || "Non spécifié"}
                              </div>
                              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                                <FontAwesomeIcon icon={faGraduationCap} className="text-amber-600 text-xs" />
                                {c.filiere?.name || "Non spécifiée"}
                              </div>
                              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentStatus)}`}>
                                <FontAwesomeIcon icon={getStatusIcon(currentStatus)} className="text-xs" />
                                {currentStatus}
                                {stageRemainingTime && currentStatus === "Stage" && (
                                  <span className="text-xs ml-1">({stageRemainingTime})</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full animate-pulse ${
                            currentStatus === "Stage" ? "bg-blue-500" :
                            currentStatus === "Emploi" ? "bg-green-500" :
                            "bg-amber-500"
                          }`}></div>
                          <FontAwesomeIcon 
                            icon={faEye} 
                            className={`text-gray-400 transform transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : ""
                            }`} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Détails dépliables */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-100 pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          
                          {/* Informations principales */}
                          <div className="space-y-4">
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200">
                              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faUser} />
                                Informations Personnelles
                              </h4>
                              <div className="space-y-2 text-sm">
                                <p><strong>Nom complet:</strong> {c.fullName}</p>
                                <p><strong>Centre:</strong> {c.center?.name || "-"}</p>
                                <p><strong>Filière:</strong> {c.filiere?.name || "-"}</p>
                                <p><strong>Statut:</strong> {currentStatus}</p>
                                {c.linkedin && (
                                  <p>
                                    <strong>LinkedIn:</strong> 
                                    <a href={c.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-1">
                                      Voir le profil
                                    </a>
                                  </p>
                                )}
                                {c.portfolio && (
                                  <p>
                                    <strong>Portfolio:</strong> 
                                    <a href={c.portfolio} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline ml-1">
                                      Visiter
                                    </a>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Téléchargements */}
                            <div className="bg-green-50/50 p-4 rounded-2xl border border-green-200">
                              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faDownload} />
                                Documents
                              </h4>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleDownload(c._id, "cv", `${c.fullName}-CV.pdf`)}
                                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 group font-semibold"
                                >
                                  <FontAwesomeIcon icon={faFilePdf} className="group-hover:scale-110 transition-transform" />
                                  Télécharger CV
                                </button>
                                <button
                                  onClick={() => handleDownload(c._id, "cover", `${c.fullName}-Lettre.pdf`)}
                                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-2xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 group font-semibold"
                                >
                                  <FontAwesomeIcon icon={faFileAlt} className="group-hover:scale-110 transition-transform" />
                                  Télécharger Lettre
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Informations détaillées selon le statut */}
                          <div className="space-y-4">
                            {/* Informations Stage */}
                            {currentStatus === "Stage" && (
                              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                  <FontAwesomeIcon icon={faBriefcase} />
                                  Informations du Stage
                                </h4>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <p className="text-blue-600 font-medium">Entreprise</p>
                                      <p className="text-gray-700">{c.statusTracking?.stageCompany || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-blue-600 font-medium">Poste</p>
                                      <p className="text-gray-700">{c.statusTracking?.stageTitle || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-blue-600 font-medium">Type de stage</p>
                                      <p className="text-gray-700">{c.statusTracking?.stageType || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-blue-600 font-medium">Début</p>
                                      <p className="text-gray-700">{formatDate(c.statusTracking?.stageStartDate)}</p>
                                    </div>
                                    <div>
                                      <p className="text-blue-600 font-medium">Fin</p>
                                      <p className="text-gray-700">{formatDate(c.statusTracking?.stageEndDate)}</p>
                                    </div>
                                    {stageRemainingTime && (
                                      <div className="col-span-2">
                                        <p className="text-blue-600 font-medium">Temps restant</p>
                                        <p className={`text-sm font-medium ${
                                          stageRemainingTime === "Terminé" ? "text-red-600" :
                                          stageRemainingTime.includes("Dernier") ? "text-amber-600" :
                                          "text-green-600"
                                        }`}>
                                          {stageRemainingTime}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Informations Travail */}
                            {currentStatus === "Emploi" && (
                              <div className="bg-green-50/50 p-4 rounded-2xl border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                  <FontAwesomeIcon icon={faChartLine} />
                                  Informations de l'Emploi
                                </h4>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <p className="text-green-600 font-medium">Entreprise</p>
                                      <p className="text-gray-700">{c.statusTracking?.jobCompany || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-green-600 font-medium">Poste</p>
                                      <p className="text-gray-700">{c.statusTracking?.jobTitle || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-green-600 font-medium">Type de contrat</p>
                                      <p className="text-gray-700">{c.statusTracking?.jobContractType || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-green-600 font-medium">Date de début</p>
                                      <p className="text-gray-700">{formatDate(c.statusTracking?.jobStartDate)}</p>
                                    </div>
                                    {c.statusTracking?.jobStartDate && (
                                      <div className="col-span-2">
                                        <p className="text-green-600 font-medium">Ancienneté</p>
                                        <p className="text-gray-700">
                                          {Math.floor((new Date() - new Date(c.statusTracking.jobStartDate)) / (1000 * 60 * 60 * 24))} jours
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Candidat disponible */}
                            {currentStatus === "Disponible" && (
                              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                                <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                  <FontAwesomeIcon icon={faUser} />
                                  Statut Disponible
                                </h4>
                                <p className="text-sm text-amber-700">
                                  Ce candidat est actuellement disponible et à la recherche d'opportunités.
                                  {c.linkedin && " Son profil LinkedIn est à jour."}
                                  {c.portfolio && " Son portfolio présente ses compétences."}
                                </p>
                                <div className="mt-3 flex gap-2">
                                  {c.linkedin && (
                                    <a 
                                      href={c.linkedin} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                                    >
                                      <FontAwesomeIcon icon={faUser} className="text-xs" />
                                      LinkedIn
                                    </a>
                                  )}
                                  {c.portfolio && (
                                    <a 
                                      href={c.portfolio} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="bg-amber-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-amber-700 transition-colors flex items-center gap-1"
                                    >
                                      <FontAwesomeIcon icon={faBriefcase} className="text-xs" />
                                      Portfolio
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}