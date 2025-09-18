import { useState, useCallback } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import * as XLSX from 'xlsx';

/**
 * Hook pour exporter toutes les données de la base de données Firebase
 * Génère un fichier Excel avec toutes les collections dans des feuilles séparées
 */
export function useDatabaseExporter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  // Liste de toutes les collections à exporter
  const COLLECTIONS = [
    'users',
    'projects', 
    'payments',
    'notes',
    'media',
    'events',
    'documents',
    'plans',
    'devis',
    'devisConfig',
    'artisan_projet',
    'revolut_transactions',
    'qonto_transactions',
    'qonto_accounts'
  ];

  const exportDatabase = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress("Initialisation de l'export...");

    try {
      const workbook = XLSX.utils.book_new();
      let totalCollections = COLLECTIONS.length;
      let processedCollections = 0;

      for (const collectionName of COLLECTIONS) {
        try {
          setProgress(`Export de la collection "${collectionName}" (${processedCollections + 1}/${totalCollections})...`);
          
          // Récupérer toutes les données de la collection
          const collectionRef = collection(db, collectionName);
          let querySnapshot;
          
          // Essayer avec orderBy si possible, sinon récupérer directement
          try {
            const q = query(collectionRef, orderBy("createdAt", "desc"));
            querySnapshot = await getDocs(q);
          } catch {
            // Si orderBy échoue (pas de champ createdAt), récupérer sans tri
            querySnapshot = await getDocs(collectionRef);
          }

          const data: any[] = [];
          
          querySnapshot.forEach((doc) => {
            const docData = doc.data();
            
            // Convertir les timestamps Firestore en dates lisibles
            const processedData = { id: doc.id, ...docData };
            Object.keys(processedData).forEach(key => {
              const value = processedData[key];
              
              // Convertir les timestamps Firestore
              if (value && typeof value === 'object' && value.toDate) {
                processedData[key] = value.toDate().toISOString();
              }
              // Convertir les arrays en strings pour Excel
              else if (Array.isArray(value)) {
                processedData[key] = JSON.stringify(value);
              }
              // Convertir les objets en strings pour Excel
              else if (value && typeof value === 'object') {
                processedData[key] = JSON.stringify(value);
              }
            });
            
            data.push(processedData);
          });

          // Créer la feuille Excel pour cette collection
          if (data.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(data);
            
            // Ajuster la largeur des colonnes
            const colWidths = Object.keys(data[0]).map(key => ({
              wch: Math.max(key.length, 15)
            }));
            worksheet['!cols'] = colWidths;
            
            XLSX.utils.book_append_sheet(workbook, worksheet, collectionName);
          } else {
            // Créer une feuille vide avec juste les en-têtes
            const emptySheet = XLSX.utils.aoa_to_sheet([['Collection vide - Aucune donnée']]);
            XLSX.utils.book_append_sheet(workbook, emptySheet, collectionName);
          }

          processedCollections++;
          
        } catch (collectionError) {
          console.warn(`Erreur lors de l'export de la collection ${collectionName}:`, collectionError);
          
          // Créer une feuille d'erreur pour cette collection
          const errorSheet = XLSX.utils.aoa_to_sheet([
            ['Erreur lors de l\'export'],
            ['Collection:', collectionName],
            ['Erreur:', String(collectionError)]
          ]);
          XLSX.utils.book_append_sheet(workbook, errorSheet, `${collectionName}_ERROR`);
        }
      }

      // Ajouter une feuille de résumé
      setProgress("Génération du résumé...");
      const summaryData = [
        ['Résumé de l\'export de la base de données'],
        ['Date d\'export:', new Date().toISOString()],
        ['Collections exportées:', processedCollections.toString()],
        ['Collections totales:', totalCollections.toString()],
        [''],
        ['Liste des collections:'],
        ...COLLECTIONS.map(name => [name])
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'RESUME', 0); // Mettre en première position

      // Générer le fichier Excel
      setProgress("Génération du fichier Excel...");
      const fileName = `aximotravo_database_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Télécharger le fichier
      XLSX.writeFile(workbook, fileName);
      
      setProgress(`✅ Export terminé ! Fichier téléchargé: ${fileName}`);
      
      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setProgress("");
      }, 3000);

    } catch (err: any) {
      console.error("Erreur lors de l'export de la base de données:", err);
      setError(err.message || "Erreur lors de l'export de la base de données");
    } finally {
      setLoading(false);
    }
  }, []);

  const resetMessages = useCallback(() => {
    setError(null);
    setProgress("");
  }, []);

  return {
    exportDatabase,
    loading,
    error,
    progress,
    resetMessages
  };
}
