export interface Database {
  public: {
    Tables: {
      family_trees: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          user_id?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          created_at: string;
          tree_id: string;
          first_name: string;
          last_name: string;
          birth_date?: string;
          death_date?: string;
          gender?: string;
          photo_url?: string;
          notes?: string;
          parent_ids?: string[];
          spouse_ids?: string[];
        };
        Insert: {
          id?: string;
          created_at?: string;
          tree_id: string;
          first_name: string;
          last_name: string;
          birth_date?: string;
          death_date?: string;
          gender?: string;
          photo_url?: string;
          notes?: string;
          parent_ids?: string[];
          spouse_ids?: string[];
        };
        Update: {
          id?: string;
          created_at?: string;
          tree_id?: string;
          first_name?: string;
          last_name?: string;
          birth_date?: string;
          death_date?: string;
          gender?: string;
          photo_url?: string;
          notes?: string;
          parent_ids?: string[];
          spouse_ids?: string[];
        };
      };
      user_profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          twitter_url: string | null;
          linkedin_url: string | null;
          facebook_url: string | null;
          website_url: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          twitter_url?: string | null;
          linkedin_url?: string | null;
          facebook_url?: string | null;
          website_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          twitter_url?: string | null;
          linkedin_url?: string | null;
          facebook_url?: string | null;
          website_url?: string | null;
        };
      };
    };
  };
}