import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

/**
 * useSupabaseRealtime — Subscribe to real-time updates from a Supabase table.
 *
 * Usage:
 *   const { data, loading } = useSupabaseRealtime('complaints');
 *
 * @param {string} table - The Supabase table to subscribe to.
 * @param {object} filters - Optional filters e.g. { column: 'status', value: 'Pending' }
 */
const useSupabaseRealtime = (table, filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial fetch
    const fetchData = async () => {
      let query = supabase.from(table).select('*');

      if (filters.column && filters.value) {
        query = query.eq(filters.column, filters.value);
      }

      const { data: rows, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error(`Supabase fetch error (${table}):`, error);
      } else {
        setData(rows || []);
      }
      setLoading(false);
    };

    fetchData();

    // 2. Subscribe to real-time changes
    const channel = supabase
      .channel(`realtime:${table}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, (payload) => {
        setData((prev) => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table }, (payload) => {
        setData((prev) =>
          prev.map((item) => (item.id === payload.new.id ? payload.new : item))
        );
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table }, (payload) => {
        setData((prev) => prev.filter((item) => item.id !== payload.old.id));
      })
      .subscribe();

    // 3. Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filters.column, filters.value]);

  return { data, loading };
};

export default useSupabaseRealtime;
