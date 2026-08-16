import { isDemoMode } from "@/lib/supabase"
import type { DataService } from "./service"
import { supabaseService } from "./supabaseService"
import { DemoService } from "./demoService"

export const service: DataService = isDemoMode ? new DemoService() : supabaseService

export { isDemoMode } from "@/lib/supabase"
