export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          at: string
          diff: Json
          id: number
          row_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          at?: string
          diff: Json
          id?: never
          row_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          at?: string
          diff?: Json
          id?: never
          row_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          attribute_schema: Json
          color_token: string | null
          created_at: string
          fsq_category_ids: string[]
          icon: string | null
          id: string
          is_active: boolean
          name: Json
          osm_mappings: Json
          parent_id: string | null
          slug: string
          sort: number
          updated_at: string
        }
        Insert: {
          attribute_schema?: Json
          color_token?: string | null
          created_at?: string
          fsq_category_ids?: string[]
          icon?: string | null
          id?: string
          is_active?: boolean
          name: Json
          osm_mappings?: Json
          parent_id?: string | null
          slug: string
          sort?: number
          updated_at?: string
        }
        Update: {
          attribute_schema?: Json
          color_token?: string | null
          created_at?: string
          fsq_category_ids?: string[]
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: Json
          osm_mappings?: Json
          parent_id?: string | null
          slug?: string
          sort?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          bbox: unknown
          center: unknown
          country_code: string
          created_at: string
          default_locale: string
          holiday_region: string
          id: string
          is_live: boolean
          locales: string[]
          name: Json
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          bbox: unknown
          center: unknown
          country_code: string
          created_at?: string
          default_locale: string
          holiday_region: string
          id?: string
          is_live?: boolean
          locales: string[]
          name: Json
          slug: string
          timezone: string
          updated_at?: string
        }
        Update: {
          bbox?: unknown
          center?: unknown
          country_code?: string
          created_at?: string
          default_locale?: string
          holiday_region?: string
          id?: string
          is_live?: boolean
          locales?: string[]
          name?: Json
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          collection_id: string
          created_at: string
          item_id: string
          item_type: string
          note: Json | null
          sort: number
          updated_at: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          item_id: string
          item_type: string
          note?: Json | null
          sort?: number
          updated_at?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          item_id?: string
          item_type?: string
          note?: Json | null
          sort?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          city_id: string
          cover_media_id: string | null
          created_at: string
          id: string
          kind: string
          slug: string
          sort: number
          sponsor_name: string | null
          status: string
          subtitle: Json | null
          title: Json
          updated_at: string
          visible_from: string | null
          visible_to: string | null
        }
        Insert: {
          city_id: string
          cover_media_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          slug: string
          sort?: number
          sponsor_name?: string | null
          status?: string
          subtitle?: Json | null
          title: Json
          updated_at?: string
          visible_from?: string | null
          visible_to?: string | null
        }
        Update: {
          city_id?: string
          cover_media_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          slug?: string
          sort?: number
          sponsor_name?: string | null
          status?: string
          subtitle?: Json | null
          title?: Json
          updated_at?: string
          visible_from?: string | null
          visible_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      ingest_runs: {
        Row: {
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          source: string
          started_at: string
          stats: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          source: string
          started_at?: string
          stats?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          source?: string
          started_at?: string
          stats?: Json
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt: Json | null
          blurhash: string | null
          created_at: string
          credit: string
          deleted_at: string | null
          height: number | null
          id: string
          license: string
          moderation_status: string
          owner_id: string
          owner_type: string
          renditions: Json
          sort: number
          source_url: string | null
          storage_path: string
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt?: Json | null
          blurhash?: string | null
          created_at?: string
          credit: string
          deleted_at?: string | null
          height?: number | null
          id?: string
          license: string
          moderation_status?: string
          owner_id: string
          owner_type: string
          renditions?: Json
          sort?: number
          source_url?: string | null
          storage_path: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt?: Json | null
          blurhash?: string | null
          created_at?: string
          credit?: string
          deleted_at?: string | null
          height?: number | null
          id?: string
          license?: string
          moderation_status?: string
          owner_id?: string
          owner_type?: string
          renditions?: Json
          sort?: number
          source_url?: string | null
          storage_path?: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      neighbourhoods: {
        Row: {
          boundary: unknown
          city_id: string
          created_at: string
          id: string
          name: Json
          slug: string
          updated_at: string
        }
        Insert: {
          boundary: unknown
          city_id: string
          created_at?: string
          id?: string
          name: Json
          slug: string
          updated_at?: string
        }
        Update: {
          boundary?: unknown
          city_id?: string
          created_at?: string
          id?: string
          name?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighbourhoods_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_exceptions: {
        Row: {
          closed: boolean
          closes: string | null
          created_at: string
          id: string
          note: Json | null
          on_date: string
          opens: string | null
          place_id: string
          updated_at: string
        }
        Insert: {
          closed: boolean
          closes?: string | null
          created_at?: string
          id?: string
          note?: Json | null
          on_date: string
          opens?: string | null
          place_id: string
          updated_at?: string
        }
        Update: {
          closed?: boolean
          closes?: string | null
          created_at?: string
          id?: string
          note?: Json | null
          on_date?: string
          opens?: string | null
          place_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opening_exceptions_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_categories: {
        Row: {
          category_id: string
          created_at: string
          is_primary: boolean
          place_id: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          is_primary?: boolean
          place_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          is_primary?: boolean
          place_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_categories_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_editorial: {
        Row: {
          created_at: string
          description: Json | null
          editor_pick: boolean
          good_for: string[]
          place_id: string
          price_level: number | null
          status: string
          summary: Json | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          description?: Json | null
          editor_pick?: boolean
          good_for?: string[]
          place_id: string
          price_level?: number | null
          status?: string
          summary?: Json | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          description?: Json | null
          editor_pick?: boolean
          good_for?: string[]
          place_id?: string
          price_level?: number | null
          status?: string
          summary?: Json | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_editorial_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: true
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_open_windows: {
        Row: {
          created_at: string
          during: unknown
          place_id: string
          source: string
        }
        Insert: {
          created_at?: string
          during: unknown
          place_id: string
          source: string
        }
        Update: {
          created_at?: string
          during?: unknown
          place_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_open_windows_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_sources: {
        Row: {
          attribution: string
          content_hash: string
          created_at: string
          external_id: string
          fetched_at: string
          id: string
          license: string
          match_confidence: number | null
          match_status: string
          place_id: string | null
          provider: string
          raw: Json
          updated_at: string
        }
        Insert: {
          attribution: string
          content_hash: string
          created_at?: string
          external_id: string
          fetched_at: string
          id?: string
          license: string
          match_confidence?: number | null
          match_status?: string
          place_id?: string | null
          provider: string
          raw: Json
          updated_at?: string
        }
        Update: {
          attribution?: string
          content_hash?: string
          created_at?: string
          external_id?: string
          fetched_at?: string
          id?: string
          license?: string
          match_confidence?: number | null
          match_status?: string
          place_id?: string | null
          provider?: string
          raw?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_sources_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_tags: {
        Row: {
          created_at: string
          place_id: string
          source: string
          tag_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          place_id: string
          source?: string
          tag_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          place_id?: string
          source?: string
          tag_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_tags_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          attributes: Json
          city_id: string
          created_at: string
          deleted_at: string | null
          email: string | null
          field_sources: Json
          hours_checked_at: string | null
          house_number: string | null
          id: string
          last_verified_at: string | null
          locality: string | null
          location: unknown
          name: string
          name_i18n: Json | null
          neighbourhood_id: string | null
          osm_opening_hours: string | null
          phone: string | null
          postcode: string | null
          quality_score: number | null
          slug: string
          status: string
          street: string | null
          tier: string
          updated_at: string
          website: string | null
          wheelchair: string | null
        }
        Insert: {
          attributes?: Json
          city_id: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          field_sources?: Json
          hours_checked_at?: string | null
          house_number?: string | null
          id?: string
          last_verified_at?: string | null
          locality?: string | null
          location: unknown
          name: string
          name_i18n?: Json | null
          neighbourhood_id?: string | null
          osm_opening_hours?: string | null
          phone?: string | null
          postcode?: string | null
          quality_score?: number | null
          slug: string
          status?: string
          street?: string | null
          tier?: string
          updated_at?: string
          website?: string | null
          wheelchair?: string | null
        }
        Update: {
          attributes?: Json
          city_id?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          field_sources?: Json
          hours_checked_at?: string | null
          house_number?: string | null
          id?: string
          last_verified_at?: string | null
          locality?: string | null
          location?: unknown
          name?: string
          name_i18n?: Json | null
          neighbourhood_id?: string | null
          osm_opening_hours?: string | null
          phone?: string | null
          postcode?: string | null
          quality_score?: number | null
          slug?: string
          status?: string
          street?: string | null
          tier?: string
          updated_at?: string
          website?: string | null
          wheelchair?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_neighbourhood_id_fkey"
            columns: ["neighbourhood_id"]
            isOneToOne: false
            referencedRelation: "neighbourhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: Json
          slug: string
          sort: number
          tag_group: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: Json
          slug: string
          sort?: number
          tag_group: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: Json
          slug?: string
          sort?: number
          tag_group?: string
          updated_at?: string
        }
        Relationships: []
      }
      transit_stops: {
        Row: {
          city_id: string
          created_at: string
          id: string
          location: unknown
          modes: string[]
          name: string
          updated_at: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id: string
          location: unknown
          modes?: string[]
          name: string
          updated_at?: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          location?: unknown
          modes?: string[]
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transit_stops_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
