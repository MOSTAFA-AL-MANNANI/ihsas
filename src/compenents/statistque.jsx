import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

// Import FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, 
  faChartPie, 
  faUsers, 
  faGraduationCap, 
  faBriefcase, 
  faDownload,
  faFilePdf,
  faBuilding,
  faSync,
  faTrophy,
  faMedal,
  faStar
} from '@fortawesome/free-solid-svg-icons';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [centerStats, setCenterStats] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);

  // Références pour les graphiques
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  // 🟦 Charger les centres de formation
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3000/api/center");
        setCenters(res.data);
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
        axios.get(`http://localhost:3000/api/stats/center/${centerId}`),
        axios.get(`http://localhost:3000/api/stats/center/${centerId}/chart`)
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

  // 🟦 Fonction pour convertir un canvas en image base64
  const canvasToImage = (canvas) => {
    return canvas.toDataURL('image/png', 1.0);
  };

  // 🟦 Fonction pour créer un tableau manuellement dans le PDF
  const createTable = (doc, headers, data, startY, colWidths, options = {}) => {
    const { headerColor = [30, 64, 175], textColor = [0, 0, 0] } = options;
    const lineHeight = 10;
    const rowHeight = 12;
    let currentY = startY;
    
    // En-tête du tableau
    doc.setFillColor(...headerColor);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    
    let currentX = 20;
    headers.forEach((header, index) => {
      doc.rect(currentX, currentY, colWidths[index], rowHeight, 'F');
      doc.text(header, currentX + 5, currentY + 7);
      currentX += colWidths[index];
    });
    
    currentY += rowHeight;
    
    // Données du tableau
    doc.setTextColor(...textColor);
    doc.setFont(undefined, 'normal');
    
    data.forEach((row, rowIndex) => {
      currentX = 20;
      
      // Dessiner les cellules de la ligne
      row.forEach((cell, cellIndex) => {
        // Couleur de fond alternée pour les lignes
        if (rowIndex % 2 === 0 && rowIndex !== data.length - 1) {
          doc.setFillColor(240, 240, 240);
          doc.rect(currentX, currentY, colWidths[cellIndex], rowHeight, 'F');
        }
        
        // Texte de la cellule
        doc.setTextColor(...textColor);
        
        // Style pour la ligne de total
        if (rowIndex === data.length - 1) {
          doc.setFont(undefined, 'bold');
          doc.setTextColor(30, 64, 175);
          doc.setFillColor(220, 230, 255);
          doc.rect(currentX, currentY, colWidths[cellIndex], rowHeight, 'F');
        }
        
        doc.text(cell.toString(), currentX + 5, currentY + 7);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...textColor);
        
        currentX += colWidths[cellIndex];
      });
      
      currentY += rowHeight;
      
      // Vérifier si on dépasse la page
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
        
        // Redessiner l'en-tête sur la nouvelle page
        doc.setFillColor(...headerColor);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        
        currentX = 20;
        headers.forEach((header, index) => {
          doc.rect(currentX, currentY, colWidths[index], rowHeight, 'F');
          doc.text(header, currentX + 5, currentY + 7);
          currentX += colWidths[index];
        });
        
        currentY += rowHeight;
      }
    });
    
    return currentY;
  };

  // 🟦 Exporter les statistiques en PDF avec diagrammes
  const exportToPDF = async () => {
    if (!stats || !selectedCenter || !chartData) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucune donnée',
        text: 'Veuillez sélectionner un centre et attendre le chargement des données',
        confirmButtonColor: '#1e40af'
      });
      return;
    }

    try {
      const selectedCenterName = centers.find(c => c._id === selectedCenter)?.name || 'Centre inconnu';
      
      const doc = new jsPDF();
      
      // ==================== PAGE 1: STATISTIQUES ====================
      
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
      const tableData = [
        ['Disponible', stats.Disponible || 0],
        ['Stage', stats['Stage'] || 0],
        ['Emploi', stats['Emploi'] || 0],
        ['TOTAL', (stats.Disponible || 0) + (stats['Stage'] || 0) + (stats['Emploi'] || 0)]
      ];
      
      let currentY = createTable(
        doc, 
        ['Statut', 'Nombre de Candidats'], 
        tableData, 
        60, 
        [100, 70]
      );

      // Tableau de pourcentages
      currentY += 15;
      doc.setFontSize(16);
      doc.text('RÉPARTITION DES CANDIDATS (%)', 20, currentY);
      
      const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
      const percentageData = chartData.labels.map((label, index) => {
        const value = chartData.datasets[0].data[index];
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
        return [label, value.toString(), percentage];
      });

      percentageData.push(['TOTAL', total.toString(), '100%']);

      currentY = createTable(
        doc,
        ['Statut', 'Nombre', 'Pourcentage'],
        percentageData,
        currentY + 10,
        [70, 50, 50]
      );

      // Résumé statistique
      currentY += 20;
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text('RÉSUMÉ STATISTIQUE', 20, currentY);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      currentY += 10;
      doc.text(`• Total des candidats: ${total}`, 25, currentY);
      currentY += 6;
      doc.text(`• Centre: ${selectedCenterName}`, 25, currentY);
      currentY += 6;
      doc.text(`• Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`, 25, currentY);

      // Pied de page page 1
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Page 1/2 - Statistiques Détaillées', 105, 290, { align: 'center' });

      // ==================== PAGE 2: DIAGRAMMES ====================
      
      doc.addPage();

      // En-tête page 2
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('DIAGRAMMES STATISTIQUES', 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text(`Centre: ${selectedCenterName}`, 105, 30, { align: 'center' });

      doc.setTextColor(0, 0, 0);

      // Attendre que les graphiques soient rendus
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Section Diagramme en Barres
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.text('1. DIAGRAMME EN BARRES', 20, 55);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Répartition visuelle des candidats par statut', 20, 62);

      if (barChartRef.current) {
        const barCanvas = barChartRef.current.canvas;
        const barImage = canvasToImage(barCanvas);
        
        // Redimensionner l'image pour s'adapter à la page
        const barWidth = 170;
        const barHeight = 100;
        doc.addImage(barImage, 'PNG', 20, 70, barWidth, barHeight);
      } else {
        doc.setFontSize(12);
        doc.setTextColor(150, 150, 150);
        doc.text('Diagramme en barres non disponible', 20, 80);
      }

      // Section Diagramme Circulaire
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.text('2. DIAGRAMME CIRCULAIRE', 20, 185);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Pourcentages de répartition des candidats', 20, 192);

      if (pieChartRef.current) {
        const pieCanvas = pieChartRef.current.canvas;
        const pieImage = canvasToImage(pieCanvas);
        
        // Redimensionner l'image pour former un cercle parfait
        const pieSize = 80;
        const xPosition = 65;
        doc.addImage(pieImage, 'PNG', xPosition, 200, pieSize, pieSize);
        
        // Légende du diagramme circulaire
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        let legendY = 200;
        chartData.labels.forEach((label, index) => {
          const value = chartData.datasets[0].data[index];
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
          doc.text(`• ${label}: ${value} (${percentage})`, 150, legendY);
          legendY += 6;
        });
      } else {
        doc.setFontSize(12);
        doc.setTextColor(150, 150, 150);
        doc.text('Diagramme circulaire non disponible', 20, 200);
      }

      // Pied de page page 2
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Page 2/2 - Diagrammes et Analyse', 105, 290, { align: 'center' });

      // ==================== TÉLÉCHARGEMENT ====================
      
      // Sauvegarder le PDF
      const fileName = `statistiques-${selectedCenterName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      Swal.fire({
        icon: 'success',
        title: 'PDF Généré avec Succès',
        html: `
          <div class="text-center">
            <p>Le rapport complet a été téléchargé</p>
            <p class="text-sm text-gray-600">Fichier: ${fileName}</p>
          </div>
        `,
        timer: 3000,
        showConfirmButton: false,
        background: '#f8fafc'
      });

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur de Génération',
        text: 'Échec de la génération du PDF avec diagrammes',
        confirmButtonColor: '#1e40af'
      });
    }
  };

  // 🟦 Fonction utilitaire pour obtenir le nom du centre en toute sécurité
  const getCenterName = (center) => {
    return center?.name || center?.center || 'Centre sans nom';
  };

  // 🟦 Charger les statistiques de tous les centres avec la nouvelle API
  const loadAllCentersStats = async () => {
    try {
      setGlobalLoading(true);
      // Utiliser la nouvelle API optimisée
      const response = await axios.get("http://localhost:3000/api/stats/centers");
      
      console.log("Données reçues de l'API:", response.data);
      
      // Vérifier la structure des données et formater
      const formattedStats = response.data.centers.map(center => {
        const centerName = center?.center || center?.name || 'Centre sans nom';
        
        return {
          _id: center._id || `center-${Math.random()}`,
          name: centerName,
          statistics: {
            Disponible: center.Disponible || 0,
            'Stage': center['Stage'] || 0,
            'Emploi': center['Emploi'] || 0
          },
          total: center.total || 0,
          performance: center.performance || 0
        };
      }).filter(center => center.name !== 'Centre sans nom');
      
      setCenterStats(formattedStats);
      
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques globales:', err);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Charger les statistiques globales au chargement du composant
  useEffect(() => {
    if (centers.length > 0) {
      loadAllCentersStats();
    }
  }, [centers]);

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

  // Fonction pour recharger les statistiques globales
  const refreshGlobalStats = () => {
    loadAllCentersStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec boutons d'export */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">
            <FontAwesomeIcon icon={faChartBar} className="mr-3" />
            Tableau de Bord des Statistiques
          </h1>
          <p className="text-lg text-blue-600 mb-6">
            Visualisez les données de vos centres de formation
          </p>
          
          {/* Boutons d'export - SEULEMENT pour le centre sélectionné */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={exportToPDF}
              disabled={!stats || !chartData}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <FontAwesomeIcon icon={faFilePdf} />
              Exporter Rapport Complet (PDF)
            </button>
            <button
              onClick={refreshGlobalStats}
              disabled={globalLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <FontAwesomeIcon icon={faSync} className={globalLoading ? "animate-spin" : ""} />
              {globalLoading ? "Chargement..." : "Actualiser les Statistiques"}
            </button>
          </div>
        </div>

        {/* Sélection du centre */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
          <label className="block text-lg font-semibold text-blue-800 mb-4">
            <FontAwesomeIcon icon={faBuilding} className="mr-2" />
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
              <FontAwesomeIcon icon={faSync} className="animate-spin text-blue-700 mr-3" />
              <span className="text-blue-700 font-medium">Chargement...</span>
            </div>
          )}
        </div>

        {/* Statistiques globales des centres */}
        {centerStats.length > 0 && (
          <div className="mb-12 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-blue-800">
                  <FontAwesomeIcon icon={faTrophy} className="mr-3" />
                  Classement des Centres par Performance
                </h2>
                {globalLoading && (
                  <FontAwesomeIcon icon={faSync} className="animate-spin text-blue-700" />
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {centerStats.length} Centres
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Performance: {centerStats.reduce((sum, center) => sum + (center.performance || 0), 0)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {centerStats.map((center, index) => {
                const centerName = getCenterName(center);
                return (
                  <div 
                    key={center._id} 
                    className={`bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 ${
                      index === 0 ? 'border-yellow-500 bg-yellow-50' : 
                      index === 1 ? 'border-gray-400 bg-gray-50' : 
                      index === 2 ? 'border-orange-500 bg-orange-50' : 'border-blue-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-blue-800 truncate flex-1">
                        {index < 3 && (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {index === 0 ? <FontAwesomeIcon icon={faTrophy} /> :
                            index === 1 ? <FontAwesomeIcon icon={faMedal} /> :
                            <FontAwesomeIcon icon={faStar} />}
                          </span>
                        )}
                        {centerName}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-600">
                          <FontAwesomeIcon icon={faUsers} className="mr-2" />
                          Disponible:
                        </span>
                        <span className="font-bold text-blue-700">{center.statistics?.Disponible || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-600">
                          <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
                          Stage:
                        </span>
                        <span className="font-bold text-green-700">{center.statistics?.['Stage'] || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-600">
                          <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                          Emploi:
                        </span>
                        <span className="font-bold text-cyan-700">{center.statistics?.['Emploi'] || 0}</span>
                      </div>
                      
                      {/* Barre de performance */}
                      <div className="pt-2 mt-2 border-t">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray-600">Performance:</span>
                          <span className="font-bold text-green-600">{center.performance || 0}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${center.total > 0 ? ((center.performance / center.total) * 100) : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-gray-700">Total:</span>
                          <span className="text-blue-800">{center.total || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-700 mt-4">{stats.Disponible}</p>
              <p className="text-sm text-blue-500 mt-2">Candidats disponibles</p>
            </div>

            {/* Carte Stage */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-green-800">Stage</h3>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-green-600 text-xl" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-700 mt-4">{stats["Stage"]}</p>
              <p className="text-sm text-green-500 mt-2">Candidats Stage</p>
            </div>

            {/* Carte Emploi */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-l-4 border-cyan-500">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-cyan-800">Emploi</h3>
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faBriefcase} className="text-cyan-600 text-xl" />
                </div>
              </div>
              <p className="text-3xl font-bold text-cyan-700 mt-4">{stats["Emploi"]}</p>
              <p className="text-sm text-cyan-500 mt-2">Candidats Emploi</p>
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
                  <FontAwesomeIcon icon={faChartBar} className="mr-3" />
                  Répartition des Candidats
                </h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  Diagramme en Barres
                </span>
              </div>
              <div className="h-80">
                <Bar
                  ref={barChartRef}
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
                  <FontAwesomeIcon icon={faChartPie} className="mr-3" />
                  Pourcentage des Candidats
                </h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  Diagramme Circulaire
                </span>
              </div>
              <div className="h-96 flex justify-center items-center">
                <div className="w-full max-w-md h-full flex justify-center">
                  <Pie
                    ref={pieChartRef}
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
                      maintainAspectRatio: true,
                      aspectRatio: 1,
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
                      },
                      layout: {
                        padding: {
                          top: 20,
                          bottom: 20,
                          left: 20,
                          right: 20
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message quand aucun centre n'est sélectionné */}
        {!selectedCenter && !loading && (
          <div className="text-center py-16 animate-pulse">
            <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faChartBar} className="text-4xl text-blue-600" />
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