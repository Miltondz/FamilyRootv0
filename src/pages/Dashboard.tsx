import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TreePine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type FamilyTree = Database['public']['Tables']['family_trees']['Row'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trees, setTrees] = useState<FamilyTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function createInitialTree() {
      try {
        const { data: existingTrees, error: fetchError } = await supabase
          .from('family_trees')
          .select('*')
          .eq('user_id', user.id);

        if (fetchError) throw fetchError;

        if (!existingTrees || existingTrees.length === 0) {
          const { data: newTree, error: insertError } = await supabase
            .from('family_trees')
            .insert([
              {
                name: 'My Family Tree',
                user_id: user.id,
              },
            ])
            .select()
            .single();

          if (insertError) throw insertError;
          setTrees(newTree ? [newTree] : []);
        } else {
          setTrees(existingTrees);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    createInitialTree();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="rounded-md bg-red-50 p-4">
            <h2 className="text-lg font-medium text-red-800">Error loading family trees</h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Your Family Trees</h1>
          <button
            onClick={async () => {
              try {
                const { data: newTree, error: createError } = await supabase
                  .from('family_trees')
                  .insert([
                    {
                      name: `Family Tree ${trees.length + 1}`,
                      user_id: user!.id,
                    },
                  ])
                  .select()
                  .single();

                if (createError) throw createError;
                if (newTree) {
                  setTrees([...trees, newTree]);
                }
              } catch (err) {
                console.error('Error creating tree:', err);
                setError(err instanceof Error ? err.message : 'Error creating new tree');
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Tree
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trees.map((tree) => (
            <div
              key={tree.id}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => navigate(`/tree/${tree.id}`)}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <TreePine className="h-8 w-8 text-emerald-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{tree.name}</h3>
                    <p className="text-sm text-gray-500">
                      Created {new Date(tree.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}