import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Package, AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Stock, Produit, Magasin, Presence } from '../../types';
import toast from 'react-hot-toast';

export const EmployeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getCurrentPosition, calculateDistance, loading: geoLoading, error: geoError } = useGeolocation();
  const [magasin, setMagasin] = useState<Magasin | null>(null);
  const [stats, setStats] = useState({
    totalProduits: 0,
    produitsAlertes: 0
  });
  const [pointageLoading, setPointageLoading] = useState(false);
  const [pointageMessage, setPointageMessage] = useState('');
  const [lastPointage, setLastPointage] = useState<Presence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.magasin_id) {
        setLoading(false);
        return;
      }

      try {
        // Récupérer le magasin de l'employé
        const { data: magasinData, error: magasinError } = await supabase
          .from('magasins')
          .select('*')
          .eq('id', user.magasin_id)
          .single();

        if (magasinError) throw magasinError;
        setMagasin(magasinData);

        // Récupérer les stocks du magasin
        const { data: stocks, error: stocksError } = await supabase
          .from('stocks')
          .select('*')
          .eq('magasin_id', user.magasin_id);

        if (stocksError) throw stocksError;

        // Récupérer les produits pour vérifier les alertes
        const { data: produits, error: produitsError } = await supabase
          .from('produits')
          .select('*');

        if (produitsError) throw produitsError;

        let produitsAlertes = 0;
        stocks?.forEach(stock => {
          const produit = produits?.find(p => p.id === stock.produit_id);
          if (produit && stock.quantite <= produit.seuil_alerte) {
            produitsAlertes++;
          }
        });

        setStats({
          totalProduits: stocks?.length || 0,
          produitsAlertes
        });

        // Récupérer le dernier pointage
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const { data: presences, error: presencesError } = await supabase
          .from('presences')
          .select('*')
          .eq('user_id', user.id)
          .gte('date_pointage', startOfDay.toISOString())
          .lt('date_pointage', endOfDay.toISOString())
          .order('date_pointage', { ascending: false })
          .limit(1);

        if (presencesError) throw presencesError;

        if (presences && presences.length > 0) {
          setLastPointage({
            ...presences[0],
            date_pointage: new Date(presences[0].date_pointage)
          });
        }

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handlePointage = async () => {
    if (!user || !magasin) return;

    setPointageLoading(true);
    setPointageMessage('');

    try {
      const position = await getCurrentPosition();
      const distance = calculateDistance(
        position.latitude,
        position.longitude,
        magasin.latitude,
        magasin.longitude
      );

      if (distance > 100) {
        setPointageMessage(`Vous êtes trop loin du magasin (${Math.round(distance)}m). Vous devez être dans un rayon de 100m.`);
        return;
      }

      // Vérifier s'il y a déjà un pointage aujourd'hui
      if (lastPointage) {
        setPointageMessage('Vous avez déjà pointé aujourd\'hui.');
        return;
      }

      const { error } = await supabase
        .from('presences')
        .insert([{
          user_id: user.id,
          magasin_id: magasin.id,
          date_pointage: new Date().toISOString(),
          latitude: position.latitude,
          longitude: position.longitude,
          type: 'arrivee'
        }]);

      if (error) throw error;

      setPointageMessage('Pointage enregistré avec succès !');
      setLastPointage({
        id: '',
        user_id: user.id,
        magasin_id: magasin.id,
        date_pointage: new Date(),
        latitude: position.latitude,
        longitude: position.longitude,
        type: 'arrivee'
      });

      toast.success('Pointage enregistré avec succès !');

    } catch (error) {
      console.error('Erreur lors du pointage:', error);
      setPointageMessage('Erreur lors du pointage. Vérifiez que la géolocalisation est activée.');
      toast.error('Erreur lors du pointage');
    } finally {
      setPointageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Employé</h1>
        <p className="text-gray-600 mt-2">Bienvenue, {user?.email}</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Produits en stock</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProduits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alertes stock</p>
              <p className="text-2xl font-bold text-gray-900">{stats.produitsAlertes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Magasin</p>
              <p className="text-lg font-bold text-gray-900">{magasin?.nom || 'Non assigné'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section pointage */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Pointage</h2>
          <Clock className="h-6 w-6 text-gray-400" />
        </div>

        {lastPointage ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">Pointage effectué aujourd'hui</p>
            <p className="text-green-600 text-sm">
              {lastPointage.date_pointage.toLocaleString('fr-FR')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Vous pouvez pointer votre arrivée. Assurez-vous d'être dans un rayon de 100m du magasin.
            </p>
            <button
              onClick={handlePointage}
              disabled={pointageLoading || geoLoading || !magasin}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {pointageLoading || geoLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Pointage en cours...
                </div>
              ) : (
                'Pointer mon arrivée'
              )}
            </button>

            {pointageMessage && (
              <div className={`p-4 rounded-lg ${
                pointageMessage.includes('succès') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {pointageMessage}
              </div>
            )}

            {geoError && (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200">
                {geoError}
              </div>
            )}

            {!magasin && (
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200">
                Aucun magasin assigné. Contactez votre administrateur.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => window.location.href = '/employe/stock'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors duration-200"
          >
            <Package className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Consulter le stock</h3>
            <p className="text-sm text-gray-600">Voir les produits disponibles</p>
          </button>
          <button 
            onClick={() => window.location.href = '/employe/pointage'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors duration-200"
          >
            <Clock className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Gérer le pointage</h3>
            <p className="text-sm text-gray-600">Voir l'historique des présences</p>
          </button>
        </div>
      </div>
    </div>
  );
};