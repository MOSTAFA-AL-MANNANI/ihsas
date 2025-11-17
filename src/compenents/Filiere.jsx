import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Import FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faGraduationCap,
  faList,
  faSearch,
  faSync
} from "@fortawesome/free-solid-svg-icons";

// ==========================
// 📌 Component: CRUD Filiere
// ==========================
export function FilierePage() {
  const api = "http://localhost:3000/api/filiere";
  const [filieres, setFilieres] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(api);
      setFilieres(res.data);
    } catch (error) {
      console.error("Error loading filieres:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement des filières',
        confirmButtonColor: '#dc2626',
        background: '#f8fafc'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  const save = async () => {
    if (!form.name.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Champ requis',
        text: 'Le nom de la filière est obligatoire',
        confirmButtonColor: '#f59e0b',
        background: '#f8fafc'
      });
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${api}/${editingId}`, form);
        await Swal.fire({
          icon: 'success',
          title: 'Modifié!',
          text: 'Filière mise à jour avec succès',
          confirmButtonColor: '#10b981',
          background: '#f8fafc',
          timer: 1500
        });
      } else {
        await axios.post(api, form);
        await Swal.fire({
          icon: 'success',
          title: 'Ajouté!',
          text: 'Filière ajoutée avec succès',
          confirmButtonColor: '#10b981',
          background: '#f8fafc',
          timer: 1500
        });
      }
      
      setForm({ name: "", description: "" });
      setEditingId(null);
      load();
    } catch (error) {
      console.error("Error saving filiere:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.message || 'Erreur lors de la sauvegarde',
        confirmButtonColor: '#dc2626',
        background: '#f8fafc'
      });
    }
  };

  const edit = (f) => {
    setForm({ name: f.name, description: f.description });
    setEditingId(f._id);
  };

  const remove = async (id) => {
    const filiereToDelete = filieres.find(f => f._id === id);
    
    const result = await Swal.fire({
      title: 'Confirmer la suppression',
      html: `
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-trash text-red-600 text-xl"></i>
          </div>
          <p class="text-gray-700">Voulez-vous vraiment supprimer la filière :</p>
          <p class="font-bold text-red-600">${filiereToDelete?.name}</p>
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
        await axios.delete(`${api}/${id}`);
        await Swal.fire({
          icon: 'success',
          title: 'Supprimé!',
          text: 'Filière supprimée avec succès',
          confirmButtonColor: '#10b981',
          background: '#f8fafc',
          timer: 1500
        });
        load();
      } catch (error) {
        console.error("Error deleting filiere:", error);
        await Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la suppression',
          confirmButtonColor: '#dc2626',
          background: '#f8fafc'
        });
      }
    }
  };

  const cancelEdit = () => {
    setForm({ name: "", description: "" });
    setEditingId(null);
  };

  // Filtrer les filières selon la recherche
  const filteredFilieres = filieres.filter(filiere =>
    filiere.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filiere.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-2xl">
              <FontAwesomeIcon icon={faGraduationCap} className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
                Gestion des Filières
              </h1>
              <p className="text-gray-600">CRUD complet pour la gestion des filières académiques</p>
            </div>
          </div>

          <button 
            onClick={load}
            disabled={loading}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group font-semibold"
          >
            <FontAwesomeIcon 
              icon={loading ? faSync : faSync} 
              className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform`} 
            />
            Actualiser
          </button>
        </div>

        {/* Carte Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-blue-100 hover:shadow-3xl transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Filières</p>
                <p className="text-3xl font-black text-blue-600 mt-2">{filieres.length}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon icon={faList} className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-amber-100 hover:shadow-3xl transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En édition</p>
                <p className="text-3xl font-black text-amber-500 mt-2">
                  {editingId ? "1" : "0"}
                </p>
              </div>
              <div className="bg-amber-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon icon={faEdit} className="text-amber-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-green-100 hover:shadow-3xl transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Filtrées</p>
                <p className="text-3xl font-black text-green-600 mt-2">{filteredFilieres.length}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon icon={faSearch} className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${editingId ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
              <FontAwesomeIcon icon={editingId ? faEdit : faPlus} className="text-lg" />
            </div>
            <h2 className="text-2xl font-black text-gray-800">
              {editingId ? "Modifier une Filière" : "Ajouter une Filière"}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-red-500">*</span>
                Nom de la filière
              </label>
              <input 
                className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white/50 placeholder-gray-400 font-medium"
                placeholder="ex: Informatique, Génie Civil..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <input 
                className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white/50 placeholder-gray-400 font-medium"
                placeholder="Description de la filière..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            {editingId && (
              <button 
                onClick={cancelEdit}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 font-semibold flex items-center justify-center gap-2 order-2 sm:order-1"
              >
                <FontAwesomeIcon icon={faTimes} />
                Annuler
              </button>
            )}
            <button 
              onClick={save}
              disabled={loading || !form.name.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center justify-center gap-2 order-1 sm:order-2 flex-1 sm:flex-none"
            >
              <FontAwesomeIcon icon={editingId ? faSave : faPlus} />
              {editingId ? "Mettre à jour" : "Ajouter la filière"}
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher une filière par nom ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 shadow-lg"
          />
        </div>

        {/* Tableau des filières */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200/50">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faGraduationCap} />
                          Nom de la filière
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faList} />
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/30 bg-white">
                    {filteredFilieres.map((f, index) => (
                      <tr 
                        key={f._id} 
                        className="hover:bg-blue-50/50 transition-all duration-300 group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {f.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{f.name}</div>
                              <div className="text-sm text-gray-500">
                                ID: {f._id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700 max-w-md">
                            {f.description || (
                              <span className="text-gray-400 italic">Aucune description</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => edit(f)}
                              className="bg-gradient-to-r from-amber-400 to-amber-500 text-white p-3 rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg group/tooltip relative"
                              title="Modifier"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            
                            <button 
                              onClick={() => remove(f._id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg group/tooltip relative"
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

              {/* Message si aucun résultat */}
              {filteredFilieres.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    {searchTerm ? "Aucune filière trouvée" : "Aucune filière disponible"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? "Aucune filière ne correspond à votre recherche" 
                      : "Commencez par ajouter une nouvelle filière"
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}