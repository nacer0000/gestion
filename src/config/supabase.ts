import { createClient } from '@supabase/supabase-js';

// Remplacez ces valeurs par vos vraies clés Supabase
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'employe';
          magasin_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: 'admin' | 'employe';
          magasin_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'employe';
          magasin_id?: string | null;
          created_at?: string;
        };
      };
      magasins: {
        Row: {
          id: string;
          nom: string;
          adresse: string;
          latitude: number;
          longitude: number;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          adresse: string;
          latitude: number;
          longitude: number;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          adresse?: string;
          latitude?: number;
          longitude?: number;
          image_url?: string | null;
          created_at?: string;
        };
      };
      produits: {
        Row: {
          id: string;
          nom: string;
          reference: string;
          categorie: string;
          prix_unitaire: number;
          seuil_alerte: number;
          image_url: string | null;
          fournisseur_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          reference: string;
          categorie: string;
          prix_unitaire: number;
          seuil_alerte: number;
          image_url?: string | null;
          fournisseur_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          reference?: string;
          categorie?: string;
          prix_unitaire?: number;
          seuil_alerte?: number;
          image_url?: string | null;
          fournisseur_id?: string | null;
          created_at?: string;
        };
      };
      fournisseurs: {
        Row: {
          id: string;
          nom: string;
          adresse: string;
          contact: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          adresse: string;
          contact: string;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          adresse?: string;
          contact?: string;
          image_url?: string | null;
          created_at?: string;
        };
      };
      stocks: {
        Row: {
          id: string;
          produit_id: string;
          magasin_id: string;
          quantite: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          produit_id: string;
          magasin_id: string;
          quantite: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          produit_id?: string;
          magasin_id?: string;
          quantite?: number;
          updated_at?: string;
        };
      };
      mouvements: {
        Row: {
          id: string;
          produit_id: string;
          magasin_id: string;
          user_id: string;
          type: 'entrée' | 'sortie';
          quantite: number;
          date: string;
          motif: string;
        };
        Insert: {
          id?: string;
          produit_id: string;
          magasin_id: string;
          user_id: string;
          type: 'entrée' | 'sortie';
          quantite: number;
          date?: string;
          motif: string;
        };
        Update: {
          id?: string;
          produit_id?: string;
          magasin_id?: string;
          user_id?: string;
          type?: 'entrée' | 'sortie';
          quantite?: number;
          date?: string;
          motif?: string;
        };
      };
      presences: {
        Row: {
          id: string;
          user_id: string;
          magasin_id: string;
          date_pointage: string;
          latitude: number;
          longitude: number;
          type: 'arrivee' | 'depart';
        };
        Insert: {
          id?: string;
          user_id: string;
          magasin_id: string;
          date_pointage?: string;
          latitude: number;
          longitude: number;
          type: 'arrivee' | 'depart';
        };
        Update: {
          id?: string;
          user_id?: string;
          magasin_id?: string;
          date_pointage?: string;
          latitude?: number;
          longitude?: number;
          type?: 'arrivee' | 'depart';
        };
      };
    };
  };
}