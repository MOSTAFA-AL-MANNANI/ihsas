import React, { useEffect, useState } from "react";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

// Import FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLink,
  faFilePdf,
  faDownload,
  faEdit,
  faTrash,
  faPlus,
  faSignOutAlt,
  faSearch,
  faEye,
  faFolderOpen,
  faChartLine,
  faUsers,
  faFileArchive,
  faTimes,
  faSave,
  faUpload,
  faStar,
  faShieldAlt
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";

export default function AdminDashboard() {
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    linkedin: "",
    portfolio: "",
    cv: null,
    cover: null
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const token = localStorage.getItem("adminToken");
  const apiBase = "https://ihsas-back.vercel.app/api/candidat";

  // Convertir Base64 en Blob
  const base64ToBlob = (base64, mime) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  };

  const handleExportFolder = async (candidat) => {
    try {
      const zip = new JSZip();
      
      // Ajouter fichier texte avec LinkedIn et Portfolio
      const textContent = `Nom: ${candidat.fullName}\nLinkedIn: ${candidat.linkedin || "-"}\nPortfolio: ${candidat.portfolio || "-"}\nDate d'ajout: ${new Date(candidat.createdAt).toLocaleDateString()}`;
      zip.file("info.txt", textContent);

      // Ajouter CV si disponible
      if (candidat.cvData && candidat.cvName) {
        const cvBlob = base64ToBlob(candidat.cvData, "application/pdf");
        zip.file(candidat.cvName, cvBlob);
      }

      // Ajouter lettre de motivation si disponible
      if (candidat.coverLetterData && candidat.coverLetterName) {
        const coverBlob = base64ToBlob(candidat.coverLetterData, "application/pdf");
        zip.file(candidat.coverLetterName, coverBlob);
      }

      // Générer ZIP et télécharger
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${candidat.fullName.replace(/\s+/g, '_')}-dossier.zip`);

      await Swal.fire({
        icon: 'success',
        title: 'Export Réussi!',
        html: `
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faFileArchive} className="text-green-600 text-2xl" />
            </div>
            <p class="text-gray-700">Dossier exporté avec succès!</p>
            <p class="text-sm text-gray-500 mt-2">${candidat.fullName}</p>
          </div>
        `,
        confirmButtonColor: '#10b981',
        background: '#f8fafc'
      });

    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la création du ZIP',
        confirmButtonColor: '#dc2626',
        background: '#f8fafc'
      });
    }
  };

  // Fetch candidats
  const fetchCandidats = async () => {
    try {
      const res = await axios.get(`${apiBase}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidats(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement des candidats',
        confirmButtonColor: '#dc2626',
        background: '#f8fafc'
      });
    }
  };

  useEffect(() => {
    fetchCandidats();
  }, []);

  // Logout
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
        await axios.post("https://ihsas-back.vercel.app/api/admin/logout", {}, {
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

  // Delete candidat
const handleDelete = async (id, fullName) => {
  const result = await Swal.fire({
    title: 'Confirmer la suppression',
    html: `
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-trash text-red-600 text-xl"></i>
        </div>
        <p class="text-gray-700">Voulez-vous vraiment supprimer le candidat :</p>
        <p class="font-bold text-red-600">${fullName}</p>
        <p class="text-sm text-gray-500 mt-2">Cette action est irréversible</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler',
    background: '#f8fafc'
  });

  if (result.isConfirmed) {
    try {
      // إظهار حالة التحميل
      const loadingSwal = Swal.fire({
        title: 'Suppression en cours...',
        text: 'Veuillez patienter',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await axios.delete(`${apiBase}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // إغلاق نافذة التحميل
      await Swal.close();
      
      // عرض رسالة النجاح
      await Swal.fire({
        icon: 'success',
        title: 'Supprimé!',
        text: 'Candidat supprimé avec succès',
        confirmButtonColor: '#10b981',
        background: '#f8fafc',
        timer: 1500,
        showConfirmButton: false
      });
      
      // تحديث القائمة مباشرة بدون إعادة تحميل الصفحة
      setCandidats(prevCandidats => prevCandidats.filter(c => c._id !== id));
      
      // إذا كان المرشح المحذوف في الصفحة الحالية وكان آخر مرشح، نعود للصفحة السابقة
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      
    } catch (err) {
      console.error(err);
      
      // إغلاق نافذة التحميل في حالة الخطأ
      await Swal.close();
      
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: err.response?.data?.message || 'Erreur lors de la suppression',
        confirmButtonColor: '#dc2626',
        background: '#f8fafc'
      });
    }
  }
};

  // Ajouter ou modifier candidat
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("linkedin", formData.linkedin);
      data.append("portfolio", formData.portfolio);
      if (formData.cv) data.append("cv", formData.cv);
      if (formData.cover) data.append("cover", formData.cover);

      if (selectedCandidat?._id) {
        await axios.put(`${apiBase}/${selectedCandidat._id}`, data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
        
        await Swal.fire({
          icon: 'success',
          title: 'Mis à jour!',
          text: 'Candidat mis à jour avec succès',
          confirmButtonColor: '#10b981',
          background: '#f8fafc',
          timer: 2000
        });
      } else {
        await axios.post(`${apiBase}/add`, data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
        
        await Swal.fire({
          icon: 'success',
          title: 'Ajouté!',
          text: 'Candidat ajouté avec succès',
          confirmButtonColor: '#10b981',
          background: '#f8fafc',
          timer: 2000
        });
      }

      setFormData({ fullName: "", linkedin: "", portfolio: "", cv: null, cover: null });
      setSelectedCandidat(null);
      setShowModal(false);
      fetchCandidats();
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de l\'enregistrement',
        confirmButtonColor: '#dc2626',
        background: '#f8fafc'
      });
    }
  };

  const handleEditClick = (c) => {
    setSelectedCandidat(c);
    setFormData({
      fullName: c.fullName || "",
      linkedin: c.linkedin || "",
      portfolio: c.portfolio || "",
      cv: null,
      cover: null
    });
    setShowModal(true);
  };

  const getPdfUrl = (id, type) => {
    return `https://ihsas-back.vercel.app/api/candidat/${id}/${type}`;
  };

  // Filtrer candidats
  const filtered = candidats.filter(c =>
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.linkedin && c.linkedin.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.portfolio && c.portfolio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Statistiques
  const stats = {
    total: candidats.length,
    withCV: candidats.filter(c => c.cvName).length,
    withCover: candidats.filter(c => c.coverLetterName).length,
    withLinkedIn: candidats.filter(c => c.linkedin).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-amber-50 to-gray-100 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 p-3">
            <img src="jadara.png" alt="Jadara Foundation Logo" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
              Dashboard Admin
            </h1>
            <p className="text-gray-600">Gestion des candidatures</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-3 group font-semibold"
          >
            <FontAwesomeIcon icon={faPlus} className="group-hover:scale-110 transition-transform" />
            Ajouter Candidat
          </button>
          <button 
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-3 group font-semibold"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="group-hover:scale-110 transition-transform" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Cartes Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-blue-100 hover:shadow-3xl transition-all duration-500 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Candidats</p>
              <p className="text-3xl font-black text-blue-600 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-amber-100 hover:shadow-3xl transition-all duration-500 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avec CV</p>
              <p className="text-3xl font-black text-amber-500 mt-2">{stats.withCV}</p>
            </div>
            <div className="bg-amber-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon icon={faFilePdf} className="text-amber-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-blue-100 hover:shadow-3xl transition-all duration-500 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avec LinkedIn</p>
              <p className="text-3xl font-black text-blue-600 mt-2">{stats.withLinkedIn}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon icon={faLinkedin} className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-amber-100 hover:shadow-3xl transition-all duration-500 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avec Lettre</p>
              <p className="text-3xl font-black text-amber-500 mt-2">{stats.withCover}</p>
            </div>
            <div className="bg-amber-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon icon={faFileArchive} className="text-amber-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher par nom, LinkedIn, portfolio..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 shadow-lg"
        />
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} />
                      Nom Complet
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faLinkedin} />
                      LinkedIn
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faLink} />
                      Portfolio
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faFilePdf} />
                      Documents
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faChartLine} />
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30 bg-white">
                {currentItems.map((c, index) => (
                  <tr 
                    key={c._id} 
                    className="hover:bg-blue-50/50 transition-all duration-300 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {c.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{c.fullName}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {c.linkedin ? (
                        <a 
                          href={c.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors group/link"
                        >
                          <FontAwesomeIcon icon={faLinkedin} className="text-blue-600" />
                          <span className="text-sm font-medium">LinkedIn</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {c.portfolio ? (
                        <a 
                          href={c.portfolio} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full hover:bg-amber-100 transition-colors group/link"
                        >
                          <FontAwesomeIcon 
                            icon={c.portfolio.includes('github') ? faGithub : faLink} 
                            className="text-amber-500" 
                          />
                          <span className="text-sm font-medium">Portfolio</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3">
                        {c.cvName ? (
                          <a 
                            href={getPdfUrl(c._id, "cv")} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 transition-colors group/doc"
                          >
                            <FontAwesomeIcon icon={faEye} className="text-green-600 group-hover/doc:scale-110 transition-transform" />
                            <span className="text-sm font-medium">CV</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                        
                        {c.coverLetterName ? (
                          <a 
                            href={getPdfUrl(c._id, "cover")} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors group/doc"
                          >
                            <FontAwesomeIcon icon={faEye} className="text-purple-600 group-hover/doc:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Lettre</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditClick(c)}
                          className="bg-gradient-to-r from-amber-400 to-amber-500 text-white p-2 rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg group/tooltip relative"
                          title="Modifier"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        
                        <button 
                          onClick={() => handleExportFolder(c)}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg group/tooltip relative"
                          title="Exporter ZIP"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(c._id, c.fullName)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg group/tooltip relative"
                          title="Supprimer"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-6 bg-gray-50/50">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`min-w-[40px] h-10 rounded-xl transition-all duration-300 font-semibold ${
                    currentPage === i + 1 
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105" 
                      : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 border border-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal formulaire */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <FontAwesomeIcon icon={selectedCandidat?._id ? faEdit : faPlus} />
                  {selectedCandidat?._id ? "Modifier Candidat" : "Ajouter Candidat"}
                </h3>
                <button 
                  onClick={() => { setShowModal(false); setSelectedCandidat(null); }}
                  className="text-white hover:text-amber-300 transition-colors p-2 rounded-full hover:bg-white/10"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>
              </div>
            </div>

            {/* Formulaire */}
            <form className="p-6 space-y-6" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom Complet */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                    Nom Complet *
                  </label>
                  <input 
                    type="text" 
                    placeholder="ex: Marie Dupont" 
                    value={formData.fullName} 
                    required
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white/50"
                  />
                </div>

                {/* LinkedIn */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faLinkedin} className="text-blue-600" />
                    LinkedIn
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://linkedin.com/in/..." 
                    value={formData.linkedin}
                    onChange={e => setFormData({...formData, linkedin: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white/50"
                  />
                </div>
              </div>

              {/* Portfolio */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faLink} className="text-blue-600" />
                  Portfolio
                </label>
                <input 
                  type="url" 
                  placeholder="https://votre-portfolio.com" 
                  value={formData.portfolio}
                  onChange={e => setFormData({...formData, portfolio: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CV */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFilePdf} className="text-amber-500" />
                    CV (PDF)
                  </label>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={e => setFormData({...formData, cv: e.target.files[0]})}
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-300 hover:border-amber-300 bg-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>

                {/* Lettre de motivation */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFilePdf} className="text-amber-500" />
                    Lettre de motivation (PDF)
                  </label>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={e => setFormData({...formData, cover: e.target.files[0]})}
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-300 hover:border-amber-300 bg-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setSelectedCandidat(null); }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 font-semibold flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-semibold flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faSave} />
                  {selectedCandidat?._id ? "Mettre à jour" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}