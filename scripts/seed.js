import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Erreur : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  try {
    console.log('[v0] Démarrage du seed de la base de données...');

    // EXEMPLE : Insérer des données utilisateur
    // Décommentez et modifiez selon votre schéma réel
    
    // const { data, error } = await supabase
    //   .from('users')
    //   .insert([
    //     { email: 'user1@example.com', full_name: 'John Doe' },
    //     { email: 'user2@example.com', full_name: 'Jane Smith' },
    //   ])
    //   .select();

    // if (error) {
    //   console.error('[v0] Erreur lors de l\'insertion des données:', error.message);
    //   process.exit(1);
    // }

    // console.log('[v0] Données insérées avec succès:', data);

    console.log('[v0] ✅ Seed de la base de données terminé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('[v0] Erreur:', error.message);
    process.exit(1);
  }
}

seedDatabase();
