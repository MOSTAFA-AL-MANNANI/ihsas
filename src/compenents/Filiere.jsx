import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEdit, 
  faTrash, 
  faPlus, 
  faGraduationCap, 
  faBuilding,
  faListAlt,
  faSync,
  faSearch
} from "@fortawesome/free-solid-svg-icons";

export default function FiliereManager() {
  const [filieres, setFilieres] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    center: "",
  });

  const [editingId, setEditingId] = useState(null);

  // Charger tous les centres
  useEffect(() => {
    axios
      .get("http://ihsas-back.vercel.app/api/center")
      .then((res) => setCenters(res.data))
      .catch((err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec du chargement des centres',
          confirmButtonColor: '#1e40af',
          background: '#f8fafc'
        });
      });
  }, []);

  // Charger les filières
  const loadFilieres = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://ihsas-back.vercel.app/api/filiere");
      setFilieres(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Échec du chargement des filières',
        confirmButtonColor: '#1e40af',
        background: '#f8fafc'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilieres();
  }, []);

  // Filtrer les filières selon la recherche
  const filteredFilieres = filieres.filter(filiere =>
    filiere.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filiere.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filiere.center?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gestion des inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Ajouter ou modifier
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(`http://ihsas-back.vercel.app/api/filiere/${editingId}`, form);
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'La filière a été modifiée avec succès.',
          confirmButtonColor: '#1e40af',
          background: '#f8fafc',
          timer: 2000,
          showConfirmButton: false
        });
        setEditingId(null);
      } else {
        await axios.post("http://ihsas-back.vercel.app/api/filiere", form);
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'La filière a été ajoutée avec succès.',
          confirmButtonColor: '#1e40af',
          background: '#f8fafc',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setForm({ name: "", description: "", center: "" });
      loadFilieres();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors de l\'opération.',
        confirmButtonColor: '#1e40af',
        background: '#f8fafc'
      });
    }
  };

  // Remplir le formulaire lors de l'édition
  const handleEdit = (f) => {
    setForm({
      name: f.name,
      description: f.description || "",
      center: f.center?._id || "",
    });
    setEditingId(f._id);
    
    // Scroll vers le formulaire
    document.getElementById('form-filiere').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", description: "", center: "" });
    
    Swal.fire({
      icon: 'info',
      title: 'Modification annulée',
      text: 'Vous pouvez continuer à ajouter de nouvelles filières.',
      confirmButtonColor: '#1e40af',
      background: '#f8fafc',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Supprimer filière
  const handleDelete = async (id) => {
    const filiereToDelete = filieres.find(f => f._id === id);
    
    Swal.fire({
      title: 'Confirmation de suppression',
      html: `
        <div class="text-center">
          <p>Êtes-vous sûr de vouloir supprimer la filière :</p>
          <p class="font-bold text-blue-700 mt-2">"${filiereToDelete?.name}"</p>
          <p class="text-sm text-gray-600 mt-2">Cette action est irréversible.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#1e40af',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      background: '#f8fafc',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-4 py-2 rounded-lg',
        cancelButton: 'px-4 py-2 rounded-lg'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://ihsas-back.vercel.app/api/filiere/${id}`);
          await loadFilieres();
          
          Swal.fire({
            icon: 'success',
            title: 'Supprimée',
            text: 'La filière a été supprimée avec succès.',
            confirmButtonColor: '#1e40af',
            background: '#f8fafc',
            timer: 2000,
            showConfirmButton: false
          });
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Échec de la suppression de la filière.',
            confirmButtonColor: '#1e40af',
            background: '#f8fafc'
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FontAwesomeIcon icon={faGraduationCap} className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-blue-800 mb-3">
            Gestion des Filières
          </h1>
          <p className="text-lg text-blue-600 max-w-2xl mx-auto">
            Gérez et organisez les filières de formation de vos centres
          </p>
        </div>

        {/* Carte de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-blue-500">
            <FontAwesomeIcon icon={faListAlt} className="text-blue-600 text-2xl mb-3" />
            <h3 className="text-lg font-semibold text-blue-800">Total des Filières</h3>
            <p className="text-3xl font-bold text-blue-700 mt-2">{filieres.length}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-green-500">
            <FontAwesomeIcon icon={faBuilding} className="text-green-600 text-2xl mb-3" />
            <h3 className="text-lg font-semibold text-green-800">Centres Actifs</h3>
            <p className="text-3xl font-bold text-green-700 mt-2">{centers.length}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-purple-500">
            <FontAwesomeIcon icon={faGraduationCap} className="text-purple-600 text-2xl mb-3" />
            <h3 className="text-lg font-semibold text-purple-800">Filières Filtrées</h3>
            <p className="text-3xl font-bold text-purple-700 mt-2">{filteredFilieres.length}</p>
          </div>
        </div>

        {/* Formulaire */}
        <div 
          id="form-filiere"
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl border border-blue-200 animate-slide-up"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-blue-800 flex items-center gap-3">
              <FontAwesomeIcon icon={editingId ? faEdit : faPlus} className="text-blue-600" />
              {editingId ? "Modifier une Filière" : "Ajouter une Nouvelle Filière"}
            </h3>
            
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                Annuler
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Nom de la Filière *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Développement Web, Marketing Digital..."
                  className="w-full p-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-300 bg-white text-blue-900 font-medium placeholder-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Centre de Formation *
                </label>
                <select
                  name="center"
                  value={form.center}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-300 bg-white text-blue-900 font-medium"
                >
                  <option value="" className="text-blue-400">Sélectionner un centre</option>
                  {centers.map((c) => (
                    <option key={c._id} value={c._id} className="py-2">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-2">
                Description de la Filière
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Décrivez les objectifs et le contenu de cette filière..."
                rows="4"
                className="w-full p-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-300 bg-white text-blue-900 font-medium placeholder-blue-400 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3 ${
                editingId 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FontAwesomeIcon icon={editingId ? faEdit : faPlus} />
              {editingId ? "Mettre à Jour la Filière" : "Ajouter la Filière"}
            </button>
          </form>
        </div>

        {/* Barre de recherche et statistiques */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-3">
              <FontAwesomeIcon icon={faListAlt} />
              Liste des Filières
            </h2>
            
            <button
              onClick={loadFilieres}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSync} className={loading ? "animate-spin" : ""} />
              {loading ? "Chargement..." : "Actualiser"}
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400"
            />
            <input
              type="text"
              placeholder="Rechercher une filière..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-300 bg-white text-blue-900 placeholder-blue-400"
            />
          </div>
        </div>

        {/* Tableau des filières */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
          {filteredFilieres.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faListAlt} className="text-blue-300 text-6xl mb-4" />
              <h3 className="text-xl font-semibold text-blue-800 mb-2">
                {searchTerm ? "Aucune filière trouvée" : "Aucune filière disponible"}
              </h3>
              <p className="text-blue-600">
                {searchTerm 
                  ? "Aucune filière ne correspond à votre recherche." 
                  : "Commencez par ajouter votre première filière."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="p-4 text-left font-semibold">Nom de la Filière</th>
                    <th className="p-4 text-left font-semibold">Description</th>
                    <th className="p-4 text-left font-semibold">Centre</th>
                    <th className="p-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFilieres.map((f, index) => (
                    <tr 
                      key={f._id} 
                      className={`border-b border-blue-100 transition-all duration-300 hover:bg-blue-50 ${
                        index % 2 === 0 ? 'bg-blue-25' : 'bg-white'
                      } animate-fade-in`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="p-4 font-semibold text-blue-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600" />
                          </div>
                          {f.name}
                        </div>
                      </td>
                      <td className="p-4 text-blue-800">
                        {f.description || (
                          <span className="text-blue-400 italic">Aucune description</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-blue-700">
                          <FontAwesomeIcon icon={faBuilding} className="text-blue-500" />
                          {f.center?.name || (
                            <span className="text-red-400 italic">Centre non assigné</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(f)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                            title="Modifier cette filière"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(f._id)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                            title="Supprimer cette filière"
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
          )}
        </div>

        {/* Pied de page informatif */}
        <div className="mt-8 text-center text-blue-600 text-sm">
          <p>
            {filteredFilieres.length} filière{filteredFilieres.length !== 1 ? 's' : ''} affichée{filteredFilieres.length !== 1 ? 's' : ''} 
            {searchTerm && ` (sur ${filieres.length} au total)`}
          </p>
        </div>
      </div>

      {/* Styles d'animation personnalisés */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        .bg-blue-25 {
          background-color: #f0f9ff;
        }
      `}</style>
    </div>
  );
}