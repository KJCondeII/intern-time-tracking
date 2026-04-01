"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { calculateHours } from "@/utils/calc";

export default function TimeForm({ refresh }) {
  const supabase = createClient();
  const [form, setForm] = useState({
    date: "",
    am_in: "",
    am_out: "",
    pm_in: "",
    pm_out: "",
  });

  const handleSubmit = async () => {
    const total = calculateHours(
      form.am_in,
      form.am_out,
      form.pm_in,
      form.pm_out
    );

    await supabase.from("time_logs").insert([
      { ...form, total_hours: total },
    ]);

    refresh();
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md grid gap-2">
      <input type="date" onChange={(e)=>setForm({...form, date:e.target.value})}/>
      <input type="time" onChange={(e)=>setForm({...form, am_in:e.target.value})}/>
      <input type="time" onChange={(e)=>setForm({...form, am_out:e.target.value})}/>
      <input type="time" onChange={(e)=>setForm({...form, pm_in:e.target.value})}/>
      <input type="time" onChange={(e)=>setForm({...form, pm_out:e.target.value})}/>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white p-2 rounded-xl"
      >
        Save Entry
      </button>
    </div>
  );
}
