import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, Store, Users, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { produitsAPI, stocksAPI, magasinsAPI, usersAPI } from '../../config/api';
import { Produit, Stock, Magasin, User } from '../../types';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProduits: 0,
    totalMagasins: 0,
    totalUtilisateurs: 0,
    alertesStock: 0,
    valeurTotaleStock: 0
  });
  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Récupérer les produits
      const produitsResponse = await produitsAPI.getAll();
      const produits = produitsResponse.data;

      // Récupérer les magasins
      const magasinsResponse = await magasinsAPI.getAll();
      const magasins = magasinsResponse.data;

      // Récupérer les utilisateurs
      const utilisateursResponse = await usersAPI.getAll();
      const utilisateurs = utilisateursResponse.data;

      // Récupérer les stocks
      const stocksResponse = await stocksAPI.getAll();
      const stocks = stocksResponse.data;

      // Calculer les alertes de stock
      let alertesCount = 0;
      let valeurTotale = 0;
      const stockDataMap = new Map();

      stocks?.forEach((stock: any) => {
        const produit = produits?.find((p: any) => p.id === stock.produit_id);
        if (produit) {
          if (stock.quantite <= produit.seuil_alerte) {
            alertesCount++;
          }
          valeurTotale += stock.quantite * produit.prix_unitaire;

          const magasin = magasins?.find((m: any) => m.id === stock.magasin_id);
          if (magasin) {
            const key = magasin.nom;
            if (stockDataMap.has(key)) {
              stockDataMap.set(key, stockDataMap.get(key) + stock.quantite);
            } else {
              stockDataMap.set(key, stock.quantite);
            }
          }
        }
      });

      const stockChartData = Array.from(stockDataMap.entries()).map(([nom, quantite]) => ({
        magasin: nom,
        quantite
      }));

      setStats({
        totalProduits: produits?.length || 0,
        totalMagasins: magasins?.length || 0,
        totalUtilisateurs: utilisateurs?.length || 0,
        alertesStock: alertesCount,
        valeurTotaleStock: valeurTotale
      });

      setStockData(stockChartData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Produits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProduits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Store className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Magasins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMagasins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUtilisateurs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alertes Stock</p>
              <p className="text-2xl font-bold text-gray-900">{stats.alertesStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.valeurTotaleStock.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stock par Magasin</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="magasin" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantite" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition des Stocks</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ magasin, percent }) => `${magasin} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantite"
              >
                {stockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertes */}
      {stats.alertesStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Attention: {stats.alertesStock} produit(s) en rupture de stock
              </h3>
              <p className="text-red-600 mt-1">
                Certains produits ont atteint leur seuil d'alerte. Vérifiez la section Stock pour plus de détails.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};