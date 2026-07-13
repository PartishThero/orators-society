import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { events as localEvents } from '../data/events';
import { legacyItems as localLegacyEvents } from '../data/legacy';
import { archiveTimelineEvents as localArchiveTimeline, legacyTimelineEvents as localLegacyTimeline } from '../data/timeline';
import { registrations as localRegistrations } from '../data/registrations';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [events, setEvents] = useState(localEvents);
  const [legacyEvents, setLegacyEvents] = useState(localLegacyEvents);
  const [archiveTimeline, setArchiveTimeline] = useState(localArchiveTimeline);
  const [legacyTimeline, setLegacyTimeline] = useState(localLegacyTimeline);
  const [registrations, setRegistrations] = useState(localRegistrations);

  const [loading, setLoading] = useState({
    events: false,
    legacyEvents: false,
    archiveTimeline: false,
    legacyTimeline: false,
    registrations: false,
  });

  const fetchEvents = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(prev => ({ ...prev, events: true }));
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        const formatted = data.map(item => ({
          ...item,
          colSpan: item.col_span
        }));
        setEvents(formatted);
      }
    } catch (err) {
      console.error('Failed to load events from Supabase, using local fallback:', err);
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  }, []);

  const fetchLegacyEvents = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(prev => ({ ...prev, legacyEvents: true }));
    try {
      const { data, error } = await supabase
        .from('legacy_events')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        const formatted = data.map(item => ({
          ...item,
          colSpan: item.col_span
        }));
        setLegacyEvents(formatted);
      }
    } catch (err) {
      console.error('Failed to load legacy events from Supabase, using local fallback:', err);
    } finally {
      setLoading(prev => ({ ...prev, legacyEvents: false }));
    }
  }, []);

  const fetchArchiveTimeline = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(prev => ({ ...prev, archiveTimeline: true }));
    try {
      const { data, error } = await supabase
        .from('archive_timeline')
        .select('*')
        .order('year', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setArchiveTimeline(data);
      }
    } catch (err) {
      console.error('Failed to load archive timeline from Supabase, using local fallback:', err);
    } finally {
      setLoading(prev => ({ ...prev, archiveTimeline: false }));
    }
  }, []);

  const fetchLegacyTimeline = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(prev => ({ ...prev, legacyTimeline: true }));
    try {
      const { data, error } = await supabase
        .from('legacy_timeline')
        .select('*')
        .order('year', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setLegacyTimeline(data);
      }
    } catch (err) {
      console.error('Failed to load legacy timeline from Supabase, using local fallback:', err);
    } finally {
      setLoading(prev => ({ ...prev, legacyTimeline: false }));
    }
  }, []);

  const fetchRegistrations = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(prev => ({ ...prev, registrations: true }));
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setRegistrations(data);
      }
    } catch (err) {
      console.error('Failed to load registrations from Supabase, using local fallback:', err);
    } finally {
      setLoading(prev => ({ ...prev, registrations: false }));
    }
  }, []);

  const addRegistration = useCallback(async (eventId, name, email) => {
    const newReg = {
      event_id: eventId,
      name,
      email,
      created_at: new Date().toISOString()
    };
    
    // Optimistic local update
    setRegistrations(prev => [
      { id: `temp_${Date.now()}`, ...newReg },
      ...prev
    ]);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('event_registrations')
          .insert([newReg]);
        if (error) throw error;
        // Re-fetch to get real ID
        fetchRegistrations();
      } catch (err) {
        console.error('Failed to save registration to Supabase:', err);
        throw err;
      }
    }
  }, [fetchRegistrations]);

  const deleteRegistration = useCallback(async (id) => {
    // Optimistic local update
    setRegistrations(prev => prev.filter(r => r.id !== id));
    
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('event_registrations')
          .delete()
          .match({ id });
        if (error) throw error;
      } catch (err) {
        console.error('Failed to delete registration from Supabase:', err);
        fetchRegistrations(); // rollback
        throw err;
      }
    }
  }, [fetchRegistrations]);

  // Force-refresh function for individual tables (to be triggered after admin mutations)
  const refreshData = useCallback((type) => {
    if (type === 'events' || type === 'events_list') {
      fetchEvents();
    } else if (type === 'legacy' || type === 'legacy_events') {
      fetchLegacyEvents();
    } else if (type === 'archive_timeline') {
      fetchArchiveTimeline();
    } else if (type === 'legacy_timeline') {
      fetchLegacyTimeline();
    } else if (type === 'registrations') {
      fetchRegistrations();
    }
  }, [fetchEvents, fetchLegacyEvents, fetchArchiveTimeline, fetchLegacyTimeline, fetchRegistrations]);

  // Load all data once on mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchEvents();
      fetchLegacyEvents();
      fetchArchiveTimeline();
      fetchLegacyTimeline();
      fetchRegistrations();
    }
  }, [fetchEvents, fetchLegacyEvents, fetchArchiveTimeline, fetchLegacyTimeline, fetchRegistrations]);

  return (
    <DataContext.Provider
      value={{
        events,
        legacyEvents,
        archiveTimeline,
        legacyTimeline,
        registrations,
        loading,
        refreshData,
        addRegistration,
        deleteRegistration,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
