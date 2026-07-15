import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import PageLayout from '../components/layout/PageLayout';
import SectionWrapper from '../components/layout/SectionWrapper';
import ArchitecturalGrid from '../components/layout/ArchitecturalGrid';
import { events as localEvents } from '../data/events';
import { legacyItems as localLegacyEvents } from '../data/legacy';
import { archiveTimelineEvents as localArchiveTimeline, legacyTimelineEvents as localLegacyTimeline } from '../data/timeline';
import ArchiveModal from '../components/ui/ArchiveModal';
import { useData } from '../context/DataContext';

export default function AdminPage() {
  const { refreshData, events: allEvents, legacyEvents: allLegacyEvents, globalSettings, fetchGlobalSettings } = useData();

  const getEventTitle = (eventId) => {
    const event = [...(allEvents || []), ...(allLegacyEvents || [])].find(e => e.id === eventId);
    return event ? event.title : eventId;
  };

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'legacy' | 'whitelist' | 'archive_timeline' | 'legacy_timeline'
  
  // Auth Form State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Data States
  const [events, setEvents] = useState([]);
  const [legacyEvents, setLegacyEvents] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [archiveTimeline, setArchiveTimeline] = useState([]);
  const [legacyTimeline, setLegacyTimeline] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [recruitments, setRecruitments] = useState([]);
  const [adminSettings, setAdminSettings] = useState({
    recruitment_form_link: ''
  });
  const [dataLoading, setDataLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null means adding a new item
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    synopsis: '',
    winner: '',
    location: '',
    img: '',
    height: 400,
    colSpan: 1,
    whitelistEmail: '', // only used for whitelist tab
    // Timeline fields
    year: '',
    badge: 'outline', // 'primary' | 'secondary' | 'outline'
    active: false,
    body: '',
    entriesText: '' // text representation of entries list, e.g. "icon:label"
  });

  // Note: This client-side check does not replace server-side enforcement.
  // Supabase Row Level Security (RLS) policies on events, legacy_events,
  // archive_timeline, legacy_timeline, and allowed_admins should independently
  // restrict writes to whitelisted emails, since a client-side check alone
  // can be bypassed by calling the Supabase API directly.
  const verifyAdminAccess = async (currentSession) => {
    if (!currentSession) return;
    
    const { data, error } = await supabase
      .from('allowed_admins')
      .select('*')
      .eq('email', currentSession.user.email)
      .maybeSingle();

    if (error || !data) {
      await supabase.auth.signOut();
      setSession(null);
      setAuthError("This account is not authorized for admin access.");
    }
  };

  // Track session
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      verifyAdminAccess(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      verifyAdminAccess(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session, activeTab]);

  // Sync settings when they load
  useEffect(() => {
    if (globalSettings) {
      setAdminSettings({
        recruitment_form_link: globalSettings.recruitment_form_link || ''
      });
    }
  }, [globalSettings]);

  async function fetchData(showLoading = true, clearStatus = true) {
    if (showLoading) setDataLoading(true);
    if (clearStatus) setStatusMessage(null);
    try {
      if (activeTab === 'events') {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setEvents(data || []);
      } else if (activeTab === 'legacy') {
        const { data, error } = await supabase
          .from('legacy_events')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setLegacyEvents(data || []);
      } else if (activeTab === 'whitelist') {
        const { data, error } = await supabase
          .from('allowed_admins')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setWhitelist(data || []);
      } else if (activeTab === 'archive_timeline') {
        const { data, error } = await supabase
          .from('archive_timeline')
          .select('*')
          .order('year', { ascending: false });
        if (error) throw error;
        setArchiveTimeline(data || []);
      } else if (activeTab === 'legacy_timeline') {
        const { data, error } = await supabase
          .from('legacy_timeline')
          .select('*')
          .order('year', { ascending: false });
        if (error) throw error;
        setLegacyTimeline(data || []);
      } else if (activeTab === 'registrations') {
        const { data, error } = await supabase
          .from('event_registrations')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setRegistrations(data || []);
      } else if (activeTab === 'petitions') {
        const { data, error } = await supabase
          .from('society_petitions')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setRecruitments(data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to load data.' });
    } finally {
      setDataLoading(false);
    }
  }

  // Handle Authentication
  async function handleAuth(e) {
    e.preventDefault();
    if (!email || !password) return;

    setAuthLoading(true);
    setAuthMessage(null);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  }

  // Note: This signup path is intentionally whitelist-gated on the client.
  // Supabase RLS on allowed_admins should also block unauthorized inserts server-side 
  // as defense in depth.
  async function handleSignUp(e) {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    setAuthMessage(null);
    setAuthError(null);

    try {
      // Check if email is in allowed_admins
      const { data, error: checkError } = await supabase
        .from('allowed_admins')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (checkError || !data) {
        throw new Error('This email is not authorized. Contact an existing admin to be whitelisted first.');
      }

      // Proceed with signup
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      setAuthMessage('Signup successful! If email confirmation is enabled, please check your inbox to confirm your email before logging in.');
    } catch (err) {
      setAuthError(err.message || 'Signup failed.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // Sync Initial Static Data to Supabase
  async function syncInitialData() {
    if (!window.confirm('This will copy all events and timelines from local files to Supabase. Continue?')) return;
    setSyncLoading(true);
    setStatusMessage(null);

    try {
      let eventCount = 0;
      let legacyCount = 0;
      let archiveTimelineCount = 0;
      let legacyTimelineCount = 0;

      // 1. Sync regular events
      const mappedEvents = localEvents.map(e => ({
        img: e.img,
        title: e.title,
        subtitle: e.subtitle || '',
        date: e.date,
        synopsis: e.synopsis || '',
        winner: e.winner || '',
        location: e.location || '',
        height: e.height || 400,
        col_span: e.colSpan || 1,
        status: e.status || 'past',
        google_form_link: e.google_form_link || null
      }));

      if (mappedEvents.length > 0) {
        const { error } = await supabase.from('events').insert(mappedEvents);
        if (error) throw error;
        eventCount = mappedEvents.length;
      }

      // 2. Sync legacy events
      const mappedLegacy = localLegacyEvents.map(e => ({
        img: e.img,
        title: e.title,
        subtitle: e.subtitle || '',
        date: e.date,
        synopsis: e.synopsis || '',
        winner: e.winner || '',
        location: e.location || '',
        height: e.height || 400,
        col_span: e.colSpan || 1,
        status: e.status || 'past',
        google_form_link: e.google_form_link || null
      }));

      if (mappedLegacy.length > 0) {
        const { error } = await supabase.from('legacy_events').insert(mappedLegacy);
        if (error) throw error;
        legacyCount = mappedLegacy.length;
      }

      // 3. Sync Archive Timeline
      if (localArchiveTimeline && localArchiveTimeline.length > 0) {
        const { error } = await supabase.from('archive_timeline').insert(
          localArchiveTimeline.map(t => ({
            year: t.year,
            title: t.title,
            badge: t.badge || 'outline',
            entries: t.entries || []
          }))
        );
        if (error) throw error;
        archiveTimelineCount = localArchiveTimeline.length;
      }

      // 4. Sync Legacy Timeline
      if (localLegacyTimeline && localLegacyTimeline.length > 0) {
        const { error } = await supabase.from('legacy_timeline').insert(
          localLegacyTimeline.map(t => ({
            year: t.year,
            title: t.title,
            body: t.body || '',
            active: t.active || false
          }))
        );
        if (error) throw error;
        legacyTimelineCount = localLegacyTimeline.length;
      }

      setStatusMessage({
        type: 'success',
        text: `Successfully synced: ${eventCount} events, ${legacyCount} legacy events, ${archiveTimelineCount} archive timeline events, and ${legacyTimelineCount} legacy timeline events.`
      });
      fetchData();
      refreshData('events');
      refreshData('legacy');
      refreshData('archive_timeline');
      refreshData('legacy_timeline');
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Synchronization failed. Verify database tables exist.' });
    } finally {
      setSyncLoading(false);
    }
  }

  // Open Add/Edit Modal
  function openAddModal() {
    if (activeTab === 'settings') {
      handleSaveSettings();
      return;
    }
    if (activeTab === 'whitelist') {
      setEditingItem(null);
      setFormData({
        whitelistEmail: ''
      });
      setShowModal(true);
    } else if (activeTab === 'archive_timeline') {
      setEditingItem(null);
      setFormData({
        year: new Date().getFullYear().toString(),
        title: '',
        badge: 'outline',
        entriesText: 'architecture:Structural Rhetoric Overhaul\nworkspace_premium:Record Attendance'
      });
      setShowModal(true);
    } else if (activeTab === 'legacy_timeline') {
      setEditingItem(null);
      setFormData({
        year: new Date().getFullYear().toString(),
        title: '',
        body: '',
        active: false
      });
      setShowModal(true);
    } else {
      setEditingItem({
        title: '',
        subtitle: '',
        date: '',
        location: '',
        winner: '',
        runner_up: '',
        event_series: '',
        attendance: '',
        speaker_count: '',
        duration: '',
        participants: '',
        rounds: '',
        judges: '',
        img: '',
        synopsis: '',
        winning_argument: '',
        height: 500,
        col_span: 2,
        status: 'past',
        google_form_link: '',
        themes: [],
        gallery: []
      });
      setShowModal(true);
    }
  }

  function openEditModal(item) {
    setEditingItem(item);
    if (activeTab === 'whitelist') {
      setFormData({
        whitelistEmail: item.email
      });
      setShowModal(true);
    } else if (activeTab === 'archive_timeline') {
      const entriesText = (item.entries || []).map(e => `${e.icon}:${e.label}`).join('\n');
      setFormData({
        year: item.year,
        title: item.title,
        badge: item.badge || 'outline',
        entriesText
      });
      setShowModal(true);
    } else if (activeTab === 'legacy_timeline') {
      setFormData({
        year: item.year,
        title: item.title,
        body: item.body || '',
        active: item.active || false
      });
      setShowModal(true);
    } else {
      setShowModal(true);
    }
  }

  // Handle Form Submission
  async function handleSubmit(e) {
    e.preventDefault();
    setStatusMessage(null);
    const table = 
      activeTab === 'events' ? 'events' : 
      activeTab === 'legacy' ? 'legacy_events' : 
      activeTab === 'whitelist' ? 'allowed_admins' : 
      activeTab === 'archive_timeline' ? 'archive_timeline' : 'legacy_timeline';

    try {
      if (activeTab === 'whitelist') {
        if (!formData.whitelistEmail) return;
        if (editingItem) {
          const { error } = await supabase
            .from(table)
            .update({ email: formData.whitelistEmail })
            .eq('id', editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from(table)
            .insert([{ email: formData.whitelistEmail }]);
          if (error) throw error;
        }
      } else if (activeTab === 'archive_timeline') {
        const parsedEntries = (formData.entriesText || '')
          .split('\n')
          .map(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
              return { icon: parts[0].trim(), label: parts.slice(1).join(':').trim() };
            }
            return null;
          })
          .filter(Boolean);

        const payload = {
          year: formData.year,
          title: formData.title,
          badge: formData.badge,
          entries: parsedEntries
        };

        if (editingItem) {
          const { error } = await supabase
            .from(table)
            .update(payload)
            .eq('id', editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from(table)
            .insert([payload]);
          if (error) throw error;
        }
      } else if (activeTab === 'legacy_timeline') {
        const payload = {
          year: formData.year,
          title: formData.title,
          body: formData.body,
          active: formData.active
        };

        if (editingItem) {
          const { error } = await supabase
            .from(table)
            .update(payload)
            .eq('id', editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from(table)
            .insert([payload]);
          if (error) throw error;
        }
      }

      setStatusMessage({
        type: 'success',
        text: editingItem ? 'Item updated successfully.' : 'Item added successfully.'
      });
      setShowModal(false);
      fetchData();
      refreshData(activeTab);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Operation failed. Verify RLS permissions.' });
    }
  }

  async function handleSaveSettings() {
    setStatusMessage(null);
    try {
      // We store each key-value pair in global_settings table
      const keys = Object.keys(adminSettings);
      for (const key of keys) {
        // Upsert by checking if it exists
        const { data: existing } = await supabase
          .from('global_settings')
          .select('id')
          .eq('key', key)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('global_settings')
            .update({ value: adminSettings[key] })
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('global_settings')
            .insert([{ key, value: adminSettings[key] }]);
          if (error) throw error;
        }
      }
      
      setStatusMessage({ type: 'success', text: 'Settings saved successfully.' });
      fetchGlobalSettings();
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save settings.' });
    }
  }

  // Handle live visual editor save (for Masonry cards)
  async function handleLiveSave(updatedItem) {
    setStatusMessage(null);
    const table = activeTab === 'events' ? 'events' : 'legacy_events';

    try {
      const payload = {
        title: updatedItem.title,
        subtitle: updatedItem.subtitle,
        date: updatedItem.date,
        synopsis: updatedItem.synopsis,
        winner: updatedItem.winner,
        location: updatedItem.location,
        img: updatedItem.img,
        height: parseInt(updatedItem.height) || 400,
        col_span: parseInt(updatedItem.col_span) || 1,
        runner_up: updatedItem.runner_up,
        event_series: updatedItem.event_series,
        attendance: updatedItem.attendance,
        speaker_count: updatedItem.speaker_count,
        duration: updatedItem.duration,
        participants: updatedItem.participants,
        rounds: updatedItem.rounds,
        judges: updatedItem.judges,
        themes: updatedItem.themes,
        winning_argument: updatedItem.winning_argument,
        gallery: updatedItem.gallery,
        status: updatedItem.status || 'past',
        google_form_link: updatedItem.google_form_link || null
      };

      if (updatedItem.id) {
        const { error } = await supabase
          .from(table)
          .update(payload)
          .eq('id', updatedItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .insert([payload]);
        if (error) throw error;
      }

      setStatusMessage({
        type: 'success',
        text: updatedItem.id ? 'Item updated successfully.' : 'Item added successfully.'
      });
      setShowModal(false);
      fetchData();
      refreshData(activeTab);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Operation failed. Verify RLS permissions.' });
    }
  }

  // Delete Handlers
  async function handleDelete(id, name, type) {
    const displayName = name && name !== type ? `"${name}" (${type})` : type;
    if (!window.confirm(`Are you sure you want to delete ${displayName}? This action cannot be undone.`)) return;

    setStatusMessage(null);
    try {
      let table = '';
      if (type === 'Event') table = 'events';
      else if (type === 'Legacy Event') table = 'legacy_events';
      else if (type === 'Whitelist') table = 'allowed_admins';
      else if (type === 'Archive Timeline') table = 'archive_timeline';
      else if (type === 'Legacy Timeline') table = 'legacy_timeline';
      else if (type === 'Registration') table = 'event_registrations';
      else if (type === 'Recruitment') table = 'society_petitions';
      
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Database returned 0 rows deleted. Check your Supabase RLS policies for DELETE permissions on ' + table);
      }

      setStatusMessage({ type: 'success', text: 'Item deleted successfully.' });
      fetchData(false, false);
      refreshData(activeTab);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete.' });
    }
  }

  if (loading) {
    return (
      <PageLayout includeGrainient={true} hideFooter={true}>
        <div className="flex-grow flex items-center justify-center text-white">
          <span className="font-label-caps tracking-[0.2em] animate-pulse">Loading System...</span>
        </div>
      </PageLayout>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <PageLayout includeGrainient={true} hideFooter={true}>
        <main className="flex-grow">
          <SectionWrapper className="px-[clamp(1.5rem,7vw,10rem)] py-16 md:py-24 max-w-4xl mx-auto">
            <div className="bg-black/40 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-md">
              <span className="font-label-caps text-primary tracking-[0.2em] text-[12px] block mb-4">CONFIG REQUIRED</span>
              <h1 className="font-display-xl text-white uppercase tracking-tighter mb-6">SUPABASE NOT CONFIGURED</h1>
              <p className="font-body-md text-white/70 leading-relaxed mb-8">
                To enable the admin dashboard and dynamic events storage, please create a `.env` file in the root of your project directory and add your Supabase access keys:
              </p>
              <pre className="bg-black/60 border border-white/5 rounded-xl p-6 font-mono text-[14px] text-primary/90 overflow-x-auto mb-8">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
              </pre>
              <p className="font-body-md text-white/50 text-[14px]">
                Once variables are set, restart your development server to load the admin login screen. Refer to the implementation plan for SQL code to initialize your database tables.
              </p>
            </div>
          </SectionWrapper>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      includeGrainient={true}
      hideFooter={true}
      grainientProps={{
        color1: "#2e433a",
        color2: "#2A4035",
        color3: "#58795a",
        timeSpeed: 1.5
      }}
    >
      <main className="flex-grow">
        <ArchitecturalGrid />

        <SectionWrapper className="px-[clamp(1.5rem,5vw,8rem)] py-16 md:py-24 z-10 relative">
          <div className="max-w-7xl w-full mx-auto">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <span className="font-label-caps text-primary tracking-[0.3em] text-[11px] block mb-2 uppercase">ORATOR SOCIETY CONTROL</span>
                <h1 className="font-display-xl text-[3rem] text-white uppercase tracking-tighter leading-none">ADMIN PANEL</h1>
              </div>
              {session && (
                <div className="flex items-center gap-4">
                  <span className="text-white/60 text-[13px] font-mono">{session.user.email}</span>
                  <button 
                    onClick={handleLogout}
                    className="font-label-caps text-[10px] uppercase tracking-[0.15em] px-4 py-2 border border-white/10 hover:border-primary/50 hover:text-primary transition-all duration-300 rounded-full bg-white/[0.02] text-white"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            {/* ── AUTHENTICATION WALL ── */}
            <AnimatePresence mode="wait">
              {!session ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-md mx-auto"
                >
                  <div className="bg-[#0A0A0A]/80 border border-white/5 rounded-[2rem] p-8 md:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    
                    <h3 className="font-display-xl text-[1.8rem] text-white uppercase tracking-tight text-center mb-6">STAFF ACCESS</h3>
                    
                    {/* Toggle */}
                    <div className="flex rounded-lg overflow-hidden border border-white/10 mb-6 bg-white/[0.02]">
                      <button 
                        type="button"
                        onClick={() => { setAuthMode('login'); setAuthError(null); setAuthMessage(null); }}
                        className={`flex-1 py-2 text-[10px] font-label-caps uppercase tracking-wider transition-colors ${authMode === 'login' ? 'bg-primary/20 text-primary' : 'text-white/50 hover:text-white/80'}`}
                      >
                        Log In
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setAuthMode('signup'); setAuthError(null); setAuthMessage(null); }}
                        className={`flex-1 py-2 text-[10px] font-label-caps uppercase tracking-wider transition-colors ${authMode === 'signup' ? 'bg-primary/20 text-primary' : 'text-white/50 hover:text-white/80'}`}
                      >
                        Sign Up
                      </button>
                    </div>

                    <form onSubmit={authMode === 'login' ? handleAuth : handleSignUp} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Registered Email</label>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@orator-society.org"
                          className="w-full bg-white/[0.03] border-b border-white/10 rounded-none px-1 py-3 text-white text-[16px] focus:outline-none focus:border-primary/60 transition-colors placeholder:text-white/20"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Password</label>
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/[0.03] border-b border-white/10 rounded-none px-1 py-3 text-white text-[16px] focus:outline-none focus:border-primary/60 transition-colors placeholder:text-white/20"
                          required
                        />
                      </div>

                      {authMode === 'signup' && (
                        <div>
                          <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Confirm Password</label>
                          <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/[0.03] border-b border-white/10 rounded-none px-1 py-3 text-white text-[16px] focus:outline-none focus:border-primary/60 transition-colors placeholder:text-white/20"
                            required
                          />
                        </div>
                      )}

                      {authError && (
                        <div className="text-[12px] text-red-400 bg-red-950/20 border border-red-900/50 p-3 rounded-lg font-mono">
                          {authError}
                        </div>
                      )}

                      {authMessage && (
                        <div className="text-[12px] text-primary bg-primary/5 border border-primary/20 p-3 rounded-lg font-mono">
                          {authMessage}
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={authLoading}
                        style={{ borderRadius: '9999px' }}
                        className="group relative w-full font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center justify-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/5 px-8 py-4 hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />
                        {authLoading ? 'Authenticating...' : authMode === 'login' ? 'Enter System' : 'Submit Credentials'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                
                // ── ADMIN PANEL INTERFACE ──
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-8"
                >
                  {/* Status Messages */}
                  <AnimatePresence>
                    {statusMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: -15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg flex gap-4 items-start relative overflow-hidden ${
                          statusMessage.type === 'success' 
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                            : 'bg-red-950/20 border-red-500/30 text-red-300'
                        }`}
                      >
                        <div className={`absolute top-0 left-0 w-full h-[2px] ${statusMessage.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="material-symbols-outlined text-[20px] mt-0.5 opacity-80">
                          {statusMessage.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <div className="flex-grow">
                          <span className="font-label-caps text-[9px] uppercase tracking-wider block opacity-50 mb-1">
                            {statusMessage.type === 'success' ? 'System Notification' : 'System Alert'}
                          </span>
                          <span className="font-mono text-[13px]">{statusMessage.text}</span>
                        </div>
                        <button 
                          onClick={() => setStatusMessage(null)} 
                          className="w-6 h-6 rounded-full border border-white/10 hover:border-white/20 flex items-center justify-center text-[10px] text-white/50 hover:text-white transition-colors"
                        >
                          ✕
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Top Bar with Navigation & Actions */}
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-white/5 pb-6">
                    <div className="flex flex-col lg:flex-row lg:flex-wrap items-start lg:items-center gap-3 max-w-full overflow-hidden">
                      {[[
                        { id: 'events', label: 'Active Events' },
                        { id: 'legacy', label: 'Legacy Events' }
                      ], [
                        { id: 'archive_timeline', label: 'Archive Timeline' },
                        { id: 'legacy_timeline', label: 'Legacy Timeline' }
                      ], [
                        { id: 'whitelist', label: 'Admin Whitelist' },
                        { id: 'settings', label: 'Global Settings' }
                      ], [
                        { id: 'registrations', label: 'Registrations' },
                        { id: 'petitions', label: 'Petitions' }
                      ]].map((group, groupIdx) => (
                        <div key={groupIdx} className="flex items-center gap-3">
                          <div className="flex flex-nowrap items-center gap-1 bg-white/[0.02] border border-white/5 rounded-full p-1 backdrop-blur-md overflow-x-auto hide-scrollbar max-w-full">
                            {group.map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setStatusMessage(null); }}
                                className={`relative px-4 py-2 rounded-full text-[11px] font-label-caps uppercase tracking-wider transition-all z-10 ${
                                  activeTab === tab.id ? 'text-black' : 'text-white/40 hover:text-white/80'
                                }`}
                              >
                                {tab.label}
                                {activeTab === tab.id && (
                                  <motion.div
                                    layoutId="activeTabPill"
                                    className="absolute inset-0 bg-primary rounded-full -z-10"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                          {groupIdx < 3 && (
                            <div className="hidden lg:block w-px h-6 bg-white/10 mx-1" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4 xl:border-l xl:border-white/10 xl:pl-6 w-full xl:w-auto overflow-x-auto hide-scrollbar">
                      {activeTab === 'registrations' || activeTab === 'petitions' ? (
                        <div className="px-6 py-3 rounded-full text-[10px] font-label-caps uppercase tracking-wider bg-white/5 text-white/50 font-bold border border-white/10 select-none">
                          View Only
                        </div>
                      ) : (
                        <button
                          onClick={openAddModal}
                          className="px-6 py-3 rounded-full text-[10px] font-label-caps uppercase tracking-wider bg-primary text-black font-bold hover:bg-white transition-all shadow-lg hover:shadow-primary/10"
                        >
                          {activeTab === 'whitelist' 
                            ? '+ Whitelist Email' 
                            : activeTab === 'archive_timeline' 
                            ? '+ Add Archive Year' 
                            : activeTab === 'legacy_timeline' 
                            ? '+ Add Legacy Year' 
                            : activeTab === 'settings'
                            ? 'Save Settings'
                            : `+ Add ${activeTab === 'events' ? 'Event' : 'Legacy'}`
                          }
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DATA LISTINGS */}
                  <div className="bg-[#070707]/90 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl min-h-[400px] relative flex flex-col justify-start">
                    {dataLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                        <span className="text-center text-white/50 font-label-caps tracking-widest animate-pulse">
                          Retrieving database records...
                        </span>
                      </div>
                    )}

                    {/* Whitelist Tab */}
                    {activeTab === 'whitelist' && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55">Admin Email</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55">Added At</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {whitelist.length === 0 ? (
                              <tr>
                                <td colSpan="3" className="p-8 text-center text-white/40 font-mono text-[14px]">No whitelisted emails found.</td>
                              </tr>
                            ) : (
                              whitelist.map((item) => (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                  <td className="p-5 text-white font-mono text-[14px]">{item.email}</td>
                                  <td className="p-5 text-white/50 text-[13px]">{new Date(item.created_at).toLocaleDateString()}</td>
                                  <td className="p-5 text-right">
                                    <div className="flex justify-end gap-3">
                                      <button 
                                        onClick={() => openEditModal(item)}
                                        className="text-primary hover:text-white text-[11px] font-label-caps tracking-wider uppercase transition-colors"
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(item.id, item.email, 'Whitelist')}
                                        className="text-red-400 hover:text-red-300 text-[11px] font-label-caps tracking-wider uppercase transition-colors"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Events or Legacy Events Tab */}
                    {(activeTab === 'events' || activeTab === 'legacy') && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55 w-[80px]">Preview</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55">Title / Subtitle</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55">Date & Venue</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55">Winner</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55">Form Link</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(activeTab === 'events' ? events : legacyEvents).length === 0 ? (
                              <tr>
                                <td colSpan="5" className="p-8 text-center text-white/40 font-mono text-[14px]">No records found in this table.</td>
                              </tr>
                            ) : (
                              (activeTab === 'events' ? events : legacyEvents).map((item) => (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                  <td className="p-5">
                                    <img 
                                      src={item.img} 
                                      alt={item.title} 
                                      className="w-12 h-12 object-cover rounded-lg border border-white/10 bg-neutral-900 grayscale"
                                      onError={(e) => { e.target.src = 'https://picsum.photos/id/1025/100/100?grayscale'; }}
                                    />
                                  </td>
                                  <td className="p-5">
                                    <span className="text-white text-[15px] font-semibold block">{item.title || 'Untitled Event'}</span>
                                    <span className="text-white/45 text-[12px] block line-clamp-1 mt-0.5">{item.subtitle || item.synopsis || 'No description available'}</span>
                                  </td>
                                  <td className="p-5">
                                    <span className="text-white text-[13px] block">{item.date || 'TBD'}</span>
                                    <span className="text-white/45 text-[12px] block">{item.location || 'TBA'}</span>
                                  </td>
                                  <td className="p-5">
                                    <span className={`text-[10px] font-label-caps uppercase px-2.5 py-1 rounded-full inline-block border ${
                                      !item.winner || item.winner.trim() === '' || item.winner === 'N/A' 
                                      ? 'bg-white/5 border-white/10 text-white/40' 
                                      : 'bg-primary/10 border-primary/20 text-primary'
                                    }`}>
                                      {item.winner || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="p-5">
                                    <span className="text-white/50 text-[12px] block truncate max-w-[120px]">
                                      {item.google_form_link ? (
                                        <a href={item.google_form_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                          Setup
                                        </a>
                                      ) : 'Not Setup'}
                                    </span>
                                  </td>
                                  <td className="p-5 text-right">
                                    <div className="flex justify-end gap-4">
                                      <button 
                                        onClick={() => openEditModal(item)}
                                        className="text-primary hover:text-white text-[11px] font-label-caps tracking-wider uppercase transition-colors"
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(item.id, item.title, activeTab === 'events' ? 'Event' : 'Legacy Event')}
                                        className="text-red-400 hover:text-red-300 text-[11px] font-label-caps tracking-wider uppercase transition-colors"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Archive Timeline Tab */}
                    {activeTab === 'archive_timeline' && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55 w-[80px]">Year</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55">Title / Headline</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55">Badge Color</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55">Key Metric Items</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {archiveTimeline.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="p-8 text-center text-white/40 font-mono text-[14px]">No records found.</td>
                              </tr>
                            ) : (
                              archiveTimeline.map((item) => (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                  <td className="p-5 text-white font-semibold text-[15px]">{item.year}</td>
                                  <td className="p-5 text-white text-[13px]">{item.title}</td>
                                  <td className="p-5">
                                    <span className="bg-white/10 text-white text-[9px] font-label-caps px-2 py-0.5 rounded uppercase">
                                      {item.badge}
                                    </span>
                                  </td>
                                  <td className="p-5 text-white/60 text-[12px]">
                                    {(item.entries || []).map(e => `${e.icon}: ${e.label}`).join(' | ')}
                                  </td>
                                  <td className="p-5 text-right">
                                    <div className="flex justify-end gap-4">
                                      <button 
                                        onClick={() => openEditModal(item)}
                                        className="text-primary hover:text-white text-[11px] font-label-caps tracking-wider uppercase transition-colors"
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(item.id, `${item.year} Timeline`, 'Archive Timeline')}
                                        className="text-red-400 hover:text-red-300 text-[11px] font-label-caps tracking-wider uppercase transition-colors"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Legacy Timeline Tab */}
                    {activeTab === 'legacy_timeline' && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55 w-[80px]">Year</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55">Event Title</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55">Active Spark</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55 w-[40%]">Event Body Text</th>
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {legacyTimeline.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="p-8 text-center text-white/40 font-mono text-[14px]">No records found.</td>
                              </tr>
                            ) : (
                              legacyTimeline.map((item) => (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                  <td className="p-5 text-white font-semibold text-[15px]">{item.year}</td>
                                  <td className="p-5 text-white text-[13px]">{item.title}</td>
                                  <td className="p-5">
                                    <span className={`text-[9px] font-label-caps px-2 py-0.5 rounded uppercase ${item.active ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'}`}>
                                      {item.active ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                  <td className="p-5 text-white/60 text-[12px] truncate max-w-[250px]">{item.body}</td>
                                  <td className="p-5 text-right">
                                    <div className="flex justify-end gap-4">
                                      <button 
                                        onClick={() => openEditModal(item)}
                                        className="text-primary hover:text-white text-[11px] font-label-caps tracking-wider uppercase transition-colors"
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(item.id, `${item.year} Legacy`, 'Legacy Timeline')}
                                        className="text-red-400 hover:text-red-300 text-[11px] font-label-caps tracking-wider uppercase transition-colors"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Registrations Tab */}
                    {activeTab === 'registrations' && (
                      <div className="flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.02] border-b border-white/5 p-4 px-5">
                          <div className="flex items-center gap-3">
                            <span className="font-label-caps text-[10px] uppercase tracking-wider text-white/50">Total Registrations:</span>
                            <span className="font-mono text-[16px] text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              {registrations.length}
                            </span>
                          </div>
                        </div>
                          
                        <div className="flex flex-col gap-8 p-6 min-h-[400px]">
                          {registrations.length === 0 ? (
                            <div className="text-center py-20 text-white/40 font-mono text-[14px]">
                              No registrations found.
                            </div>
                          ) : (
                            Object.entries(
                              registrations.reduce((acc, item) => {
                                const title = getEventTitle(item.event_id);
                                if (!acc[title]) acc[title] = [];
                                acc[title].push(item);
                                return acc;
                              }, {})
                            ).map(([eventTitle, eventRegistrations]) => (
                              <div key={eventTitle} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                                <div className="bg-white/[0.02] border-b border-white/5 px-6 py-4 flex justify-between items-center">
                                  <h3 className="font-display-xl text-[1.2rem] text-white uppercase">{eventTitle}</h3>
                                  <span className="font-mono text-[12px] text-white/50 bg-white/5 px-2 py-1 rounded">
                                    {eventRegistrations.length} {eventRegistrations.length === 1 ? 'Registration' : 'Registrations'}
                                  </span>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="border-b border-white/5 bg-black/20">
                                        <th className="p-4 px-6 font-label-caps text-[10px] tracking-wider text-white/50">Date</th>
                                        <th className="p-4 px-6 font-label-caps text-[10px] tracking-wider text-white/50">Name</th>
                                        <th className="p-4 px-6 font-label-caps text-[10px] tracking-wider text-white/50">Email</th>
                                        <th className="p-4 px-6 font-label-caps text-[10px] tracking-wider text-white/50 text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {eventRegistrations
                                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                        .map((item) => (
                                          <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                                            <td className="p-4 px-6 text-white/60 text-[12px]">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 px-6 text-white font-semibold text-[13px]">{item.name}</td>
                                            <td className="p-4 px-6 text-white/80 text-[13px]">{item.email}</td>
                                            <td className="p-4 px-6 text-right">
                                              <button 
                                                onClick={() => handleDelete(item.id, 'Registration', 'Registration')}
                                                className="text-red-400 hover:text-red-300 text-[11px] font-label-caps tracking-wider uppercase transition-colors"
                                              >
                                                Delete
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Petitions Tab */}
                    {activeTab === 'petitions' && (
                      <div className="flex flex-col p-6 min-h-[400px]">
                        <div className="flex justify-between items-center mb-8">
                          <h2 className="font-display-xl text-[1.5rem] uppercase text-white">Active Petitions</h2>
                          <span className="font-mono text-[14px] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                            {recruitments.length} Pending
                          </span>
                        </div>
                        
                        {recruitments.length === 0 ? (
                          <div className="text-center py-20 text-white/40 font-mono text-[14px]">
                            No petitions found.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {recruitments.map((petition) => (
                              <div key={petition.id} className="flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-10 -mt-10 pointer-events-none" />
                                
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h4 className="font-display-xl text-[1.2rem] text-white uppercase">{petition.full_name}</h4>
                                    <div className="flex gap-4 mt-1 text-[11px] font-label-caps tracking-wider text-white/50">
                                      <a href={`mailto:${petition.email}`} className="hover:text-primary transition-colors">{petition.email}</a>
                                      {petition.phone && <span>&bull; {petition.phone}</span>}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[10px] text-white/30 font-mono">
                                      {new Date(petition.created_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-5">
                                  <span className="px-3 py-1 rounded-full text-[10px] font-label-caps tracking-wider bg-white/5 border border-white/10 text-white/80">
                                    {petition.interest_area}
                                  </span>
                                  <span className="px-3 py-1 rounded-full text-[10px] font-label-caps tracking-wider bg-primary/10 border border-primary/20 text-primary">
                                    {petition.experience_level}
                                  </span>
                                </div>
                                
                                <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-5 flex-1">
                                  <span className="block text-[9px] font-label-caps uppercase tracking-wider text-white/30 mb-2">Opening Statement</span>
                                  <p className="text-[13px] text-white/70 font-body-md leading-relaxed whitespace-pre-wrap">
                                    {petition.motivation_text}
                                  </p>
                                </div>
                                
                                <div className="flex justify-end pt-2 border-t border-white/5">
                                  <button 
                                    onClick={() => handleDelete(petition.id, 'Petition', 'Recruitment')}
                                    className="text-red-400 hover:text-red-300 text-[10px] font-label-caps tracking-wider uppercase transition-colors px-4 py-2"
                                  >
                                    Dismiss Petition
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                      <div className="flex flex-col p-6 min-h-[400px]">
                        <div className="flex justify-between items-center mb-8">
                          <h2 className="font-display-xl text-[1.5rem] uppercase text-white">Global Settings</h2>
                        </div>
                        
                        <div className="flex flex-col gap-6 max-w-2xl">
                          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                            <h4 className="font-display-xl text-[1.2rem] text-white uppercase mb-2">Recruitment Form</h4>
                            <p className="text-[12px] text-white/50 font-body-md mb-6">
                              Configure the Google Form link used for new society petitions.
                            </p>
                            
                            <label className="block text-[9px] font-label-caps text-white/60 uppercase mb-2">Google Form Link</label>
                            <input 
                              type="url"
                              value={adminSettings.recruitment_form_link}
                              onChange={(e) => setAdminSettings(prev => ({ ...prev, recruitment_form_link: e.target.value }))}
                              placeholder="https://docs.google.com/forms/..."
                              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-[16px] focus:outline-none focus:border-primary/50 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </SectionWrapper>
      </main>

      {/* ── DIALOG / MODAL FORM (Whitelist & Timelines) ── */}
      <AnimatePresence>
        {showModal && (activeTab === 'whitelist' || activeTab === 'archive_timeline' || activeTab === 'legacy_timeline') && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full h-[100dvh] sm:h-auto sm:max-w-md bg-[#090909] border-t sm:border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 z-10 overflow-hidden flex flex-col justify-center sm:block"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display-xl text-[1.5rem] text-white uppercase tracking-tight">
                  {editingItem ? 'Edit Entry' : 'Add New Entry'}
                </h3>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {activeTab === 'whitelist' && (
                  <div>
                    <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Admin Email Address</label>
                    <input 
                      type="email" 
                      value={formData.whitelistEmail}
                      onChange={(e) => setFormData({ ...formData, whitelistEmail: e.target.value })}
                      placeholder="admin@orator-society.org"
                      className="w-full bg-white/[0.03] border-b border-white/10 rounded-none px-1 py-3.5 text-white text-[16px] focus:outline-none focus:border-primary/60 transition-colors placeholder:text-white/20"
                      required
                    />
                  </div>
                )}

                {activeTab === 'archive_timeline' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Timeline Year</label>
                      <input 
                        type="text" 
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="2026"
                        className="w-full bg-white/[0.03] border-b border-white/10 rounded-none px-1 py-3 text-white text-[16px] focus:outline-none focus:border-primary/60 transition-colors placeholder:text-white/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Year Headline</label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Challenging the constructs of parallel realities."
                        className="w-full bg-white/[0.03] border-b border-white/10 rounded-none px-1 py-3 text-white text-[16px] focus:outline-none focus:border-primary/60 transition-colors placeholder:text-white/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Badge Styling Color</label>
                      <select 
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        className="w-full bg-white/[0.03] border-b border-white/10 rounded-none px-1 py-3 text-white text-[16px] focus:outline-none focus:border-primary/60 transition-colors placeholder:text-white/20"
                      >
                        <option value="primary" className="bg-[#090909]">Primary (Gold)</option>
                        <option value="secondary" className="bg-[#090909]">Secondary (Deep Gold)</option>
                        <option value="outline" className="bg-[#090909]">Outline (Gray)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Key Metric Items (one per line as icon:label)</label>
                      <textarea 
                        value={formData.entriesText}
                        onChange={(e) => setFormData({ ...formData, entriesText: e.target.value })}
                        placeholder="public:First Global Symposium&#10;forum:124 Discourse Sessions"
                        rows="3"
                        className="w-full bg-white/[0.03] border-b border-white/10 rounded-none px-1 py-3 text-white text-[16px] focus:outline-none focus:border-primary/60 resize-none font-mono placeholder:text-white/20"
                      />
                      <span className="text-[10px] text-white/40 block mt-1">Available icons: public, forum, architecture, workspace_premium, group, emoji_events</span>
                    </div>
                  </>
                )}

                {activeTab === 'legacy_timeline' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Timeline Year</label>
                      <input 
                        type="text" 
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="2026"
                        className="w-full bg-white/[0.03] border-b border-white/10 rounded-none px-1 py-3 text-white text-[16px] focus:outline-none focus:border-primary/60 transition-colors placeholder:text-white/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Event Title</label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="The Inaugural Spark"
                        className="w-full bg-white/[0.03] border-b border-white/10 rounded-none px-1 py-3 text-white text-[16px] focus:outline-none focus:border-primary/60 transition-colors placeholder:text-white/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Event Description / Body Text</label>
                      <textarea 
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        placeholder="First inter-university championship won..."
                        rows="3"
                        className="w-full bg-white/[0.03] border-b border-white/10 rounded-none px-1 py-3 text-white text-[16px] focus:outline-none focus:border-primary/60 resize-none placeholder:text-white/20"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-3 py-1">
                      <input 
                        id="timeline-active"
                        type="checkbox" 
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 rounded border-white/10 text-primary focus:ring-0 focus:ring-offset-0 bg-white/[0.03]"
                      />
                      <label htmlFor="timeline-active" className="text-[11px] font-label-caps uppercase tracking-wider text-white/70 cursor-pointer">Active Spark Highlights</label>
                    </div>
                  </>
                )}

                <div className="flex gap-4 mt-2">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ borderRadius: '9999px' }}
                    className="flex-[0.4] border border-white/10 bg-white/[0.02] text-white/70 font-label-caps uppercase text-[10px] tracking-wider py-4 hover:bg-white/[0.05] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{ borderRadius: '9999px' }}
                    className="group relative flex-1 font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center justify-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/5 px-8 py-4 hover:bg-white/[0.08]"
                  >
                    <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── LIVE PREVIEW VISUAL EDITOR MODAL (Events & Legacy) ── */}
      <ArchiveModal 
        isOpen={showModal && activeTab !== 'whitelist' && activeTab !== 'archive_timeline' && activeTab !== 'legacy_timeline'} 
        onClose={() => setShowModal(false)} 
        item={editingItem} 
        isAdminEdit={true} 
        onSave={handleLiveSave} 
      />
    </PageLayout>
  );
}
