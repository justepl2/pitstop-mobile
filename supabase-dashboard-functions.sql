-- ================================
-- FONCTIONS RPC DASHBOARD SUPABASE
-- ================================

-- 1. Compter les véhicules d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_vehicles_count(user_id_param uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM vehicles 
  WHERE user_id = user_id_param;
$$;

-- 2. Compter les entretiens effectués pour un utilisateur
CREATE OR REPLACE FUNCTION get_user_maintenances_count(user_id_param uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(mh.id)::integer
  FROM maintenance_histrory mh
  INNER JOIN maintenances m ON mh.maintenance_ids = m.id
  INNER JOIN vehicles v ON m.vehicle_id = v.id
  WHERE v.user_id = user_id_param;
$$;

-- 3. Calculer le coût total des entretiens (en euros, converti depuis centimes)
CREATE OR REPLACE FUNCTION get_user_total_cost(user_id_param uuid)
RETURNS numeric(10,2)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    ROUND(
      SUM(mh.cost)::numeric / 100, 2
    ), 
    0.00
  )
  FROM maintenance_histrory mh
  INNER JOIN maintenances m ON mh.maintenance_ids = m.id
  INNER JOIN vehicles v ON m.vehicle_id = v.id
  WHERE v.user_id = user_id_param
    AND mh.cost IS NOT NULL;
$$;

-- 4. Compter les maintenances à prévoir (fonction complexe)
-- Cette fonction nécessite plus de logique, on va la créer en PL/pgSQL
CREATE OR REPLACE FUNCTION get_user_reminders_count(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reminder_count integer := 0;
  vehicle_record record;
  maintenance_record record;
  last_maintenance_date date;
  last_maintenance_km integer;
  current_date_val date := CURRENT_DATE;
  km_progress numeric;
  month_progress numeric;
  max_progress numeric;
BEGIN
  -- Parcourir tous les véhicules de l'utilisateur
  FOR vehicle_record IN 
    SELECT id, kilometers 
    FROM vehicles 
    WHERE user_id = user_id_param
  LOOP
    -- Parcourir toutes les maintenances de ce véhicule
    FOR maintenance_record IN
      SELECT id, interval_km, interval_month, interval_hour
      FROM maintenances
      WHERE vehicle_id = vehicle_record.id
    LOOP
      -- Récupérer la dernière maintenance de ce type
      SELECT date, km INTO last_maintenance_date, last_maintenance_km
      FROM maintenance_histrory
      WHERE maintenance_ids = maintenance_record.id
      ORDER BY date DESC NULLS LAST
      LIMIT 1;
      
      max_progress := 0;
      
      -- Calculer le pourcentage KM si applicable
      IF maintenance_record.interval_km IS NOT NULL THEN
        IF last_maintenance_km IS NOT NULL THEN
          km_progress := ((vehicle_record.kilometers - last_maintenance_km)::numeric / maintenance_record.interval_km) * 100;
        ELSE
          km_progress := (vehicle_record.kilometers::numeric / maintenance_record.interval_km) * 100;
        END IF;
        max_progress := GREATEST(max_progress, COALESCE(km_progress, 0));
      END IF;
      
      -- Calculer le pourcentage mois si applicable
      IF maintenance_record.interval_month IS NOT NULL AND last_maintenance_date IS NOT NULL THEN
        month_progress := (
          (EXTRACT(YEAR FROM current_date_val) - EXTRACT(YEAR FROM last_maintenance_date)) * 12 +
          (EXTRACT(MONTH FROM current_date_val) - EXTRACT(MONTH FROM last_maintenance_date))
        )::numeric / maintenance_record.interval_month * 100;
        max_progress := GREATEST(max_progress, COALESCE(month_progress, 0));
      END IF;
      
      -- Si le pourcentage >= 80%, compter comme rappel
      IF max_progress >= 80 THEN
        reminder_count := reminder_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN reminder_count;
END;
$$;

-- 5. Fonction globale pour récupérer toutes les stats en une fois
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_id_param uuid)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'vehicles', get_user_vehicles_count(user_id_param),
    'maintenances', get_user_maintenances_count(user_id_param),
    'totalCost', get_user_total_cost(user_id_param),
    'reminderCount', get_user_reminders_count(user_id_param)
  );
$$;
