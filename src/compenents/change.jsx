import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faSearch,
  faSync,
  faUser,
  faBuilding,
  faCalendarAlt,
  faBriefcase,
  faGraduationCap,
  faCheckCircle,
  faEye,
  faFileAlt,
  faMapMarkerAlt
} from "@fortawesome/free-solid-svg-icons";

export default function FilterCandidats() {
  const [centers, setCenters] = useState([]);
  const [status, setStatus] = useState("");
  const [center, setCenter] = useState("");
  const [data, setData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedCandidat, setExpandedCandidat] = useState(null);

  // جلب المراكز
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await axios.get("https://ihsas-back.vercel.app/api/center");
        setCenters(res.data);
      } catch (err) {
        console.error("Error fetching centers:", err.response?.data || err.message);
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

  // جلب المترشحين حسب التصفية
  const search = async () => {
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
      const res = await axios.get(
        `https://ihsas-back.vercel.app/api/candidat/filter?center=${center}&status=${status}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data);

      // تهيئة selectedStatus لكل مترشح
      const initialStatus = {};
      res.data.forEach(c => {
        initialStatus[c._id] = c.statusTracking?.currentStatus || "Disponible";
      });
      setSelectedStatus(initialStatus);

      if (res.data.length === 0) {
        await Swal.fire({
          icon: 'info',
          title: 'Aucun résultat',
          text: 'Aucun candidat trouvé avec ces critères',
          confirmButtonColor: '#2563eb',
          background: '#f8fafc'
        });
      }

    } catch (err) {
      console.error("Error fetching candidates:", err.response?.data || err.message);
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

  // تحديث حالة المترشح
  const updateStatus = async (id, newStatus, stageJobData = {}) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      let url = "";
      let body = {};

      if (newStatus === "Stage") {
        url = `https://ihsas-back.vercel.app/api/candidat/${id}/stage`;
        body = stageJobData;
      } else if (newStatus === "Emploi") {
        url = `https://ihsas-back.vercel.app/api/candidat/${id}/job`;
        body = stageJobData;
      } else if (newStatus === "Disponible") {
        url = `https://ihsas-back.vercel.app/api/candidat/${id}/disponible`;
        body = {};
      }

      const loadingAlert = Swal.fire({
        title: 'Mise à jour en cours...',
        text: 'Veuillez patienter',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const res = await axios.put(url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await Swal.close();

      // تحديث state محلي
      setData(prev => prev.map(item => item._id === id ? res.data.updated : item));

      // تحديث selectedStatus
      setSelectedStatus(prev => ({ ...prev, [id]: newStatus }));

      await Swal.fire({
        icon: 'success',
        title: 'Succès!',
        text: `Statut mis à jour vers "${newStatus}"`,
        confirmButtonColor: '#10b981',
        background: '#f8fafc',
        timer: 2000
      });

    } catch (err) {
      console.error("Error updating status:", err.response?.data || err.message);
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la mise à jour du statut',
        confirmButtonColor: '#dc2626',
        background: '#f8fafc'
      });
    }
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
      case "Stage": return faGraduationCap;
      case "Emploi": return faBriefcase;
      case "Disponible": return faUser;
      default: return faUser;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* En-tête */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-2xl">
              <FontAwesomeIcon icon={faFilter} className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
                Employabilité
              </h1>
              <p className="text-gray-600">Recherche et gestion avancée des candidats</p>
            </div>
          </div>
        </div>

        {/* Cartes de Filtrage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Carte Filtre Centre */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-blue-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faBuilding} className="text-blue-600" />
              Centre de Formation
            </label>
            <select
              className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white/50"
              value={center}
              onChange={e => setCenter(e.target.value)}
            >
              <option value="">Tous les centres</option>
              {centers.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Carte Filtre Statut */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-amber-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-amber-500" />
              Statut Actuel
            </label>
            <select
              className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-300 hover:border-amber-300 bg-white/50"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="Disponible">Disponible</option>
              <option value="Stage">Stage</option>
              <option value="Emploi">Emploi</option>
            </select>
          </div>

          {/* Carte Actions */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-green-100 flex flex-col justify-center">
            <button
              onClick={search}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group font-semibold text-lg"
            >
              <FontAwesomeIcon 
                icon={loading ? faSync : faSearch} 
                className={`${loading ? 'animate-spin' : 'group-hover:scale-110'} transition-transform`} 
              />
              {loading ? 'Recherche en cours...' : 'Lancer la Recherche'}
            </button>
          </div>
        </div>

        {/* Résultats */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <FontAwesomeIcon icon={faEye} className="text-blue-600" />
              Résultats de la Recherche
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {data.length} candidat(s) trouvé(s)
              </span>
            </h2>
          </div>

          {data.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun candidat trouvé
              </h3>
              <p className="text-gray-500">
                Ajustez vos critères de recherche pour afficher les résultats
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((c, index) => {
                const currentStatus = selectedStatus[c._id] || "Disponible";
                const isExpanded = expandedCandidat === c._id;

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
                              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentStatus)}`}>
                                <FontAwesomeIcon icon={getStatusIcon(currentStatus)} className="text-xs" />
                                {currentStatus}
                              </div>
                              {c.filiere?.name && (
                                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                  <FontAwesomeIcon icon={faGraduationCap} className="text-green-600 text-xs" />
                                  {c.filiere.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full animate-pulse ${
                            currentStatus === "Stage" ? "bg-blue-500" :
                            currentStatus === "Emploi" ? "bg-green-500" :
                            "bg-amber-500"
                          }`}></div>
                          <FontAwesomeIcon 
                            icon={faFileAlt} 
                            className={`text-gray-400 transform transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : ""
                            }`} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contenu dépliable */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-100 pt-6">
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            const form = e.target;
                            const newStatus = form.statusSelect.value;

                            const stageJobData = {};
                            if (newStatus === "Stage") {
                              stageJobData.stageCompany = form.stageCompany.value;
                              stageJobData.stageTitle = form.stageTitle.value;
                              stageJobData.stageStartDate = form.stageStartDate.value;
                              stageJobData.stageEndDate = form.stageEndDate.value;
                              stageJobData.stageType = form.stageType.value;
                            } else if (newStatus === "Emploi") {
                              stageJobData.jobCompany = form.jobCompany.value;
                              stageJobData.jobTitle = form.jobTitle.value;
                              stageJobData.jobContractType = form.jobContractType.value;
                              stageJobData.jobStartDate = form.jobStartDate.value;
                            }

                            updateStatus(c._id, newStatus, stageJobData);
                          }}
                          className="space-y-6"
                        >
                          {/* Sélection du statut */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FontAwesomeIcon icon={faSync} className="text-blue-600 text-sm" />
                                Nouveau Statut
                              </label>
                              <select
                                name="statusSelect"
                                value={currentStatus}
                                onChange={e =>
                                  setSelectedStatus(prev => ({ ...prev, [c._id]: e.target.value }))
                                }
                                className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white/50"
                              >
                                <option value="Disponible">Disponible</option>
                                <option value="Stage">Stage</option>
                                <option value="Emploi">Emploi</option>
                              </select>
                            </div>

                            <div className="flex items-end">
                              <button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-3 group font-semibold"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} className="group-hover:scale-110 transition-transform" />
                                Mettre à jour le Statut
                              </button>
                            </div>
                          </div>

                          {/* Champs conditionnels pour Stage */}
                          {currentStatus === "Stage" && (
                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200">
                              <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faGraduationCap} />
                                Informations du Stage
                              </h4>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <input name="stageCompany" placeholder="Entreprise" className="w-full border-2 border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300" />
                                <input name="stageTitle" placeholder="Poste du stage" className="w-full border-2 border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300" />
                                <input name="stageStartDate" type="date" className="w-full border-2 border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300" />
                                <input name="stageEndDate" type="date" className="w-full border-2 border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300" />
                                <input name="stageType" placeholder="Type de stage" className="w-full border-2 border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 lg:col-span-2" />
                              </div>
                            </div>
                          )}

                          {/* Champs conditionnels pour Travail */}
                          {currentStatus === "Emploi" && (
                            <div className="bg-green-50/50 p-6 rounded-2xl border border-green-200">
                              <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBriefcase} />
                                Informations de l'Emploi
                              </h4>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <input name="jobCompany" placeholder="Entreprise" className="w-full border-2 border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300" />
                                <input name="jobTitle" placeholder="Poste" className="w-full border-2 border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300" />
                                <input name="jobContractType" placeholder="Type de contrat" className="w-full border-2 border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300" />
                                <input name="jobStartDate" type="date" className="w-full border-2 border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300" />
                              </div>
                            </div>
                          )}
                        </form>
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