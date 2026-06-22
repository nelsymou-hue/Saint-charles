import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Vérifier l'authentification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await serviceSupabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    // 2. Vérifier que le compte a peut_gerer_acces = true
    const { data: profile } = await serviceSupabase
      .from("profiles")
      .select("peut_gerer_acces, actif")
      .eq("id", user.id)
      .single();

    if (!profile?.peut_gerer_acces || !profile?.actif) throw new Error("Forbidden");

    // 3. Exécuter l'action demandée
    const { action, ...payload } = await req.json();
    let result: Record<string, unknown>;

    switch (action) {
      case "createUser": {
        const { email, name, role, password, color } = payload as {
          email: string; name: string; role: string; password: string; color?: string;
        };
        if (!["adjoint","admin","enseignant"].includes(role)) throw new Error("Rôle invalide");
        const { data, error } = await serviceSupabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (error) throw new Error(error.message);
        await serviceSupabase.from("profiles").insert({
          id: data.user.id,
          email,
          name,
          role,
          color: color || "#0d9488",
          actif: true,
          peut_gerer_acces: false,
        });
        result = { success: true, userId: data.user.id };
        break;
      }

      case "updateUserRole": {
        const { userId, role } = payload as { userId: string; role: string };
        if (!["adjoint","admin","enseignant"].includes(role)) throw new Error("Rôle invalide");
        // Empêcher de modifier le rôle de la directrice
        const { data: target } = await serviceSupabase.from("profiles").select("peut_gerer_acces").eq("id", userId).single();
        if (target?.peut_gerer_acces) throw new Error("Impossible de modifier ce compte");
        await serviceSupabase.from("profiles").update({ role }).eq("id", userId);
        result = { success: true };
        break;
      }

      case "toggleActive": {
        const { userId, actif } = payload as { userId: string; actif: boolean };
        const { data: target } = await serviceSupabase.from("profiles").select("peut_gerer_acces").eq("id", userId).single();
        if (target?.peut_gerer_acces) throw new Error("Impossible de désactiver ce compte");
        await serviceSupabase.from("profiles").update({ actif }).eq("id", userId);
        if (!actif) {
          await serviceSupabase.auth.admin.signOut(userId);
        }
        result = { success: true };
        break;
      }

      case "resetPassword": {
        const { userId, newPassword } = payload as { userId: string; newPassword: string };
        if (newPassword.length < 8) throw new Error("Mot de passe trop court (8 caractères minimum)");
        await serviceSupabase.auth.admin.updateUserById(userId, { password: newPassword });
        result = { success: true };
        break;
      }

      case "deleteUser": {
        const { userId } = payload as { userId: string };
        const { data: target } = await serviceSupabase.from("profiles").select("peut_gerer_acces").eq("id", userId).single();
        if (target?.peut_gerer_acces) throw new Error("Impossible de supprimer ce compte");
        await serviceSupabase.auth.admin.deleteUser(userId);
        result = { success: true };
        break;
      }

      default:
        throw new Error("Action inconnue");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
