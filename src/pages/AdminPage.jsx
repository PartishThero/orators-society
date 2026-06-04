import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import PageLayout from '../components/layout/PageLayout';
import SectionWrapper from '../components/layout/SectionWrapper';
import ArchitecturalGrid from '../components/layout/ArchitecturalGrid';
import { events as localEvents } from '../data/events';
import { legacyItems as localLegacyEvents } from '../data/legacy';
import ArchiveModal from '../components/ui/ArchiveModal';

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'legacy' | 'whitelist'
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Data States
  const [events, setEvents] = useState([]);
  const [legacyEvents, setLegacyEvents] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
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
    whitelistEmail: '' // only used for whitelist tab
  });

  // Track session
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session, activeTab]);

  async function fetchData() {
    setDataLoading(true);
    setStatusMessage(null);
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

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // Sync Initial Static Data to Supabase
  async function syncInitialData() {
    if (!window.confirm('This will copy all events from local files to Supabase. Continue?')) return;
    setSyncLoading(true);
    setStatusMessage(null);

    try {
      let eventCount = 0;
      let legacyCount = 0;

      // 1. Sync regular events (map local schema correctly)
      const mappedEvents = localEvents.map(e => ({
        img: e.img,
        title: e.title,
        subtitle: e.subtitle || '',
        date: e.date,
        synopsis: e.synopsis || '',
        winner: e.winner || '',
        location: e.location || '',
        height: e.height || 400,
        col_span: e.colSpan || 1
      }));

      if (mappedEvents.length > 0) {
        const { error } = await supabase.from('events').insert(mappedEvents);
        if (error) throw error;
        eventCount = mappedEvents.length;
      }

      // 2. Sync legacy events (map local schema correctly)
      const mappedLegacy = localLegacyEvents.map(e => ({
        img: e.img,
        title: e.title,
        subtitle: e.subtitle || '',
        date: e.date,
        synopsis: e.synopsis || '',
        winner: e.winner || '',
        location: e.location || '',
        height: e.height || 400,
        col_span: e.colSpan || 1
      }));

      if (mappedLegacy.length > 0) {
        const { error } = await supabase.from('legacy_events').insert(mappedLegacy);
        if (error) throw error;
        legacyCount = mappedLegacy.length;
      }

      setStatusMessage({
        type: 'success',
        text: `Successfully synced ${eventCount} events and ${legacyCount} legacy events to Supabase.`
      });
      fetchData();
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Synchronization failed.' });
    } finally {
      setSyncLoading(false);
    }
  }

  // Open Add/Edit Modal
  function openAddModal() {
    if (activeTab === 'whitelist') {
      setEditingItem(null);
      setFormData({
        whitelistEmail: ''
      });
      setShowModal(true);
    } else {
      setEditingItem({
        title: 'New Event Title',
        subtitle: 'Add a subtitle here...',
        date: 'Jun 4, 2026',
        location: 'The Main Hall',
        winner: 'House of Logic',
        runner_up: 'Coalition for Transparency',
        event_series: 'The Disruption Series',
        attendance: '450 Guests',
        speaker_count: '14',
        duration: '120 Min',
        participants: '14',
        rounds: '3',
        judges: 'Panel of 5',
        img: 'https://picsum.photos/id/1025/800/1100?grayscale',
        synopsis: 'Add a detailed description here...',
        winning_argument: 'Add the winning argument pull-quote...',
        height: 500,
        col_span: 2,
        themes: ['Debate', 'Governance'],
        gallery: ['https://picsum.photos/id/1025/400/300?grayscale', 'https://picsum.photos/id/1035/400/300?grayscale']
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
    } else {
      setShowModal(true);
    }
  }

  // Handle Form Submission
  async function handleSubmit(e) {
    e.preventDefault();
    setStatusMessage(null);
    const table = activeTab === 'events' ? 'events' : activeTab === 'legacy' ? 'legacy_events' : 'allowed_admins';

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
      }
      setStatusMessage({
        type: 'success',
        text: editingItem ? 'Whitelist updated successfully.' : 'Email added to whitelist.'
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Operation failed. Verify RLS permissions.' });
    }
  }

  // Handle live visual editor save
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
        gallery: updatedItem.gallery
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
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Operation failed. Verify RLS permissions.' });
    }
  }

  // Delete Item
  async function handleDelete(id, titleOrEmail) {
    if (!window.confirm(`Are you sure you want to delete "${titleOrEmail}"?`)) return;
    setStatusMessage(null);
    const table = activeTab === 'events' ? 'events' : activeTab === 'legacy' ? 'legacy_events' : 'allowed_admins';

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStatusMessage({ type: 'success', text: 'Item deleted successfully.' });
      fetchData();
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

  // Render NOT configured screen
  if (!isSupabaseConfigured) {
    return (
      <PageLayout includeGrainient={true} hideFooter={true}>
        <main className="flex-grow">
          <SectionWrapper className="px-[clamp(1.5rem,7vw,10rem)] py-16 md:py-24 max-w-4xl mx-auto">
            <div className="bg-black/40 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-md">
              <span className="font-label-caps text-primary tracking-[0.2em] text-[12px] block mb-4">CONFIG REQUIRED</span>
              <h1 className="font-display-xl-mobile text-white uppercase tracking-tighter mb-6">SUPABASE NOT CONFIGURED</h1>
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
        color1:"#18241F",
color2:"#2A4035",
color3:"#8AA18C",
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
                <h1 className="font-display-xl-mobile text-[3rem] text-white uppercase tracking-tighter leading-none">ADMIN PANEL</h1>
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
                  className="max-w-md mx-auto"
                >
                  <div className="bg-[#0A0A0A]/80 border border-white/5 rounded-[2rem] p-8 md:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    
                    <h3 className="font-display-xl-mobile text-[1.8rem] text-white uppercase tracking-tight text-center mb-6">STAFF ACCESS</h3>
                    
                    <form onSubmit={handleAuth} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Registered Email</label>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@orator-society.org"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
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
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                          required
                        />
                      </div>

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
                        className="w-full bg-primary text-black font-label-caps uppercase text-[11px] tracking-wider py-4 rounded-xl font-bold hover:bg-white transition-colors disabled:opacity-50 mt-2"
                      >
                        {authLoading ? 'Verifying...' : 'Log In'}
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
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-6">
                    {/* Tab Navigation */}
                    <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-full backdrop-blur-md relative">
                      <button
                        onClick={() => { setActiveTab('events'); setStatusMessage(null); }}
                        className={`relative px-5 py-2.5 rounded-full text-[11px] font-label-caps uppercase tracking-wider transition-all z-10 ${
                          activeTab === 'events' ? 'text-black font-semibold' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Active Events
                        {activeTab === 'events' && (
                          <motion.div
                            layoutId="activeTabPill"
                            className="absolute inset-0 bg-primary rounded-full -z-10"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => { setActiveTab('legacy'); setStatusMessage(null); }}
                        className={`relative px-5 py-2.5 rounded-full text-[11px] font-label-caps uppercase tracking-wider transition-all z-10 ${
                          activeTab === 'legacy' ? 'text-black font-semibold' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Legacy Events
                        {activeTab === 'legacy' && (
                          <motion.div
                            layoutId="activeTabPill"
                            className="absolute inset-0 bg-primary rounded-full -z-10"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => { setActiveTab('whitelist'); setStatusMessage(null); }}
                        className={`relative px-5 py-2.5 rounded-full text-[11px] font-label-caps uppercase tracking-wider transition-all z-10 ${
                          activeTab === 'whitelist' ? 'text-black font-semibold' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Admin Whitelist
                        {activeTab === 'whitelist' && (
                          <motion.div
                            layoutId="activeTabPill"
                            className="absolute inset-0 bg-primary rounded-full -z-10"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={syncInitialData}
                        disabled={syncLoading}
                        className="px-6 py-3 rounded-full text-[10px] font-label-caps uppercase tracking-wider border border-white/10 hover:bg-white/[0.05] transition-all disabled:opacity-50 text-white"
                      >
                        {syncLoading ? 'Syncing...' : 'Sync Local Files'}
                      </button>
                      <button
                        onClick={openAddModal}
                        className="px-6 py-3 rounded-full text-[10px] font-label-caps uppercase tracking-wider bg-primary text-black font-bold hover:bg-white transition-all shadow-lg hover:shadow-primary/10"
                      >
                        {activeTab === 'whitelist' ? '+ Whitelist Email' : `+ Add ${activeTab === 'events' ? 'Event' : 'Legacy'}`}
                      </button>
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
                                        onClick={() => handleDelete(item.id, item.email)}
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
                              <th className="p-5 font-label-caps text-[10px] tracking-wider text-white/55 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(activeTab === 'events' ? events : legacyEvents).length === 0 ? (
                              <tr>
                                <td colSpan="5" className="p-8 text-center text-white/40 font-mono text-[14px]">No records found in this table. Click "Sync Local Files" to initialize.</td>
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
                                    <span className="text-white text-[15px] font-semibold block">{item.title}</span>
                                    <span className="text-white/45 text-[12px] block line-clamp-1 mt-0.5">{item.subtitle || item.synopsis}</span>
                                  </td>
                                  <td className="p-5">
                                    <span className="text-white text-[13px] block">{item.date}</span>
                                    <span className="text-white/45 text-[12px] block">{item.location}</span>
                                  </td>
                                  <td className="p-5">
                                    <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-label-caps uppercase px-2.5 py-1 rounded-full inline-block">
                                      {item.winner || 'N/A'}
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
                                        onClick={() => handleDelete(item.id, item.title)}
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </SectionWrapper>
      </main>

      {/* ── DIALOG / MODAL FORM (Whitelist Only) ── */}
      <AnimatePresence>
        {showModal && activeTab === 'whitelist' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#090909] border border-white/10 rounded-[2rem] shadow-2xl p-8 z-10"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display-xl-mobile text-[1.5rem] text-white uppercase tracking-tight">
                  {editingItem ? 'Edit Whitelist' : 'Whitelist Admin'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Admin Email Address</label>
                  <input 
                    type="email" 
                    value={formData.whitelistEmail}
                    onChange={(e) => setFormData({ whitelistEmail: e.target.value })}
                    placeholder="admin@orator-society.org"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                    required
                  />
                </div>

                <div className="flex gap-4 mt-2">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-white/10 text-white font-label-caps uppercase text-[10px] tracking-wider py-3.5 rounded-xl hover:bg-white/[0.02] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-primary text-black font-label-caps uppercase text-[10px] tracking-wider py-3.5 rounded-xl font-bold hover:bg-white transition-colors"
                  >
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
        isOpen={showModal && activeTab !== 'whitelist'} 
        onClose={() => setShowModal(false)} 
        item={editingItem} 
        isAdminEdit={true} 
        onSave={handleLiveSave} 
      />
    </PageLayout>
  );
}
