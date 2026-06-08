import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { events as localEvents } from '../data/events';
import { legacyItems as localLegacyEvents } from '../data/legacy';
import { archiveTimelineEvents as localArchiveTimeline, legacyTimelineEvents as localLegacyTimeline } from '../data/timeline';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [events, setEvents] = useState(localEvents);
  const [legacyEvents, setLegacyEvents] = useState(localLegacyEvents);
  const [archiveTimeline, setArchiveTimeline] = useState(localArchiveTimeline);
  const [legacyTimeline, setLegacyTimeline] = useState(localLegacyTimeline);

  const [loading, setLoading] = useState({
    events: false,
    legacyEvents: false,
    archiveTimeline: false,
    legacyTimeline: false,
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
    }
  }, [fetchEvents, fetchLegacyEvents, fetchArchiveTimeline, fetchLegacyTimeline]);

  // Load all data once on mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchEvents();
      fetchLegacyEvents();
      fetchArchiveTimeline();
      fetchLegacyTimeline();
    }
  }, [fetchEvents, fetchLegacyEvents, fetchArchiveTimeline, fetchLegacyTimeline]);

  return (
    <DataContext.Provider
      value={{
        events,
        legacyEvents,
        archiveTimeline,
        legacyTimeline,
        loading,
        refreshData,
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
