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
  const [recruitments, setRecruitments] = useState([]);
  const [globalSettings, setGlobalSettings] = useState({
    recruitment_form_link: 'https://docs.google.com/forms/d/e/1FAIpQLSf4M0B81wN_rU7y2fA2K3H6H0i3fQz2t4yA4m0/viewform?usp=pp_url&entry.12345=DummyName&entry.67890=DummyEmail'
  });

  const [loading, setLoading] = useState({
    events: false,
    legacyEvents: false,
    archiveTimeline: false,
    legacyTimeline: false,
    registrations: false,
    recruitments: false,
    globalSettings: false,
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

  const fetchRecruitments = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(prev => ({ ...prev, recruitments: true }));
    try {
      const { data, error } = await supabase
        .from('society_petitions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setRecruitments(data);
      }
    } catch (err) {
      console.error('Failed to load recruitments from Supabase:', err);
    } finally {
      setLoading(prev => ({ ...prev, recruitments: false }));
    }
  }, []);

  const fetchGlobalSettings = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(prev => ({ ...prev, globalSettings: true }));
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('*');
      if (error) {
        if (error.code === '42P01') {
          console.warn('global_settings table does not exist yet. Please create it.');
        } else {
          throw error;
        }
      }
      if (data) {
        const settingsMap = { ...globalSettings };
        data.forEach(item => {
          settingsMap[item.key] = item.value;
        });
        setGlobalSettings(settingsMap);
      }
    } catch (err) {
      console.error('Failed to load global settings:', err);
    } finally {
      setLoading(prev => ({ ...prev, globalSettings: false }));
    }
  }, []);

  const addRegistration = useCallback(async (eventId, name, email) => {
    const newReg = {
      event_id: eventId,
      name,
      email,
      created_at: new Date().toISOString()
    };
    
    if (isSupabaseConfigured) {
      try {
        const { data: existing, error: checkError } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('event_id', eventId)
          .ilike('email', email)
          .maybeSingle();

        if (checkError) throw checkError;
        if (existing) {
          throw new Error('ALREADY_REGISTERED');
        }

        // Optimistic local update
        setRegistrations(prev => [
          { id: `temp_${Date.now()}`, ...newReg },
          ...prev
        ]);

        const { error } = await supabase
          .from('event_registrations')
          .insert([newReg]);
        if (error) throw error;
        // Re-fetch to get real ID
        fetchRegistrations();
      } catch (err) {
        console.error('Failed to add registration to Supabase:', err);
        throw err;
      }
    } else {
      setRegistrations(prev => [
        { id: `temp_${Date.now()}`, ...newReg },
        ...prev
      ]);
    }
  }, [fetchRegistrations]);

  const addRecruitment = useCallback(async (payload) => {
    const newReg = {
      full_name: payload.name,
      email: payload.email,
      phone: payload.phone,
      interest_area: payload.interestArea,
      experience_level: payload.experienceLevel,
      motivation_text: payload.motivationText,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('society_petitions')
          .insert([newReg]);
        if (error) throw error;
      } catch (err) {
        console.error('Failed to add recruitment petition to Supabase:', err);
        throw err;
      }
    } else {
      console.log('Local Mode - Recruitment Petition Saved:', newReg);
    }
  }, []);


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

  const deleteRecruitment = useCallback(async (id) => {
    setRecruitments(prev => prev.filter(r => r.id !== id));
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('society_petitions')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Failed to delete recruitment petition:', err);
        throw err;
      }
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
    } else if (type === 'registrations') {
      fetchRegistrations();
    } else if (type === 'petitions') {
      fetchRecruitments();
    } else if (type === 'settings') {
      fetchGlobalSettings();
    }
  }, [fetchEvents, fetchLegacyEvents, fetchArchiveTimeline, fetchLegacyTimeline, fetchRegistrations, fetchRecruitments, fetchGlobalSettings]);

  // Load all data once on mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchEvents();
      fetchLegacyEvents();
      fetchArchiveTimeline();
      fetchLegacyTimeline();
      fetchRegistrations();
      fetchRecruitments();
      fetchGlobalSettings();
    }
  }, [fetchEvents, fetchLegacyEvents, fetchArchiveTimeline, fetchLegacyTimeline, fetchRegistrations, fetchRecruitments, fetchGlobalSettings]);

  return (
    <DataContext.Provider
      value={{
        events,
        legacyEvents,
        archiveTimeline,
        legacyTimeline,
        registrations,
        recruitments,
        globalSettings,
        loading,
        refreshData,
        addRegistration,
        addRecruitment,
        deleteRegistration,
        deleteRecruitment,
        fetchGlobalSettings,
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
