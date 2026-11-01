export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      abuse_reports: {
        Row: {
          created_at: string
          id: number
          reason: string
          reporter_id: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: never
          reason: string
          reporter_id?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: never
          reason?: string
          reporter_id?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: number
          meta: Json
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: never
          meta?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: never
          meta?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      bank_reports: {
        Row: {
          bank_id: string
          created_at: string
          id: number
          reporter_id: string
          request_id: string
          result: string
        }
        Insert: {
          bank_id: string
          created_at?: string
          id?: never
          reporter_id: string
          request_id: string
          result: string
        }
        Update: {
          bank_id?: string
          created_at?: string
          id?: never
          reporter_id?: string
          request_id?: string
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_reports_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "blood_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reports_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_stock: {
        Row: {
          bank_id: string
          blood_group: Database["public"]["Enums"]["blood_group"]
          component: Database["public"]["Enums"]["blood_component"]
          source: string
          units: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bank_id: string
          blood_group: Database["public"]["Enums"]["blood_group"]
          component: Database["public"]["Enums"]["blood_component"]
          source: string
          units: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bank_id?: string
          blood_group?: Database["public"]["Enums"]["blood_group"]
          component?: Database["public"]["Enums"]["blood_component"]
          source?: string
          units?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_stock_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "blood_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_banks: {
        Row: {
          active: boolean
          address: string | null
          bank_type: string | null
          city: string | null
          created_at: string
          district: string | null
          eraktkosh_id: string | null
          geo: unknown
          hours: string | null
          id: string
          is_24x7: boolean
          licence_no: string | null
          name: string
          phones: string[]
          state: string
          trust_score: number
        }
        Insert: {
          active?: boolean
          address?: string | null
          bank_type?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          eraktkosh_id?: string | null
          geo: unknown
          hours?: string | null
          id?: string
          is_24x7?: boolean
          licence_no?: string | null
          name: string
          phones?: string[]
          state?: string
          trust_score?: number
        }
        Update: {
          active?: boolean
          address?: string | null
          bank_type?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          eraktkosh_id?: string | null
          geo?: unknown
          hours?: string | null
          id?: string
          is_24x7?: boolean
          licence_no?: string | null
          name?: string
          phones?: string[]
          state?: string
          trust_score?: number
        }
        Relationships: []
      }
      consents: {
        Row: {
          agreed_at: string
          channel: string
          id: number
          type: string
          user_id: string
          version: string
          withdrawn_at: string | null
        }
        Insert: {
          agreed_at?: string
          channel?: string
          id?: never
          type: string
          user_id: string
          version: string
          withdrawn_at?: string | null
        }
        Update: {
          agreed_at?: string
          channel?: string
          id?: never
          type?: string
          user_id?: string
          version?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          bank_id: string | null
          code: string
          confirmed_at: string | null
          confirmed_by: string | null
          contact_id: string
          created_at: string
          donor_id: string
          id: string
          proof_path: string | null
          request_id: string
          status: string
        }
        Insert: {
          bank_id?: string | null
          code: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          contact_id: string
          created_at?: string
          donor_id: string
          id?: string
          proof_path?: string | null
          request_id: string
          status?: string
        }
        Update: {
          bank_id?: string | null
          code?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          contact_id?: string
          created_at?: string
          donor_id?: string
          id?: string
          proof_path?: string | null
          request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "blood_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "request_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_health: {
        Row: {
          answered_at: string
          answers_enc: string
          blocking_reason: string | null
          donor_id: string
          valid_until: string
        }
        Insert: {
          answered_at?: string
          answers_enc: string
          blocking_reason?: string | null
          donor_id: string
          valid_until?: string
        }
        Update: {
          answered_at?: string
          answers_enc?: string
          blocking_reason?: string | null
          donor_id?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "donor_health_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: true
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_location: {
        Row: {
          area: string | null
          city: string | null
          donor_id: string
          home_geo: unknown
          max_travel_km: number
          pincode: string | null
          transport: string | null
          updated_at: string
        }
        Insert: {
          area?: string | null
          city?: string | null
          donor_id: string
          home_geo: unknown
          max_travel_km?: number
          pincode?: string | null
          transport?: string | null
          updated_at?: string
        }
        Update: {
          area?: string | null
          city?: string | null
          donor_id?: string
          home_geo?: unknown
          max_travel_km?: number
          pincode?: string | null
          transport?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donor_location_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: true
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_prefs: {
        Row: {
          allow_critical_in_quiet: boolean
          donor_id: string
          max_requests_per_month: number
          opted_out: boolean
          opted_out_at: string | null
          quiet_end: string | null
          quiet_start: string | null
        }
        Insert: {
          allow_critical_in_quiet?: boolean
          donor_id: string
          max_requests_per_month?: number
          opted_out?: boolean
          opted_out_at?: string | null
          quiet_end?: string | null
          quiet_start?: string | null
        }
        Update: {
          allow_critical_in_quiet?: boolean
          donor_id?: string
          max_requests_per_month?: number
          opted_out?: boolean
          opted_out_at?: string | null
          quiet_end?: string | null
          quiet_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donor_prefs_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: true
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_private: {
        Row: {
          created_at: string
          donor_id: string
          email: string | null
          email_verified: boolean
          emergency_name_enc: string | null
          emergency_phone_enc: string | null
          phone_e164: string
          whatsapp_e164: string | null
        }
        Insert: {
          created_at?: string
          donor_id: string
          email?: string | null
          email_verified?: boolean
          emergency_name_enc?: string | null
          emergency_phone_enc?: string | null
          phone_e164: string
          whatsapp_e164?: string | null
        }
        Update: {
          created_at?: string
          donor_id?: string
          email?: string | null
          email_verified?: boolean
          emergency_name_enc?: string | null
          emergency_phone_enc?: string | null
          phone_e164?: string
          whatsapp_e164?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donor_private_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: true
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          also_platelets: boolean
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          created_at: string
          dob: string
          donations_count: number
          first_name: string | null
          full_name: string
          gender: string
          group_confidence: string
          health_checked_at: string | null
          health_ok: boolean
          id: string
          languages: string[]
          last_donation_date: string | null
          next_eligible_date: string | null
          paused_until: string | null
          reliability_score: number
          state: Database["public"]["Enums"]["donor_state"]
          trust_level: number
          updated_at: string
          weight_kg: number
          welcome_verified_at: string | null
        }
        Insert: {
          also_platelets?: boolean
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          created_at?: string
          dob: string
          donations_count?: number
          first_name?: string | null
          full_name: string
          gender: string
          group_confidence?: string
          health_checked_at?: string | null
          health_ok?: boolean
          id: string
          languages?: string[]
          last_donation_date?: string | null
          next_eligible_date?: string | null
          paused_until?: string | null
          reliability_score?: number
          state?: Database["public"]["Enums"]["donor_state"]
          trust_level?: number
          updated_at?: string
          weight_kg: number
          welcome_verified_at?: string | null
        }
        Update: {
          also_platelets?: boolean
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          created_at?: string
          dob?: string
          donations_count?: number
          first_name?: string | null
          full_name?: string
          gender?: string
          group_confidence?: string
          health_checked_at?: string | null
          health_ok?: boolean
          id?: string
          languages?: string[]
          last_donation_date?: string | null
          next_eligible_date?: string | null
          paused_until?: string | null
          reliability_score?: number
          state?: Database["public"]["Enums"]["donor_state"]
          trust_level?: number
          updated_at?: string
          weight_kg?: number
          welcome_verified_at?: string | null
        }
        Relationships: []
      }
      message_events: {
        Row: {
          channel: string
          contact_id: string | null
          created_at: string
          direction: string
          id: number
          kind: string
          payload: Json
          provider_id: string | null
        }
        Insert: {
          channel: string
          contact_id?: string | null
          created_at?: string
          direction: string
          id?: never
          kind: string
          payload?: Json
          provider_id?: string | null
        }
        Update: {
          channel?: string
          contact_id?: string | null
          created_at?: string
          direction?: string
          id?: never
          kind?: string
          payload?: Json
          provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "request_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          hits: number
          key: string
          window_start: string
        }
        Insert: {
          hits?: number
          key: string
          window_start: string
        }
        Update: {
          hits?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      request_contacts: {
        Row: {
          answers: Json
          call_sid: string | null
          call_status: string
          created_at: string
          decided_at: string | null
          decided_via: string | null
          distance_km: number
          donation_code: string | null
          donor_id: string
          eta_minutes: number | null
          id: string
          request_id: string
          ring_km: number
          share_phone_consent: boolean
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
          wa_message_id: string | null
          wa_status: string
          wave_no: number
        }
        Insert: {
          answers?: Json
          call_sid?: string | null
          call_status?: string
          created_at?: string
          decided_at?: string | null
          decided_via?: string | null
          distance_km: number
          donation_code?: string | null
          donor_id: string
          eta_minutes?: number | null
          id?: string
          request_id: string
          ring_km: number
          share_phone_consent?: boolean
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          wa_message_id?: string | null
          wa_status?: string
          wave_no: number
        }
        Update: {
          answers?: Json
          call_sid?: string | null
          call_status?: string
          created_at?: string
          decided_at?: string | null
          decided_via?: string | null
          distance_km?: number
          donation_code?: string | null
          donor_id?: string
          eta_minutes?: number | null
          id?: string
          request_id?: string
          ring_km?: number
          share_phone_consent?: boolean
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          wa_message_id?: string | null
          wa_status?: string
          wave_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "request_contacts_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_contacts_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_donor_cards: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          contact_id: string
          created_at: string
          distance_band: string
          donations_count: number
          eta_minutes: number | null
          first_name: string
          is_standby: boolean
          request_id: string
          status: Database["public"]["Enums"]["contact_status"]
          trust_level: number
          updated_at: string
        }
        Insert: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          contact_id: string
          created_at?: string
          distance_band: string
          donations_count: number
          eta_minutes?: number | null
          first_name: string
          is_standby?: boolean
          request_id: string
          status: Database["public"]["Enums"]["contact_status"]
          trust_level: number
          updated_at?: string
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group"]
          contact_id?: string
          created_at?: string
          distance_band?: string
          donations_count?: number
          eta_minutes?: number | null
          first_name?: string
          is_standby?: boolean
          request_id?: string
          status?: Database["public"]["Enums"]["contact_status"]
          trust_level?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_donor_cards_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "request_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_donor_cards_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          accepted_count: number
          allow_compatible: boolean
          approved_up_to_km: number
          blood_group: Database["public"]["Enums"]["blood_group"]
          close_reason: string | null
          closed_at: string | null
          component: Database["public"]["Enums"]["blood_component"]
          contacts_count: number
          created_at: string
          current_ring_km: number
          exhausted_at: string | null
          hospital_area: string | null
          hospital_geo: unknown
          hospital_name: string
          hospital_phone: string | null
          id: string
          needed_by: string
          next_tick_at: string
          note: string | null
          patient_age: number | null
          patient_first_name: string
          pending_gate_km: number | null
          reason: string | null
          relation: string
          requester_id: string
          requester_name: string
          slip_path: string | null
          slip_verified: boolean
          status: Database["public"]["Enums"]["request_status"]
          units_needed: number
          urgency: Database["public"]["Enums"]["urgency_level"]
          ward_info: string | null
          wave_expires_at: string | null
          wave_no: number
        }
        Insert: {
          accepted_count?: number
          allow_compatible?: boolean
          approved_up_to_km?: number
          blood_group: Database["public"]["Enums"]["blood_group"]
          close_reason?: string | null
          closed_at?: string | null
          component?: Database["public"]["Enums"]["blood_component"]
          contacts_count?: number
          created_at?: string
          current_ring_km?: number
          exhausted_at?: string | null
          hospital_area?: string | null
          hospital_geo: unknown
          hospital_name: string
          hospital_phone?: string | null
          id?: string
          needed_by: string
          next_tick_at?: string
          note?: string | null
          patient_age?: number | null
          patient_first_name: string
          pending_gate_km?: number | null
          reason?: string | null
          relation: string
          requester_id: string
          requester_name: string
          slip_path?: string | null
          slip_verified?: boolean
          status?: Database["public"]["Enums"]["request_status"]
          units_needed: number
          urgency: Database["public"]["Enums"]["urgency_level"]
          ward_info?: string | null
          wave_expires_at?: string | null
          wave_no?: number
        }
        Update: {
          accepted_count?: number
          allow_compatible?: boolean
          approved_up_to_km?: number
          blood_group?: Database["public"]["Enums"]["blood_group"]
          close_reason?: string | null
          closed_at?: string | null
          component?: Database["public"]["Enums"]["blood_component"]
          contacts_count?: number
          created_at?: string
          current_ring_km?: number
          exhausted_at?: string | null
          hospital_area?: string | null
          hospital_geo?: unknown
          hospital_name?: string
          hospital_phone?: string | null
          id?: string
          needed_by?: string
          next_tick_at?: string
          note?: string | null
          patient_age?: number | null
          patient_first_name?: string
          pending_gate_km?: number | null
          reason?: string | null
          relation?: string
          requester_id?: string
          requester_name?: string
          slip_path?: string | null
          slip_verified?: boolean
          status?: Database["public"]["Enums"]["request_status"]
          units_needed?: number
          urgency?: Database["public"]["Enums"]["urgency_level"]
          ward_info?: string | null
          wave_expires_at?: string | null
          wave_no?: number
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_id: string
          provider: string
          received_at: string
        }
        Insert: {
          event_id: string
          provider: string
          received_at?: string
        }
        Update: {
          event_id?: string
          provider?: string
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      call_tick: { Args: never; Returns: undefined }
      cancel_request: {
        Args: { p_reason?: string; p_request_id: string }
        Returns: undefined
      }
      claim_requests_for_tick: {
        Args: { p_lease_seconds?: number; p_limit?: number }
        Returns: {
          accepted_count: number
          allow_compatible: boolean
          approved_up_to_km: number
          blood_group: Database["public"]["Enums"]["blood_group"]
          close_reason: string | null
          closed_at: string | null
          component: Database["public"]["Enums"]["blood_component"]
          contacts_count: number
          created_at: string
          current_ring_km: number
          exhausted_at: string | null
          hospital_area: string | null
          hospital_geo: unknown
          hospital_name: string
          hospital_phone: string | null
          id: string
          needed_by: string
          next_tick_at: string
          note: string | null
          patient_age: number | null
          patient_first_name: string
          pending_gate_km: number | null
          reason: string | null
          relation: string
          requester_id: string
          requester_name: string
          slip_path: string | null
          slip_verified: boolean
          status: Database["public"]["Enums"]["request_status"]
          units_needed: number
          urgency: Database["public"]["Enums"]["urgency_level"]
          ward_info: string | null
          wave_expires_at: string | null
          wave_no: number
        }[]
        SetofOptions: {
          from: "*"
          to: "requests"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      compute_next_eligible: {
        Args: { p_gender: string; p_last: string }
        Returns: string
      }
      confirm_donation: {
        Args: { p_by?: string; p_code: string; p_contact_id: string }
        Returns: boolean
      }
      create_request: {
        Args: {
          p_allow_compatible: boolean
          p_blood_group: Database["public"]["Enums"]["blood_group"]
          p_component: Database["public"]["Enums"]["blood_component"]
          p_hospital_area: string
          p_hospital_name: string
          p_hospital_phone: string
          p_lat: number
          p_lng: number
          p_needed_by: string
          p_note: string
          p_patient_age: number
          p_patient_first_name: string
          p_reason: string
          p_relation: string
          p_requester_name: string
          p_slip_path: string
          p_units: number
          p_urgency: Database["public"]["Enums"]["urgency_level"]
          p_ward_info: string
        }
        Returns: string
      }
      distance_band: { Args: { p_km: number }; Returns: string }
      expire_old_requests: { Args: never; Returns: undefined }
      finalize_contact: {
        Args: {
          p_answers?: Json
          p_contact_id: string
          p_eta?: number
          p_share_phone?: boolean
          p_status: Database["public"]["Enums"]["contact_status"]
          p_via: string
        }
        Returns: {
          answers: Json
          call_sid: string | null
          call_status: string
          created_at: string
          decided_at: string | null
          decided_via: string | null
          distance_km: number
          donation_code: string | null
          donor_id: string
          eta_minutes: number | null
          id: string
          request_id: string
          ring_km: number
          share_phone_consent: boolean
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
          wa_message_id: string | null
          wa_status: string
          wave_no: number
        }
        SetofOptions: {
          from: "*"
          to: "request_contacts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      find_candidate_donors: {
        Args: { p_limit: number; p_request_id: string; p_ring_km: number }
        Returns: {
          distance_km: number
          donor_id: string
        }[]
      }
      get_donor_request_view: { Args: { p_contact_id: string }; Returns: Json }
      in_quiet_hours: {
        Args: { p_end: string; p_now: string; p_start: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_compatible: {
        Args: {
          p_component: Database["public"]["Enums"]["blood_component"]
          p_donor: Database["public"]["Enums"]["blood_group"]
          p_patient: Database["public"]["Enums"]["blood_group"]
        }
        Returns: boolean
      }
      refresh_request_progress: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      request_decision: {
        Args: { p_continue: boolean; p_request_id: string }
        Returns: Database["public"]["Enums"]["request_status"]
      }
      reveal_donor_phone: { Args: { p_contact_id: string }; Returns: string }
      rl_hit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: boolean
      }
    }
    Enums: {
      blood_component: "whole_blood" | "red_cells" | "platelets" | "plasma"
      blood_group: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-"
      contact_status:
        | "queued"
        | "contacting"
        | "accepted"
        | "declined"
        | "not_eligible"
        | "no_answer"
        | "needs_human"
        | "cancelled"
        | "on_the_way"
        | "arrived"
        | "donated"
        | "no_show"
      donor_state: "draft" | "pending" | "active" | "suspended" | "deleted"
      request_status:
        | "searching"
        | "waiting_requester"
        | "enough_donors"
        | "completed"
        | "stopped"
        | "cancelled"
        | "expired"
        | "frozen"
      urgency_level: "now" | "six_hours" | "twenty_four_hours" | "planned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Database

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
    Enums: {
      blood_component: ["whole_blood", "red_cells", "platelets", "plasma"],
      blood_group: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      contact_status: [
        "queued",
        "contacting",
        "accepted",
        "declined",
        "not_eligible",
        "no_answer",
        "needs_human",
        "cancelled",
        "on_the_way",
        "arrived",
        "donated",
        "no_show",
      ],
      donor_state: ["draft", "pending", "active", "suspended", "deleted"],
      request_status: [
        "searching",
        "waiting_requester",
        "enough_donors",
        "completed",
        "stopped",
        "cancelled",
        "expired",
        "frozen",
      ],
      urgency_level: ["now", "six_hours", "twenty_four_hours", "planned"],
    },
  },
} as const
