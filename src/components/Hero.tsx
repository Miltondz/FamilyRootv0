import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TreePine, Users, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type FamilyTree = Database['public']['Tables']['family_trees']['Row'];

// Curated list of professional family tree images
const TREE_IMAGES = [
  'https://images.unsplash.com/photo-1610225169244-b0538420d4e6?auto=format&fit=crop&w=1200&q=80', // Vintage tree illustration
  'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80', // Abstract tree
  'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?auto=format&fit=crop&w=1200&q=80', // Majestic real tree
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80', // Sunlit tree
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80', // Mystical tree
];

export default function Hero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [latestTree, setLatestTree] = useState<FamilyTree | null>(null);
  const [treeImage] = useState(() => 
    TREE_IMAGES[Math.floor(Math.random() * TREE_IMAGES.length)]
  );

  useEffect(() => {
    if (user) {
      const fetchLatestTree = async () => {
        const { data: trees } = await supabase
          .from('family_trees')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (trees) {
          setLatestTree(trees);
        }
      };

      fetchLatestTree();
    }
  }, [user]);

  useEffect(() => {
    if (user && latestTree) {
      navigate(`/tree/${latestTree.id}`);
    }
  }, [user, latestTree, navigate]);

  if (user) return null;

  return (
    <div className="relative bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
            <div className="text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Discover Your</span>
                <span className="block text-emerald-600">Family History</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl md:mt-5 md:text-xl">
                Create, explore, and share your family tree with our intuitive genealogy platform. Connect with your roots and preserve your family's legacy for generations to come.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    to="/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 md:py-4 md:text-lg md:px-10"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src={treeImage}
          alt="Family tree illustration"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://placehold.co/600x400?text=Family+Tree';
          }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-lg">
              <TreePine className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Build Your Tree</h3>
            <p className="mt-2 text-gray-500">
              Create and manage your family tree with our intuitive tools.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-lg">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Connect Family</h3>
            <p className="mt-2 text-gray-500">
              Link family members and discover relationships across generations.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-lg">
              <Share2 className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Share History</h3>
            <p className="mt-2 text-gray-500">
              Share your family tree and collaborate with relatives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}