import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/domain";

/** Directory of users; local because only pickers need it. */
export function usePeople() {
  const [people, setPeople] = useState<Profile[]>([]);
  useEffect(() => {
    supabase.from("profiles").select("*").order("email").then(({ data }) => setPeople(data ?? []));
  }, []);
  return people;
}
