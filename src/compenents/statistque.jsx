import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [centerStats, setCenterStats] = useState([]);

  // 🟦 Charger les centres de formation
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://ihsas-back.vercel.app/api/center");
        setCenters(res.data);
        
        // Charger les statistiques globales des centres
        const statsRes = await axios.get("https://ihsas-back.vercel.app/api/stats/centers");
        setCenterStats(statsRes.data);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec du chargement des centres de formation',
          confirmButtonColor: '#1e40af'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, []);

  // 🟦 Charger les statistiques détaillées d'un centre
  const loadStats = async (centerId) => {
    try {
      setLoading(true);
      const [nums, chart] = await Promise.all([
        axios.get(`https://ihsas-back.vercel.app/api/stats/center/${centerId}`),
        axios.get(`https://ihsas-back.vercel.app/api/stats/center/${centerId}/chart`)
      ]);

      setStats(nums.data.statistics);
      setChartData(chart.data);

      Swal.fire({
        icon: 'success',
        title: 'Données chargées',
        text: 'Statistiques mises à jour avec succès',
        timer: 1500,
        showConfirmButton: false,
        background: '#f8fafc'
      });

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Échec du chargement des statistiques',
        confirmButtonColor: '#1e40af'
      });
    } finally {
      setLoading(false);
    }
  };

  // 🟦 Exporter les statistiques en PDF
  const exportToPDF = () => {
    if (!stats || !selectedCenter) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucune donnée',
        text: 'Veuillez sélectionner un centre pour exporter les statistiques',
        confirmButtonColor: '#1e40af'
      });
      return;
    }

    const selectedCenterName = centers.find(c => c._id === selectedCenter)?.name || 'Centre inconnu';
    
    const doc = new jsPDF();
    
    // En-tête du document
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('RAPPORT DES STATISTIQUES', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Centre: ${selectedCenterName}`, 105, 30, { align: 'center' });
    
    // Date de génération
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 37, { align: 'center' });
    
    // Statistiques principales
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('STATISTIQUES DES CANDIDATS', 20, 55);
    
    // Tableau des statistiques
    doc.autoTable({
      startY: 60,
      head: [['Statut', 'Nombre de Candidats']],
      body: [
        ['Disponible', stats.Disponible || 0],
        ['En Stage', stats['En Stage'] || 0],
        ['En Travail', stats['En Travail'] || 0],
        ['Total', (stats.Disponible || 0) + (stats['En Stage'] || 0) + (stats['En Travail'] || 0)]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 12,
        cellPadding: 5
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });

    // Ajouter les graphiques si disponibles
    if (chartData) {
      const finalY = doc.lastAutoTable.finalY + 15;
      
      // Section graphiques
      doc.setFontSize(16);
      doc.text('RÉPARTITION DES CANDIDATS', 20, finalY);
      
      // Tableau de pourcentages
      doc.autoTable({
        startY: finalY + 10,
        head: [['Statut', 'Nombre', 'Pourcentage']],
        body: chartData.labels.map((label, index) => {
          const value = chartData.datasets[0].data[index];
          const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
          return [label, value, percentage];
        }),
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold'
        }
      });
    }

    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} / ${pageCount}`, 105, 290, { align: 'center' });
    }

    // Sauvegarder le PDF
    doc.save(`statistiques-${selectedCenterName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    Swal.fire({
      icon: 'success',
      title: 'PDF Généré',
      text: 'Le rapport a été téléchargé avec succès',
      timer: 2000,
      showConfirmButton: false,
      background: '#f8fafc'
    });
  };

  // 🟦 Exporter les statistiques globales des centres en PDF
  const exportAllCentersPDF = () => {
    if (centerStats.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucune donnée',
        text: 'Aucune statistique de centre disponible',
        confirmButtonColor: '#1e40af'
      });
      return;
    }

    const doc = new jsPDF();
    
    // En-tête
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('STATISTIQUES GLOBALES DES CENTRES', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Rapport Complet', 105, 30, { align: 'center' });
    
    // Date
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 37, { align: 'center' });
    
    // Tableau des centres
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('STATISTIQUES PAR CENTRE', 20, 55);
    
    const tableData = centerStats.map(center => [
      center.name,
      center.statistics?.Disponible || 0,
      center.statistics?.['En Stage'] || 0,
      center.statistics?.['En Travail'] || 0,
      (center.statistics?.Disponible || 0) + (center.statistics?.['En Stage'] || 0) + (center.statistics?.['En Travail'] || 0)
    ]);

    // Totaux
    const totals = tableData.reduce((acc, row) => {
      return [
        '',
        acc[1] + row[1],
        acc[2] + row[2],
        acc[3] + row[3],
        acc[4] + row[4]
      ];
    }, ['TOTAL', 0, 0, 0, 0]);

    doc.autoTable({
      startY: 60,
      head: [['Centre', 'Disponible', 'En Stage', 'En Travail', 'Total']],
      body: [...tableData, totals],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });

    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} / ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`statistiques-globales-centres-${new Date().toISOString().split('T')[0]}.pdf`);
    
    Swal.fire({
      icon: 'success',
      title: 'PDF Généré',
      text: 'Le rapport global a été téléchargé',
      timer: 2000,
      showConfirmButton: false,
      background: '#f8fafc'
    });
  };

  const handleCenterChange = (e) => {
    const centerId = e.target.value;
    setSelectedCenter(centerId);
    if (centerId) {
      loadStats(centerId);
    } else {
      setStats(null);
      setChartData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec boutons d'export */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">
            📊 Tableau de Bord des Statistiques
          </h1>
          <p className="text-lg text-blue-600 mb-6">
            Visualisez les données de vos centres de formation
          </p>
          
          {/* Boutons d'export */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={exportAllCentersPDF}
              disabled={centerStats.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              📋 Exporter Tous les Centres (PDF)
            </button>
            
            <button
              onClick={exportToPDF}
              disabled={!stats}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              📊 Exporter Ce Centre (PDF)
            </button>
          </div>
        </div>

        {/* Sélection du centre */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
          <label className="block text-lg font-semibold text-blue-800 mb-4">
            Sélectionnez un Centre de Formation
          </label>
          <select
            value={selectedCenter}
            onChange={handleCenterChange}
            disabled={loading}
            className="w-full md:w-96 p-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-300 bg-white text-blue-900 font-medium"
          >
            <option value="">Choisissez un centre de formation</option>
            {centers.map((c) => (
              <option key={c._id} value={c._id} className="py-2">
                {c.name}
              </option>
            ))}
          </select>
          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              <span className="ml-3 text-blue-700 font-medium">Chargement...</span>
            </div>
          )}
        </div>

        {/* Statistiques globales des centres */}
        {centerStats.length > 0 && (
          <div className="mb-12 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-800">
                📈 Aperçu de Tous les Centres
              </h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {centerStats.length} Centres
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {centerStats.slice(0, 6).map((center, index) => (
                <div 
                  key={center._id} 
                  className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-blue-500"
                >
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 truncate">
                    {center.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600">Disponible:</span>
                      <span className="font-bold text-blue-700">{center.statistics?.Disponible || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600">En Stage:</span>
                      <span className="font-bold text-green-700">{center.statistics?.['En Stage'] || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-600">En Travail:</span>
                      <span className="font-bold text-cyan-700">{center.statistics?.['En Travail'] || 0}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-700">Total:</span>
                        <span className="text-blue-800">
                          {(center.statistics?.Disponible || 0) + 
                           (center.statistics?.['En Stage'] || 0) + 
                           (center.statistics?.['En Travail'] || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {centerStats.length > 6 && (
              <div className="text-center mt-6">
                <p className="text-blue-600">
                  Et {centerStats.length - 6} autres centres...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Cartes de statistiques détaillées */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up">
            {/* Carte Disponible */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-800">Disponible</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">👥</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-700 mt-4">{stats.Disponible}</p>
              <p className="text-sm text-blue-500 mt-2">Candidats disponibles</p>
            </div>

            {/* Carte En Stage */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-green-800">En Stage</h3>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl">🎓</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-700 mt-4">{stats["En Stage"]}</p>
              <p className="text-sm text-green-500 mt-2">Candidats en stage</p>
            </div>

            {/* Carte En Travail */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-l-4 border-cyan-500">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-cyan-800">En Travail</h3>
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                  <span className="text-cyan-600 text-xl">💼</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-cyan-700 mt-4">{stats["En Travail"]}</p>
              <p className="text-sm text-cyan-500 mt-2">Candidats en travail</p>
            </div>
          </div>
        )}

        {/* Graphiques */}
        {chartData && (
          <div className="space-y-12 animate-fade-in">
            {/* Graphique Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-800 flex items-center">
                  <span className="mr-3">📈</span>
                  Répartition des Candidats
                </h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  Diagramme en Barres
                </span>
              </div>
              <div className="h-80">
                <Bar
                  data={{
                    labels: chartData.labels,
                    datasets: [{
                      label: "Nombre de candidats",
                      data: chartData.datasets[0].data,
                      backgroundColor: ["#1e40af", "#059669", "#0d9488"],
                      borderColor: ["#1e3a8a", "#047857", "#0f766e"],
                      borderWidth: 2,
                      borderRadius: 8,
                      hoverBackgroundColor: ["#3730a3", "#10b981", "#14b8a6"]
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          font: {
                            family: 'inherit',
                            size: 14
                          },
                          color: '#1e40af'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Graphique Pie */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-800 flex items-center">
                  <span className="mr-3">🟢</span>
                  Pourcentage des Candidats
                </h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  Diagramme Circulaire
                </span>
              </div>
              <div className="h-96 flex justify-center">
                <Pie
                  data={{
                    labels: chartData.labels,
                    datasets: [{
                      data: chartData.datasets[0].data,
                      backgroundColor: ["#1e40af", "#059669", "#0d9488"],
                      borderColor: ["#1e3a8a", "#047857", "#0f766e"],
                      borderWidth: 3,
                      hoverOffset: 15
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            family: 'inherit',
                            size: 14
                          },
                          padding: 20,
                          color: '#1e40af'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Message quand aucun centre n'est sélectionné */}
        {!selectedCenter && !loading && (
          <div className="text-center py-16 animate-pulse">
            <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-blue-800 mb-4">
              Sélectionnez un Centre
            </h3>
            <p className="text-blue-600 max-w-md mx-auto">
              Veuillez choisir un centre de formation dans la liste déroulante pour afficher les statistiques détaillées.
            </p>
          </div>
        )}
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
      `}</style>
    </div>
  );
}