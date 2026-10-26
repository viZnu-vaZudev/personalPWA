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
      accounts: {
        Row: {
          archived_at: string | null
          created_at: string
          currency: string
          id: string
          name: string
          opening_balance: number
          opening_date: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          name: string
          opening_balance?: number
          opening_date: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          name?: string
          opening_balance?: number
          opening_date?: string
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["message_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["message_role"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["message_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_user_id_fkey"
            columns: ["conversation_id", "user_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "ai_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          bucket: string
          created_at: string
          health_record_id: string | null
          id: string
          mime_type: string
          object_path: string
          original_name: string
          project_id: string | null
          size_bytes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket?: string
          created_at?: string
          health_record_id?: string | null
          id?: string
          mime_type: string
          object_path: string
          original_name: string
          project_id?: string | null
          size_bytes: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          bucket?: string
          created_at?: string
          health_record_id?: string | null
          id?: string
          mime_type?: string
          object_path?: string
          original_name?: string
          project_id?: string | null
          size_bytes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_health_record_id_user_id_fkey"
            columns: ["health_record_id", "user_id"]
            isOneToOne: false
            referencedRelation: "health_records"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "attachments_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_progress"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "attachments_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "attachments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          id: string
          period_end: string
          period_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_contacts: {
        Row: {
          business_id: string
          contact_details: string | null
          created_at: string
          id: string
          name: string
          next_follow_up_at: string | null
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          contact_details?: string | null
          created_at?: string
          id?: string
          name: string
          next_follow_up_at?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          business_id?: string
          contact_details?: string | null
          created_at?: string
          id?: string
          name?: string
          next_follow_up_at?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_contacts_business_id_user_id_fkey"
            columns: ["business_id", "user_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "business_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string
          customer_problem: string | null
          id: string
          name: string
          notes: string | null
          stage: Database["public"]["Enums"]["business_stage"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_problem?: string | null
          id?: string
          name: string
          notes?: string | null
          stage?: Database["public"]["Enums"]["business_stage"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          customer_problem?: string | null
          id?: string
          name?: string
          notes?: string | null
          stage?: Database["public"]["Enums"]["business_stage"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_plans: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          notes: string | null
          target_date: string | null
          target_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          notes?: string | null
          target_date?: string | null
          target_role: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          notes?: string | null
          target_date?: string | null
          target_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_plans_goal_id_user_id_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "career_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_skills: {
        Row: {
          career_plan_id: string
          created_at: string
          current_level: number
          id: string
          name: string
          target_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          career_plan_id: string
          created_at?: string
          current_level?: number
          id?: string
          name: string
          target_level: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          career_plan_id?: string
          created_at?: string
          current_level?: number
          id?: string
          name?: string
          target_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_skills_career_plan_id_user_id_fkey"
            columns: ["career_plan_id", "user_id"]
            isOneToOne: false
            referencedRelation: "career_plans"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "career_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          id: string
          muscle_group: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          muscle_group: string
          name: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          muscle_group?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          goal_id: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          goal_id: string
          id?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          goal_id?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_user_id_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "goal_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_projects: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          project_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_projects_goal_id_user_id_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "goal_projects_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_progress"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "goal_projects_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "goal_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: Database["public"]["Enums"]["goal_status"]
          target_date: string | null
          title: string
          type: Database["public"]["Enums"]["goal_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          title: string
          type: Database["public"]["Enums"]["goal_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          title?: string
          type?: Database["public"]["Enums"]["goal_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_sessions: {
        Row: {
          created_at: string
          difficulty_rating: number | null
          energy_rating: number | null
          finished_at: string | null
          id: string
          notes: string | null
          session_date: string
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty_rating?: number | null
          energy_rating?: number | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          session_date: string
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          difficulty_rating?: number | null
          energy_rating?: number | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          session_date?: string
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_appointments: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          provider: string
          reason: string | null
          scheduled_at: string
          specialty: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          provider: string
          reason?: string | null
          scheduled_at: string
          specialty?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          provider?: string
          reason?: string | null
          scheduled_at?: string
          specialty?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          notes: string | null
          record_type: string
          recorded_on: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          record_type: string
          recorded_on: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          record_type?: string
          recorded_on?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_records_appointment_id_user_id_fkey"
            columns: ["appointment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "health_appointments"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "health_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_on: string | null
          company: string
          created_at: string
          id: string
          next_follow_up_at: string | null
          role: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          applied_on?: string | null
          company: string
          created_at?: string
          id?: string
          next_follow_up_at?: string | null
          role: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Update: {
          applied_on?: string | null
          company?: string
          created_at?: string
          id?: string
          next_follow_up_at?: string | null
          role?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_logs: {
        Row: {
          career_skill_id: string
          completed_on: string
          created_at: string
          evidence_url: string | null
          id: string
          minutes_spent: number
          notes: string | null
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          career_skill_id: string
          completed_on: string
          created_at?: string
          evidence_url?: string | null
          id?: string
          minutes_spent: number
          notes?: string | null
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          career_skill_id?: string
          completed_on?: string
          created_at?: string
          evidence_url?: string | null
          id?: string
          minutes_spent?: number
          notes?: string | null
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_logs_career_skill_id_user_id_fkey"
            columns: ["career_skill_id", "user_id"]
            isOneToOne: false
            referencedRelation: "career_skills"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "learning_logs_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "learning_logs_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "today_tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "learning_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_payments: {
        Row: {
          created_at: string
          fee_amount: number
          id: string
          interest_amount: number
          loan_id: string
          principal_amount: number
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fee_amount?: number
          id?: string
          interest_amount?: number
          loan_id: string
          principal_amount: number
          transaction_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          fee_amount?: number
          id?: string
          interest_amount?: number
          loan_id?: string
          principal_amount?: number
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_user_id_fkey"
            columns: ["loan_id", "user_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "loan_payments_transaction_id_user_id_fkey"
            columns: ["transaction_id", "user_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "loan_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          annual_interest_rate: number | null
          archived_at: string | null
          balance_as_of: string
          created_at: string
          due_day: number
          emi_amount: number
          id: string
          name: string
          original_principal: number
          outstanding_principal: number
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_interest_rate?: number | null
          archived_at?: string | null
          balance_as_of: string
          created_at?: string
          due_day: number
          emi_amount: number
          id?: string
          name: string
          original_principal: number
          outstanding_principal: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          annual_interest_rate?: number | null
          archived_at?: string | null
          balance_as_of?: string
          created_at?: string
          due_day?: number
          emi_amount?: number
          id?: string
          name?: string
          original_principal?: number
          outstanding_principal?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          active: boolean
          created_at: string
          end_date: string | null
          id: string
          instructions: string | null
          name: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          end_date?: string | null
          id?: string
          instructions?: string | null
          name: string
          start_date: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          end_date?: string | null
          id?: string
          instructions?: string | null
          name?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          currency: string
          display_name: string
          id: string
          timezone: string
          updated_at: string
          weekly_project_hours: number
        }
        Insert: {
          created_at?: string
          currency?: string
          display_name?: string
          id: string
          timezone?: string
          updated_at?: string
          weekly_project_hours?: number
        }
        Update: {
          created_at?: string
          currency?: string
          display_name?: string
          id?: string
          timezone?: string
          updated_at?: string
          weekly_project_hours?: number
        }
        Relationships: []
      }
      project_hostings: {
        Row: {
          created_at: string
          environment: Database["public"]["Enums"]["hosting_environment"]
          id: string
          notes: string | null
          project_id: string
          provider: string
          service_name: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          environment: Database["public"]["Enums"]["hosting_environment"]
          id?: string
          notes?: string | null
          project_id: string
          provider: string
          service_name: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          environment?: Database["public"]["Enums"]["hosting_environment"]
          id?: string
          notes?: string | null
          project_id?: string
          provider?: string
          service_name?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_hostings_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_progress"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "project_hostings_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "project_hostings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          project_id: string
          sort_order: number
          start_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          project_id: string
          sort_order?: number
          start_date?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          project_id?: string
          sort_order?: number
          start_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_progress"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "project_milestones_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "project_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_repositories: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
          updated_at?: string
          url: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_repositories_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_progress"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "project_repositories_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "project_repositories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_technologies: {
        Row: {
          category: Database["public"]["Enums"]["technology_category"]
          created_at: string
          id: string
          name: string
          project_id: string
          updated_at: string
          user_id: string
          version: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["technology_category"]
          created_at?: string
          id?: string
          name: string
          project_id: string
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["technology_category"]
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_technologies_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_progress"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "project_technologies_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "project_technologies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["project_status"] | null
          note: string
          old_status: Database["public"]["Enums"]["project_status"] | null
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["project_status"] | null
          note: string
          old_status?: Database["public"]["Enums"]["project_status"] | null
          project_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["project_status"] | null
          note?: string
          old_status?: Database["public"]["Enums"]["project_status"] | null
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_progress"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "project_updates_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "project_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          archived_at: string | null
          business_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          target_date: string | null
          updated_at: string
          user_id: string
          weekly_available_hours: number | null
        }
        Insert: {
          archived_at?: string | null
          business_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          target_date?: string | null
          updated_at?: string
          user_id?: string
          weekly_available_hours?: number | null
        }
        Update: {
          archived_at?: string | null
          business_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          target_date?: string | null
          updated_at?: string
          user_id?: string
          weekly_available_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_business_id_user_id_fkey"
            columns: ["business_id", "user_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_payments: {
        Row: {
          account_id: string | null
          active: boolean
          amount: number
          category_id: string | null
          created_at: string
          direction: Database["public"]["Enums"]["transaction_type"]
          frequency: Database["public"]["Enums"]["payment_frequency"]
          id: string
          loan_id: string | null
          name: string
          next_due_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          active?: boolean
          amount: number
          category_id?: string | null
          created_at?: string
          direction: Database["public"]["Enums"]["transaction_type"]
          frequency: Database["public"]["Enums"]["payment_frequency"]
          id?: string
          loan_id?: string | null
          name: string
          next_due_date: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_id?: string | null
          active?: boolean
          amount?: number
          category_id?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["transaction_type"]
          frequency?: Database["public"]["Enums"]["payment_frequency"]
          id?: string
          loan_id?: string | null
          name?: string
          next_due_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_payments_account_id_user_id_fkey"
            columns: ["account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "recurring_payments_account_id_user_id_fkey"
            columns: ["account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "recurring_payments_category_id_user_id_direction_fkey"
            columns: ["category_id", "user_id", "direction"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id", "user_id", "type"]
          },
          {
            foreignKeyName: "recurring_payments_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "recurring_payments_loan_id_user_id_fkey"
            columns: ["loan_id", "user_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "recurring_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          medication_id: string | null
          recurring_payment_id: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["reminder_status"]
          task_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          medication_id?: string | null
          recurring_payment_id?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["reminder_status"]
          task_id?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          medication_id?: string | null
          recurring_payment_id?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["reminder_status"]
          task_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_appointment_id_user_id_fkey"
            columns: ["appointment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "health_appointments"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "reminders_medication_id_user_id_fkey"
            columns: ["medication_id", "user_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "reminders_recurring_payment_id_user_id_fkey"
            columns: ["recurring_payment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "recurring_payments"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "reminders_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "reminders_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "today_tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_contributions: {
        Row: {
          amount: number
          contributed_on: string
          created_at: string
          id: string
          savings_goal_id: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          contributed_on: string
          created_at?: string
          id?: string
          savings_goal_id: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          contributed_on?: string
          created_at?: string
          id?: string
          savings_goal_id?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_contributions_savings_goal_id_user_id_fkey"
            columns: ["savings_goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "savings_contributions_transaction_id_user_id_fkey"
            columns: ["transaction_id", "user_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "savings_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string
          id: string
          name: string
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          target_amount: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string
          depends_on_task_id: string
          id: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          depends_on_task_id: string
          id?: string
          task_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          depends_on_task_id?: string
          id?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_user_id_fkey"
            columns: ["depends_on_task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_user_id_fkey"
            columns: ["depends_on_task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "today_tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "today_tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "task_dependencies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_at: string | null
          estimated_minutes: number | null
          goal_id: string | null
          id: string
          milestone_id: string | null
          priority: number
          project_id: string | null
          remaining_minutes: number | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          estimated_minutes?: number | null
          goal_id?: string | null
          id?: string
          milestone_id?: string | null
          priority?: number
          project_id?: string | null
          remaining_minutes?: number | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          estimated_minutes?: number | null
          goal_id?: string | null
          id?: string
          milestone_id?: string | null
          priority?: number
          project_id?: string | null
          remaining_minutes?: number | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_user_id_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_milestone_id_project_id_user_id_fkey"
            columns: ["milestone_id", "project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id", "project_id", "user_id"]
          },
          {
            foreignKeyName: "tasks_milestone_id_user_id_fkey"
            columns: ["milestone_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_progress"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          business_id: string | null
          category_id: string | null
          created_at: string
          id: string
          note: string | null
          occurred_on: string
          project_id: string | null
          to_account_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          business_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          occurred_on: string
          project_id?: string | null
          to_account_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_id?: string
          amount?: number
          business_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          occurred_on?: string
          project_id?: string | null
          to_account_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_user_id_fkey"
            columns: ["account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_account_id_user_id_fkey"
            columns: ["account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_business_id_user_id_fkey"
            columns: ["business_id", "user_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_category_id_user_id_type_fkey"
            columns: ["category_id", "user_id", "type"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id", "user_id", "type"]
          },
          {
            foreignKeyName: "transactions_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_progress"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_user_id_fkey"
            columns: ["to_account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_user_id_fkey"
            columns: ["to_account_id", "user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reviews: {
        Row: {
          created_at: string
          id: string
          next_week_focus: string | null
          reflection: string | null
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          next_week_focus?: string | null
          reflection?: string | null
          updated_at?: string
          user_id?: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          next_week_focus?: string | null
          reflection?: string | null
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          created_at: string
          exercise_id: string
          gym_session_id: string
          id: string
          repetitions: number
          set_number: number
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          gym_session_id: string
          id?: string
          repetitions: number
          set_number: number
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          gym_session_id?: string
          id?: string
          repetitions?: number
          set_number?: number
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_exercise_id_user_id_fkey"
            columns: ["exercise_id", "user_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "workout_sets_gym_session_id_user_id_fkey"
            columns: ["gym_session_id", "user_id"]
            isOneToOne: false
            referencedRelation: "gym_sessions"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "workout_sets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      account_balances: {
        Row: {
          balance: number | null
          currency: string | null
          id: string | null
          name: string | null
          opening_date: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_consumption: {
        Row: {
          amount: number | null
          category_id: string | null
          id: string | null
          period_end: string | null
          period_start: string | null
          remaining: number | null
          spent: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_finances: {
        Row: {
          business_id: string | null
          expenses: number | null
          month: string | null
          revenue: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_business_id_user_id_fkey"
            columns: ["business_id", "user_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_finances: {
        Row: {
          currency: string | null
          expenses: number | null
          income: number | null
          month: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_progress: {
        Row: {
          blocked_tasks: number | null
          completed_tasks: number | null
          has_unresolved_dependencies: boolean | null
          id: string | null
          known_remaining_minutes: number | null
          total_tasks: number | null
          unknown_effort_tasks: number | null
          user_id: string | null
          weekly_available_hours: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      today_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_at: string | null
          estimated_minutes: number | null
          goal_id: string | null
          id: string | null
          milestone_id: string | null
          priority: number | null
          project_id: string | null
          remaining_minutes: number | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_user_id_fkey"
            columns: ["goal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_milestone_id_project_id_user_id_fkey"
            columns: ["milestone_id", "project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id", "project_id", "user_id"]
          },
          {
            foreignKeyName: "tasks_milestone_id_user_id_fkey"
            columns: ["milestone_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "project_progress"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      upcoming_reminders: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          id: string | null
          medication_id: string | null
          recurring_payment_id: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["reminder_status"] | null
          task_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string | null
          medication_id?: string | null
          recurring_payment_id?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status"] | null
          task_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string | null
          medication_id?: string | null
          recurring_payment_id?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status"] | null
          task_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_appointment_id_user_id_fkey"
            columns: ["appointment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "health_appointments"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "reminders_medication_id_user_id_fkey"
            columns: ["medication_id", "user_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "reminders_recurring_payment_id_user_id_fkey"
            columns: ["recurring_payment_id", "user_id"]
            isOneToOne: false
            referencedRelation: "recurring_payments"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "reminders_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "reminders_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "today_tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_gym_attendance: {
        Row: {
          days_attended: number | null
          sessions: number | null
          user_id: string | null
          week_start: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_review_summaries: {
        Row: {
          completed_tasks: number | null
          created_at: string | null
          gym_sessions: number | null
          id: string | null
          next_week_focus: string | null
          reflection: string | null
          updated_at: string | null
          user_id: string | null
          week_start: string | null
        }
        Insert: {
          completed_tasks?: never
          created_at?: string | null
          gym_sessions?: never
          id?: string | null
          next_week_focus?: string | null
          reflection?: string | null
          updated_at?: string | null
          user_id?: string | null
          week_start?: string | null
        }
        Update: {
          completed_tasks?: never
          created_at?: string | null
          gym_sessions?: never
          id?: string | null
          next_week_focus?: string | null
          reflection?: string | null
          updated_at?: string | null
          user_id?: string | null
          week_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_type: "cash" | "bank" | "wallet" | "credit"
      application_status:
        | "planned"
        | "applied"
        | "interviewing"
        | "offered"
        | "rejected"
        | "withdrawn"
      appointment_status: "scheduled" | "completed" | "cancelled"
      business_stage:
        | "idea"
        | "validate"
        | "build"
        | "find_customers"
        | "earn"
        | "improve"
      contact_status: "new" | "contacted" | "interested" | "customer" | "closed"
      goal_status:
        | "not_started"
        | "active"
        | "completed"
        | "paused"
        | "abandoned"
      goal_type: "career" | "business" | "personal"
      hosting_environment: "development" | "staging" | "production"
      message_role: "user" | "assistant" | "system"
      payment_frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
      project_status: "drafted" | "not_started" | "active" | "completed"
      reminder_status: "pending" | "sent" | "dismissed"
      task_status: "todo" | "in_progress" | "blocked" | "done" | "cancelled"
      technology_category:
        | "frontend"
        | "backend"
        | "database"
        | "infrastructure"
        | "tooling"
        | "other"
      transaction_type: "income" | "expense" | "transfer"
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
    Enums: {
      account_type: ["cash", "bank", "wallet", "credit"],
      application_status: [
        "planned",
        "applied",
        "interviewing",
        "offered",
        "rejected",
        "withdrawn",
      ],
      appointment_status: ["scheduled", "completed", "cancelled"],
      business_stage: [
        "idea",
        "validate",
        "build",
        "find_customers",
        "earn",
        "improve",
      ],
      contact_status: ["new", "contacted", "interested", "customer", "closed"],
      goal_status: [
        "not_started",
        "active",
        "completed",
        "paused",
        "abandoned",
      ],
      goal_type: ["career", "business", "personal"],
      hosting_environment: ["development", "staging", "production"],
      message_role: ["user", "assistant", "system"],
      payment_frequency: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      project_status: ["drafted", "not_started", "active", "completed"],
      reminder_status: ["pending", "sent", "dismissed"],
      task_status: ["todo", "in_progress", "blocked", "done", "cancelled"],
      technology_category: [
        "frontend",
        "backend",
        "database",
        "infrastructure",
        "tooling",
        "other",
      ],
      transaction_type: ["income", "expense", "transfer"],
    },
  },
} as const
