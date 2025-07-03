import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, AlertTriangle, Save, X, Warehouse } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { Stock, Produit, Magasin } from '../../types';
import toast from 'react-hot-toast';

export const StockPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [formData, setFormData] = useState({
    produit_id: '',
    magasin_id: '',
    quantite: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Récupérer les stocks
      const { data: stocksData, error: stocksError } = await supabase
        .from('stocks')
        .select('*');

      if (stocksError) throw stocksError;

      // Récupérer les produits
      const { data: produitsData, error: produitsError } = await supabase
        .from('produits')
        .select('*');

      if (produitsError) throw produitsError;

      // Récupérer les magasins
      const { data: magasinsData, error: magasinsError } = await supabase
        .from('magasins')
        .select('*');

      if (magasinsError) throw magasinsError;

      setStocks(stocksData || []);
      setProduits(produitsData || []);
      setMagasins(magasinsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stockData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (editingStock) {
        const { error } = await supabase
          .from('stocks')
          .update(stockData)
          .eq('id', editingStock.id);

        if (error) throw error;
        toast.success('Stock modifié avec succès');
      } else {
        const { error } = await supabase
          .from('stocks')
          .insert([stockData]);

        if (error) throw error;
        toast.success('Stock ajouté avec succès');
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    setFormData({
      produit_id: stock.produit_id,
      magasin_id: stock.magasin_id,
      quantite: stock.quantite
    });
    setShowModal(true);
  };

  const handleDelete = async (stock: Stock) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce stock ?')) return;

    try {
      const { error } = await supabase
        .from('stocks')
        .delete()
        .eq('id', stock.id);

      if (error) throw error;
      toast.success('Stock supprimé avec succès');
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      produit_id: '',
      magasin_id: '',
      quantite: 0
    });
    setEditingStock(null);
    setShowModal(false);
  };

  const getStockWithDetails = () => {
    return stocks.map(stock => {
      const produit = produits.find(p => p.id === stock.produit_id);
      const magasin = magasins.find(m => m.id === stock.magasin_id);
      return { stock, produit, magasin };
    }).filter(item => item.produit && item.magasin);
  };

  const filteredStocks = getStockWithDetails().filter(({ produit, magasin }) =>
    produit && magasin && (
      produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      magasin.nom.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading && stocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du Stock</h1>
          <p className="text-gray-600 mt-1">Gérez les stocks de tous vos magasins</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter Stock</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher par produit ou magasin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Magasin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStocks.map(({ stock, produit, magasin }) => {
                if (!produit || !magasin) return null;
                
                const isLowStock = stock.quantite <= produit.seuil_alerte;
                const valeurStock = stock.quantite * produit.prix_unitaire;
                
                return (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {produit.image_url ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={produit.image_url}
                              alt={produit.nom}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{produit.nom}</div>
                          <div className="text-sm text-gray-500">Réf: {produit.reference}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{magasin.nom}</div>
                      <div className="text-sm text-gray-500">{magasin.adresse}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                        {stock.quantite}
                      </div>
                      <div className="text-sm text-gray-500">
                        Seuil: {produit.seuil_alerte}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isLowStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Stock bas
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          En stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {valeurStock.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(stock)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(stock)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center py-12">
          <Warehouse className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun stock trouvé</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Aucun stock ne correspond à votre recherche.' : 'Commencez par ajouter du stock.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingStock ? 'Modifier le Stock' : 'Ajouter du Stock'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Produit *
                  </label>
                  <select
                    required
                    value={formData.produit_id}
                    onChange={(e) => setFormData({ ...formData, produit_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un produit</option>
                    {produits.map((produit) => (
                      <option key={produit.id} value={produit.id}>
                        {produit.nom} - {produit.reference}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Magasin *
                  </label>
                  <select
                    required
                    value={formData.magasin_id}
                    onChange={(e) => setFormData({ ...formData, magasin_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un magasin</option>
                    {magasins.map((magasin) => (
                      <option key={magasin.id} value={magasin.id}>
                        {magasin.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingStock ? 'Modifier' : 'Ajouter'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};