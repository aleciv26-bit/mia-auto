import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Car, Plus, Wrench, Calendar, Gauge, CheckCircle2, AlertTriangle,
  AlertCircle, Clock, ChevronDown, ChevronUp, History, ShieldCheck,
  Sparkles, Fuel, Zap, Flame, Filter, Search, Trash2, Edit3,
  Info, Euro, Check, X, Settings, Cloud, CloudOff, LogOut, Mail, Lock, UserPlus, LogIn
} from 'lucide-react';

// --- CONFIGURAZIONE SUPABASE ---
const SUPABASE_URL = 'https://nqcdhqsfmqxcgspqtvtn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dDSQPtH2UQb09p3YsxMmBg_Ze4ZOT9d';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- CATALOGO INTERVENTI DI MANUTENZIONE ---
const MAINTENANCE_CATALOG = [
  {
    id: 'bollo',
    category: 'Burocrazia & Tasse',
    type: 'Obbligatorio',
    title: 'Bollo Auto (Tassa Automobilistica)',
    freqMonths: 12,
    freqKm: null,
    summary: 'Tassa annuale regionale obbligatoria sul possesso del veicolo.',
    details: 'Va pagata ogni anno entro l’ultimo giorno del mese successivo a quello di scadenza tramite PagoPA, ACI, tabaccherie o app bancarie. Il ritardo comporta sanzioni e interessi progressivi.',
    fuels: ['all']
  },
  {
    id: 'assicurazione',
    category: 'Burocrazia & Tasse',
    type: 'Obbligatorio',
    title: 'Assicurazione RCA',
    freqMonths: 12,
    freqKm: null,
    summary: 'Polizza obbligatoria di Responsabilità Civile Auto per circolare.',
    details: 'Copre i danni causati a terzi. La legge prevede una tolleranza di 15 giorni dopo la scadenza annuale, dopodiché la circolazione comporta multa salata e sequestro del veicolo.',
    fuels: ['all']
  },
  {
    id: 'revisione',
    category: 'Burocrazia & Tasse',
    type: 'Obbligatorio',
    title: 'Revisione Ministeriale',
    freqMonths: 24,
    freqKm: null,
    summary: 'Controllo tecnico obbligatorio su sicurezza, freni, luci ed emissioni.',
    details: 'La prima revisione va effettuata 4 anni dopo la prima immatricolazione; le successive ogni 2 anni entro il mese in cui è stata eseguita la precedente.',
    fuels: ['all']
  },
  {
    id: 'patente',
    category: 'Burocrazia & Tasse',
    type: 'Obbligatorio',
    title: 'Rinnovo Patente di Guida',
    freqMonths: 120,
    freqKm: null,
    summary: 'Visita medica per confermare l’idoneità psicofisica alla guida.',
    details: 'Va rinnovata ogni 10 anni fino ai 50 anni di età, ogni 5 anni tra i 50 e i 70 anni, ogni 3 anni tra i 70 e gli 80 e ogni 2 anni oltre gli 80.',
    fuels: ['all']
  },
  {
    id: 'olio_motore',
    category: 'Motore & Tagliando',
    type: 'Consigliato',
    title: 'Cambio Olio Motore e Filtro Olio',
    freqMonths: 12,
    freqKm: 15000,
    summary: 'Sostituzione lubrificante motore e relativo filtro per evitare usura.',
    details: 'L’olio motore lubrifica, raffredda e pulisce gli organi interni. Con il tempo e i chilometri perde viscosità. Si sostituisce sempre insieme al filtro olio seguendo le specifiche del costruttore.',
    fuels: ['benzina', 'diesel', 'ibrida', 'gpl']
  },
  {
    id: 'filtro_aria',
    category: 'Motore & Tagliando',
    type: 'Consigliato',
    title: 'Sostituzione Filtro Aria Motore',
    freqMonths: 12,
    freqKm: 20000,
    summary: 'Trattiene polvere e impurità prima che entrino nella camera di combustione.',
    details: 'Un filtro aria intasato riduce l’afflusso di ossigeno al motore, aumentando i consumi di carburante e calando le prestazioni.',
    fuels: ['benzina', 'diesel', 'ibrida', 'gpl']
  },
  {
    id: 'filtro_abitacolo',
    category: 'Motore & Tagliando',
    type: 'Consigliato',
    title: 'Sostituzione Filtro Abitacolo (Antipolline)',
    freqMonths: 12,
    freqKm: 15000,
    summary: 'Filtra pollini, polveri sottili e cattivi odori nell’impianto di aerazione.',
    details: 'Migliora la qualità dell’aria respirata a bordo e previene l’appannamento dei vetri e l’affaticamento della ventola del climatizzatore.',
    fuels: ['all']
  },
  {
    id: 'filtro_carburante',
    category: 'Motore & Tagliando',
    type: 'Consigliato',
    title: 'Sostituzione Filtro Carburante',
    freqMonths: 24,
    freqKm: 40000,
    summary: 'Protegge iniettori e pompa da impurità e residui presenti nel serbatoio.',
    details: 'Particolarmente importante sui motori Diesel (dove separa anche eventuale acqua dal gasolio) per evitare costosi danni agli iniettori ad alta pressione.',
    fuels: ['benzina', 'diesel', 'ibrida', 'gpl']
  },
  {
    id: 'candele',
    category: 'Motore & Tagliando',
    type: 'Consigliato',
    title: 'Sostituzione Candele di Accensione',
    freqMonths: 36,
    freqKm: 60000,
    summary: 'Generano la scintilla per l’accensione della miscela aria-carburante.',
    details: 'Candele usurate causano avviamenti difficoltosi, strattoni in accelerazione, aumento dei consumi e possibili mancate accensioni.',
    fuels: ['benzina', 'ibrida', 'gpl']
  },
  {
    id: 'distribuzione',
    category: 'Motore & Tagliando',
    type: 'Consigliato',
    title: 'Kit Distribuzione + Pompa Acqua',
    freqMonths: 60,
    freqKm: 100000,
    summary: 'Sostituzione cinghia/catena distribuzione, tendicinghia e pompa acqua.',
    details: 'Intervento vitale: sincronizza alberi a camme e albero motore. La rottura della cinghia provoca danni gravissimi a valvole e pistoni.',
    fuels: ['benzina', 'diesel', 'ibrida', 'gpl']
  },
  {
    id: 'cinghia_servizi',
    category: 'Motore & Tagliando',
    type: 'Consigliato',
    title: 'Cinghia Servizi (Alternatore / Clima)',
    freqMonths: 48,
    freqKm: 80000,
    summary: 'Trasmette il moto all’alternatore, al compressore clima e alla pompa.',
    details: 'Se screpolata o rumorosa (fischio all’avvio) va sostituita per non rimanere senza ricarica batteria o servosterzo.',
    fuels: ['benzina', 'diesel', 'ibrida', 'gpl']
  },
  {
    id: 'filtro_gpl',
    category: 'Impianto GPL / Metano',
    type: 'Consigliato',
    title: 'Sostituzione Filtri GPL (Fase Gassosa e Liquida)',
    freqMonths: 12,
    freqKm: 20000,
    summary: 'Trattiene le impurità oleose presenti nel GPL prima degli iniettori.',
    details: 'Evita l’intasamento degli iniettori GPL e il passaggio involontario a benzina durante la marcia.',
    fuels: ['gpl']
  },
  {
    id: 'bombola_gpl',
    category: 'Impianto GPL / Metano',
    type: 'Obbligatorio',
    title: 'Sostituzione / Collaudo Bombola GPL o Metano',
    freqMonths: 120,
    freqKm: null,
    summary: 'Sostituzione serbatoio GPL ogni 10 anni (o collaudo bombole metano ogni 4 anni).',
    details: 'Obbligatorio per legge per poter superare la revisione periodica e circolare in sicurezza.',
    fuels: ['gpl']
  },
  {
    id: 'check_batteria_hv',
    category: 'Sistema Ibrido / Elettrico',
    type: 'Consigliato',
    title: 'Diagnostica Batteria Alta Tensione e Sistema Raffreddamento',
    freqMonths: 12,
    freqKm: 15000,
    summary: 'Controllo stato di salute (SOH) celle batterie e pulizia ventole raffreddamento.',
    details: 'Assicura la massima efficienza di rigenerazione e spesso estende la garanzia ufficiale della casa madre sul pacco batterie.',
    fuels: ['ibrida', 'elettrica']
  },
  {
    id: 'olio_riduttore',
    category: 'Sistema Ibrido / Elettrico',
    type: 'Consigliato',
    title: 'Sostituzione Olio Riduttore / Trasmissione Elettrica',
    freqMonths: 48,
    freqKm: 80000,
    summary: 'Cambio lubrificante degli ingranaggi del gruppo propulsore elettrico.',
    details: 'Mantiene silenziosa ed efficiente la trasmissione diretta del motore elettrico riducendo gli attriti interni.',
    fuels: ['elettrica']
  },
  {
    id: 'gomme_estive',
    category: 'Pneumatici',
    type: 'Obbligatorio',
    title: 'Cambio Gomme Invernali -> Estive',
    freqMonths: 12,
    freqKm: null,
    summary: 'Montaggio treno estivo entro il 15 Maggio (obbligo dal 15 Aprile).',
    details: 'Se gli pneumatici invernali hanno un codice di velocità inferiore a quello riportato sul libretto, è obbligatorio per legge sostituirli entro il 15 maggio.',
    fuels: ['all']
  },
  {
    id: 'gomme_invernali',
    category: 'Pneumatici',
    type: 'Obbligatorio',
    title: 'Cambio Gomme Estive -> Invernali (o Catene a bordo)',
    freqMonths: 12,
    freqKm: null,
    summary: 'Dotazioni invernali obbligatorie dal 15 Novembre al 15 Aprile.',
    details: 'Migliora aderenza e spazi di frenata sotto i 7°C, su bagnato, neve o ghiaccio. Salvo montaggio di gomme 4 stagioni omologate (M+S / 3PMSF).',
    fuels: ['all']
  },
  {
    id: 'inversione_gomme',
    category: 'Pneumatici',
    type: 'Consigliato',
    title: 'Inversione Gomme + Equilibratura',
    freqMonths: 12,
    freqKm: 10000,
    summary: 'Spostamento ruote tra asse anteriore e posteriore per consumo uniforme.',
    details: 'Allunga la vita utile dell’intero treno di gomme ed elimina eventuali vibrazioni al volante alle alte velocità.',
    fuels: ['all']
  },
  {
    id: 'convergenza',
    category: 'Pneumatici',
    type: 'Opzionale',
    title: 'Controllo Convergenza e Assetto Ruote',
    freqMonths: 24,
    freqKm: 30000,
    summary: 'Regolazione degli angoli caratteristici delle ruote.',
    details: 'Consigliata dopo aver preso buche profonde, urti contro marciapiedi o se si nota un consumo anomalo sui bordi dello pneumatico.',
    fuels: ['all']
  },
  {
    id: 'pastiglie_ant',
    category: 'Freni & Sicurezza',
    type: 'Consigliato',
    title: 'Controllo / Cambio Pastiglie Freni Anteriori',
    freqMonths: 24,
    freqKm: 35000,
    summary: 'Verifica spessore materiale d’attrito sull’asse anteriore.',
    details: 'I freni anteriori sopportano circa il 70% della forza frenante. Sostituirle in tempo evita di rigare i dischi freno.',
    fuels: ['all']
  },
  {
    id: 'pastiglie_post',
    category: 'Freni & Sicurezza',
    type: 'Consigliato',
    title: 'Controllo / Cambio Pastiglie Freni Posteriori',
    freqMonths: 36,
    freqKm: 55000,
    summary: 'Verifica spessore pastiglie o ganasce sull’asse posteriore.',
    details: 'Si usurano più lentamente rispetto alle anteriori (ancora meno su auto ibride ed elettriche grazie alla frenata rigenerativa).',
    fuels: ['all']
  },
  {
    id: 'liquido_freni',
    category: 'Freni & Sicurezza',
    type: 'Consigliato',
    title: 'Sostituzione Liquido Freni (DOT 4)',
    freqMonths: 24,
    freqKm: 40000,
    summary: 'Spurgo e ricambio completo del fluido idraulico dell’impianto frenante.',
    details: 'Il liquido freni è igroscopico (assorbe umidità dall’aria): col tempo abbassa il punto di ebollizione e riduce l’efficacia della frenata.',
    fuels: ['all']
  },
  {
    id: 'batteria_12v',
    category: 'Batteria, Clima & Liquidi',
    type: 'Consigliato',
    title: 'Test / Sostituzione Batteria 12V',
    freqMonths: 48,
    freqKm: null,
    summary: 'Verifica stato di carica e spunto della batteria servizi (12V).',
    details: 'La durata media è di 4-5 anni. Un calo di tensione improvviso può lasciare l’auto in panne senza preavviso, soprattutto in inverno.',
    fuels: ['all']
  },
  {
    id: 'liquido_radiatore',
    category: 'Batteria, Clima & Liquidi',
    type: 'Consigliato',
    title: 'Sostituzione Liquido Refrigerante',
    freqMonths: 36,
    freqKm: 60000,
    summary: 'Ricambio liquido antigelo e anticorrosione del circuito di raffreddamento.',
    details: 'Protegge il motore dal surriscaldamento estivo, dal gelo invernale e previene la corrosione interna di radiatore e pompa acqua.',
    fuels: ['benzina', 'diesel', 'ibrida', 'gpl']
  },
  {
    id: 'ricarica_clima',
    category: 'Batteria, Clima & Liquidi',
    type: 'Opzionale',
    title: 'Ricarica Gas Climatizzatore + Igienizzazione',
    freqMonths: 24,
    freqKm: null,
    summary: 'Ripristino pressione gas refrigerante e sanificazione condotti aria.',
    details: 'Mantiene efficiente il raffreddamento dell’abitacolo ed elimina muffe e batteri responsabili dei cattivi odori.',
    fuels: ['all']
  },
  {
    id: 'tergicristalli',
    category: 'Opzionali & Cura Auto',
    type: 'Opzionale',
    title: 'Sostituzione Spazzole Tergicristallo',
    freqMonths: 12,
    freqKm: null,
    summary: 'Cambio spazzole anteriori e lunotto posteriore per visibilità ottimale.',
    details: 'Il sole estivo e il gelo induriscono la gomma creando striature sul parabrezza durante la pioggia.',
    fuels: ['all']
  },
  {
    id: 'kit_emergenza',
    category: 'Opzionali & Cura Auto',
    type: 'Opzionale',
    title: 'Controllo Kit Emergenza e Pressione Ruota Scorta',
    freqMonths: 12,
    freqKm: null,
    summary: 'Verifica scadenza kit gonfiaggio, pressione ruotino, giubbotto e triangolo.',
    details: 'Controllo rapido fai-da-te per evitare di trovare il ruotino sgonfio o il sigillante scaduto in caso di foratura.',
    fuels: ['all']
  },
  {
    id: 'lavaggio_cura',
    category: 'Opzionali & Cura Auto',
    type: 'Opzionale',
    title: 'Lavaggio Completo, Decontaminazione e Cura Interni',
    freqMonths: 6,
    freqKm: null,
    summary: 'Pulizia approfondita carrozzeria, sottoscocca, guarnizioni e tessuti/pelle.',
    details: 'Preserva la vernice da salsedine, resine ed escrementi e mantiene morbide le guarnizioni delle portiere.',
    fuels: ['all']
  }
];

// --- FUNZIONI DI UTILITÀ ---
function addMonthsToDate(dateStr, months) {
  if (!dateStr || !months) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const targetMonth = date.getMonth() + Number(months);
  date.setMonth(targetMonth);
  if (date.getDate() !== d) {
    date.setDate(0);
  }
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getDaysDiff(targetDateStr) {
  if (!targetDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function formatDateIT(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatNumber(num) {
  if (num === null || num === undefined || num === '') return '—';
  return Number(num).toLocaleString('it-IT');
}

function getTodayStr() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function computeItemStatus(item, record, currentKm) {
  if (!record || (!record.lastDate && (record.lastKm === null || record.lastKm === undefined || record.lastKm === ''))) {
    return {
      code: 'unregistered',
      label: 'Da registrare',
      nextDate: null,
      daysLeft: null,
      nextKm: null,
      kmLeft: null,
      reason: 'Nessun intervento registrato'
    };
  }

  const nextDate = record.lastDate && item.freqMonths ? addMonthsToDate(record.lastDate, item.freqMonths) : null;
  const daysLeft = nextDate ? getDaysDiff(nextDate) : null;
  const hasLastKm = record.lastKm !== null && record.lastKm !== undefined && record.lastKm !== '';
  const nextKm = hasLastKm && item.freqKm ? Number(record.lastKm) + Number(item.freqKm) : null;
  const kmLeft = nextKm !== null && currentKm !== null ? nextKm - Number(currentKm) : null;

  const isDateExpired = daysLeft !== null && daysLeft < 0;
  const isKmExpired = kmLeft !== null && kmLeft <= 0;

  if (isDateExpired || isKmExpired) {
    let reason = '';
    if (isDateExpired && isKmExpired) {
      reason = `Scaduto da ${Math.abs(daysLeft)} gg e superato di ${formatNumber(Math.abs(kmLeft))} km`;
    } else if (isDateExpired) {
      reason = `Scaduto da ${Math.abs(daysLeft)} giorni`;
    } else {
      reason = `Superato di ${formatNumber(Math.abs(kmLeft))} km`;
    }
    return { code: 'expired', label: 'Scaduto', nextDate, daysLeft, nextKm, kmLeft, reason };
  }

  const isDateSoon = daysLeft !== null && daysLeft <= 30;
  const isKmSoon = kmLeft !== null && kmLeft <= 1500;

  if (isDateSoon || isKmSoon) {
    let reason = '';
    if (isDateSoon && isKmSoon) {
      reason = `Mancano ${daysLeft} gg e ${formatNumber(kmLeft)} km`;
    } else if (isDateSoon) {
      reason = daysLeft === 0 ? 'Scade oggi!' : `Mancano ${daysLeft} giorni`;
    } else {
      reason = `Mancano ${formatNumber(kmLeft)} km`;
    }
    return { code: 'soon', label: 'In scadenza', nextDate, daysLeft, nextKm, kmLeft, reason };
  }

  let reason = 'In regola';
  if (daysLeft !== null && kmLeft !== null) {
    reason = `Tra ${daysLeft} gg o ${formatNumber(kmLeft)} km`;
  } else if (daysLeft !== null) {
    reason = `Tra ${daysLeft} giorni`;
  } else if (kmLeft !== null) {
    reason = `Tra ${formatNumber(kmLeft)} km`;
  }

  return { code: 'ok', label: 'In regola', nextDate, daysLeft, nextKm, kmLeft, reason };
}

export default function App() {
  // --- STATO AUTENTICAZIONE ---
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // --- STATO DATI VEICOLI & SINCRONIZZAZIONE ---
  const [vehicles, setVehicles] = useState([]);
  const [activeVehicleId, setActiveVehicleId] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const isInitialCloudLoad = useRef(true);

  // --- STATO UI ---
  const [activeTab, setActiveTab] = useState('interventi');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState({});

  // Modali
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    name: '', plate: '', year: new Date().getFullYear(), fuel: 'benzina', currentKm: 50000
  });

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [logForm, setLogForm] = useState({
    date: getTodayStr(), km: '', cost: '', notes: ''
  });

  const [isCustomTaskModalOpen, setIsCustomTaskModalOpen] = useState(false);
  const [customTaskForm, setCustomTaskForm] = useState({
    title: '', category: 'Opzionali & Cura Auto', type: 'Opzionale',
    freqMonths: 12, freqKm: '', summary: '', details: ''
  });

  const [isKmQuickEdit, setIsKmQuickEdit] = useState(false);
  const [quickKmValue, setQuickKmValue] = useState('');

  // 1. Controlla sessione utente Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setVehicles([]);
        setActiveVehicleId(null);
        isInitialCloudLoad.current = true;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Carica i veicoli dal cloud quando l'utente effettua l'accesso
  useEffect(() => {
    if (!session?.user?.id) return;

    async function fetchUserGarage() {
      setDataLoading(true);
      isInitialCloudLoad.current = true;
      try {
        const { data, error } = await supabase
          .from('user_garage')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const loadedVehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
          setVehicles(loadedVehicles);
          setActiveVehicleId(
            data.active_vehicle_id && loadedVehicles.some(v => v.id === data.active_vehicle_id)
              ? data.active_vehicle_id
              : (loadedVehicles[0]?.id || null)
          );
        } else {
          // Nuovo utente: crea riga vuota sul cloud e apre modale creazione auto
          await supabase.from('user_garage').insert({
            user_id: session.user.id,
            vehicles: [],
            active_vehicle_id: null
          });
          setVehicles([]);
          setActiveVehicleId(null);
          setIsVehicleModalOpen(true);
        }
        setSyncStatus('saved');
      } catch (err) {
        console.error('Errore caricamento cloud:', err);
        setSyncStatus('error');
      } finally {
        setDataLoading(false);
        setTimeout(() => {
          isInitialCloudLoad.current = false;
        }, 300);
      }
    }

    fetchUserGarage();
  }, [session?.user?.id]);

  // 3. Salva automaticamente sul cloud ad ogni modifica
  useEffect(() => {
    if (!session?.user?.id || dataLoading || isInitialCloudLoad.current) return;

    const timer = setTimeout(async () => {
      setSyncStatus('saving');
      try {
        const { error } = await supabase
          .from('user_garage')
          .upsert({
            user_id: session.user.id,
            vehicles,
            active_vehicle_id: activeVehicleId,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        setSyncStatus('saved');
      } catch (err) {
        console.error('Errore salvataggio cloud:', err);
        setSyncStatus('error');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [vehicles, activeVehicleId, session?.user?.id, dataLoading]);

  // Handler Login / Registrazione
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword
        });
        if (error) throw error;
        if (data?.user && !data.session) {
          setAuthError('Account creato! Controlla la tua email per confermare oppure disattiva "Confirm email" su Supabase.');
        }
      }
    } catch (err) {
      setAuthError(
        err.message === 'Invalid login credentials'
          ? 'Email o password non corretti.'
          : err.message
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const activeVehicle = useMemo(
    () => vehicles.find(v => v.id === activeVehicleId) || vehicles[0] || null,
    [vehicles, activeVehicleId]
  );

  // Calcolo interventi per l'auto attiva
  const vehicleTasks = useMemo(() => {
    if (!activeVehicle) return [];
    const baseTasks = MAINTENANCE_CATALOG.filter(
      item => item.fuels.includes('all') || item.fuels.includes(activeVehicle.fuel)
    );
    const allTasks = [...baseTasks, ...(activeVehicle.customTasks || [])];

    return allTasks.map(task => {
      const record = activeVehicle.records?.[task.id] || null;
      const status = computeItemStatus(task, record, activeVehicle.currentKm);
      return { ...task, record, status };
    });
  }, [activeVehicle]);

  const counts = useMemo(() => {
    return vehicleTasks.reduce(
      (acc, t) => {
        acc[t.status.code] = (acc[t.status.code] || 0) + 1;
        return acc;
      },
      { expired: 0, soon: 0, ok: 0, unregistered: 0 }
    );
  }, [vehicleTasks]);

  const categories = useMemo(() => {
    const set = new Set(vehicleTasks.map(t => t.category));
    return ['all', ...Array.from(set)];
  }, [vehicleTasks]);

  const filteredTasks = useMemo(() => {
    const priority = { expired: 0, soon: 1, unregistered: 2, ok: 3 };
    return vehicleTasks
      .filter(task => {
        if (statusFilter !== 'all' && task.status.code !== statusFilter) return false;
        if (typeFilter !== 'all' && task.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchSummary = task.summary.toLowerCase().includes(q);
          const matchCat = task.category.toLowerCase().includes(q);
          if (!matchTitle && !matchSummary && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => priority[a.status.code] - priority[b.status.code]);
  }, [vehicleTasks, statusFilter, typeFilter, categoryFilter, searchQuery]);

  // --- AZIONI VEICOLO ---
  const openNewVehicleModal = () => {
    setEditingVehicle(null);
    setVehicleForm({
      name: '', plate: '', year: new Date().getFullYear(), fuel: 'benzina', currentKm: 0
    });
    setIsVehicleModalOpen(true);
  };

  const openEditVehicleModal = (v) => {
    setEditingVehicle(v);
    setVehicleForm({
      name: v.name, plate: v.plate, year: v.year, fuel: v.fuel, currentKm: v.currentKm
    });
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = (e) => {
    e.preventDefault();
    if (!vehicleForm.name.trim()) return;

    if (editingVehicle) {
      setVehicles(prev =>
        prev.map(v =>
          v.id === editingVehicle.id
            ? { ...v, ...vehicleForm, currentKm: Number(vehicleForm.currentKm) || 0 }
            : v
        )
      );
    } else {
      const newVehicle = {
        id: 'veh_' + Date.now(),
        ...vehicleForm,
        currentKm: Number(vehicleForm.currentKm) || 0,
        records: {},
        history: [],
        customTasks: []
      };
      setVehicles(prev => [...prev, newVehicle]);
      setActiveVehicleId(newVehicle.id);
    }
    setIsVehicleModalOpen(false);
  };

  const handleDeleteVehicle = (id) => {
    if (!window.confirm('Vuoi davvero eliminare questa auto e tutto il suo storico?')) return;
    const remaining = vehicles.filter(v => v.id !== id);
    setVehicles(remaining);
    if (activeVehicleId === id) {
      setActiveVehicleId(remaining[0]?.id || null);
    }
  };

  const handleSaveQuickKm = () => {
    if (!activeVehicle) return;
    const val = Number(quickKmValue);
    if (!isNaN(val) && val >= 0) {
      setVehicles(prev =>
        prev.map(v => (v.id === activeVehicle.id ? { ...v, currentKm: val } : v))
      );
    }
    setIsKmQuickEdit(false);
  };

  // --- AZIONI INTERVENTI ---
  const openLogModal = (task) => {
    setSelectedTask(task);
    setLogForm({
      date: getTodayStr(),
      km: activeVehicle?.currentKm ?? '',
      cost: '',
      notes: ''
    });
    setIsLogModalOpen(true);
  };

  const handleConfirmLog = (e) => {
    e.preventDefault();
    if (!activeVehicle || !selectedTask) return;

    const enteredKm = logForm.km !== '' ? Number(logForm.km) : null;
    const enteredCost = logForm.cost !== '' ? Number(logForm.cost) : null;

    const newRecord = {
      lastDate: logForm.date || null,
      lastKm: enteredKm,
      cost: enteredCost,
      notes: logForm.notes.trim()
    };

    const historyEntry = {
      id: 'hist_' + Date.now(),
      taskId: selectedTask.id,
      taskTitle: selectedTask.title,
      category: selectedTask.category,
      date: logForm.date,
      km: enteredKm,
      cost: enteredCost,
      notes: logForm.notes.trim()
    };

    setVehicles(prev =>
      prev.map(v => {
        if (v.id !== activeVehicle.id) return v;
        const updatedCurrentKm =
          enteredKm !== null && enteredKm > (v.currentKm || 0) ? enteredKm : v.currentKm;
        return {
          ...v,
          currentKm: updatedCurrentKm,
          records: { ...v.records, [selectedTask.id]: newRecord },
          history: [historyEntry, ...(v.history || [])]
        };
      })
    );

    setIsLogModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteHistoryEntry = (entryId) => {
    if (!activeVehicle) return;
    setVehicles(prev =>
      prev.map(v =>
        v.id === activeVehicle.id
          ? { ...v, history: (v.history || []).filter(h => h.id !== entryId) }
          : v
      )
    );
  };

  const handleAddCustomTask = (e) => {
    e.preventDefault();
    if (!activeVehicle || !customTaskForm.title.trim()) return;

    const newTask = {
      id: 'custom_' + Date.now(),
      title: customTaskForm.title.trim(),
      category: customTaskForm.category,
      type: customTaskForm.type,
      freqMonths: customTaskForm.freqMonths ? Number(customTaskForm.freqMonths) : null,
      freqKm: customTaskForm.freqKm ? Number(customTaskForm.freqKm) : null,
      summary: customTaskForm.summary.trim() || 'Intervento personalizzato aggiunto dall’utente.',
      details: customTaskForm.details.trim() || 'Nessun dettaglio aggiuntivo specificato.',
      fuels: ['all'],
      isCustom: true
    };

    setVehicles(prev =>
      prev.map(v =>
        v.id === activeVehicle.id
          ? { ...v, customTasks: [...(v.customTasks || []), newTask] }
          : v
      )
    );

    setCustomTaskForm({
      title: '', category: 'Opzionali & Cura Auto', type: 'Opzionale',
      freqMonths: 12, freqKm: '', summary: '', details: ''
    });
    setIsCustomTaskModalOpen(false);
  };

  const toggleExpand = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fuelBadge = (fuel) => {
    switch (fuel) {
      case 'elettrica':
        return { label: 'Elettrica', icon: <Zap className="w-3.5 h-3.5" />, cls: 'bg-emerald-100 text-emerald-800' };
      case 'ibrida':
        return { label: 'Ibrida', icon: <Sparkles className="w-3.5 h-3.5" />, cls: 'bg-teal-100 text-teal-800' };
      case 'gpl':
        return { label: 'GPL / Metano', icon: <Flame className="w-3.5 h-3.5" />, cls: 'bg-sky-100 text-sky-800' };
      case 'diesel':
        return { label: 'Diesel', icon: <Fuel className="w-3.5 h-3.5" />, cls: 'bg-slate-200 text-slate-800' };
      default:
        return { label: 'Benzina', icon: <Fuel className="w-3.5 h-3.5" />, cls: 'bg-indigo-100 text-indigo-800' };
    }
  };

  const totalSpent = useMemo(() => {
    if (!activeVehicle?.history) return 0;
    return activeVehicle.history.reduce((sum, h) => sum + (Number(h.cost) || 0), 0);
  }, [activeVehicle]);

  // --- SCHERMATA CARICAMENTO INIZIALE ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Car className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-600">Caricamento garage...</p>
        </div>
      </div>
    );
  }

  // --- SCHERMATA LOGIN / REGISTRAZIONE ---
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
          <div className="bg-slate-900 px-6 py-7 text-center text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
              <Car className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">Scadenziario Auto Cloud</h1>
            <p className="text-xs text-slate-300 mt-1">
              Accedi per sincronizzare le tue auto tra PC e smartphone
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`py-2 text-sm font-semibold rounded-lg transition ${
                  authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Accedi
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                className={`py-2 text-sm font-semibold rounded-lg transition ${
                  authMode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Registrati
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="tuamail@esempio.it"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimo 6 caratteri"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                {authMode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    {authSubmitting ? 'Accesso in corso...' : 'Entra nel Garage'}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {authSubmitting ? 'Creazione account...' : 'Crea Account Gratuito'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* HEADER SUPERIORE */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  Scadenziario Auto
                </h1>
                {/* INDICATORE STATO CLOUD */}
                {syncStatus === 'saving' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    <Cloud className="w-3 h-3 animate-bounce" /> Salvataggio...
                  </span>
                )}
                {syncStatus === 'saved' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Cloud className="w-3 h-3" /> Sincronizzato
                  </span>
                )}
                {syncStatus === 'error' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
                    <CloudOff className="w-3 h-3" /> Errore sync
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {session.user.email}
              </p>
            </div>
          </div>

          {/* SELETTORE VEICOLO + NUOVA AUTO + ESCI */}
          <div className="flex items-center gap-2 flex-wrap">
            {vehicles.length > 0 && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                {vehicles.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setActiveVehicleId(v.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                      activeVehicle?.id === v.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={openNewVehicleModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuova Auto</span>
            </button>

            <button
              onClick={handleLogout}
              title="Esci dall'account"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {dataLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Cloud className="w-10 h-10 text-slate-400 mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-medium text-slate-600">Scaricamento dati dal cloud...</p>
          </div>
        ) : !activeVehicle ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4">
              <Car className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Nessuna auto configurata</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
              Crea il profilo della tua auto per visualizzare subito tutti gli interventi consigliati e obblighi di legge sincronizzati su tutti i tuoi dispositivi.
            </p>
            <button
              onClick={openNewVehicleModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Aggiungi la tua prima auto
            </button>
          </div>
        ) : (
          <>
            {/* SCHEDA RIEPILOGO VEICOLO ATTIVO */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-2xl font-bold text-slate-900">{activeVehicle.name}</h2>
                    {activeVehicle.plate && (
                      <span className="px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase bg-slate-100 border border-slate-300 rounded-md text-slate-700">
                        {activeVehicle.plate}
                      </span>
                    )}
                    {(() => {
                      const fb = fuelBadge(activeVehicle.fuel);
                      return (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${fb.cls}`}>
                          {fb.icon}
                          {fb.label}
                        </span>
                      );
                    })()}
                    {activeVehicle.year && (
                      <span className="text-xs text-slate-500 font-medium">
                        Anno {activeVehicle.year}
                      </span>
                    )}
                  </div>

                  {/* CHILOMETRAGGIO ATTUALE MODIFICABILE RAPIDAMENTE */}
                  <div className="flex items-center gap-2 pt-1">
                    <Gauge className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Chilometraggio attuale:</span>
                    {isKmQuickEdit ? (
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          value={quickKmValue}
                          onChange={(e) => setQuickKmValue(e.target.value)}
                          className="w-28 px-2.5 py-1 text-sm font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveQuickKm}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                          title="Salva Km"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setIsKmQuickEdit(false)}
                          className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                          title="Annulla"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setQuickKmValue(activeVehicle.currentKm);
                          setIsKmQuickEdit(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-900 transition cursor-pointer"
                        title="Clicca per aggiornare i km attuali"
                      >
                        <span>{formatNumber(activeVehicle.currentKm)} km</span>
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* AZIONI VEICOLO */}
                <div className="flex items-center gap-2 self-start md:self-center">
                  <button
                    onClick={() => openEditVehicleModal(activeVehicle)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Modifica Auto
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(activeVehicle.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 transition cursor-pointer"
                    title="Elimina veicolo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CONTATORI SCADENZE (CLICCABILI COME FILTRO RAPIDO) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
                <button
                  onClick={() => { setActiveTab('interventi'); setStatusFilter(statusFilter === 'expired' ? 'all' : 'expired'); }}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    counts.expired > 0
                      ? 'bg-red-50/80 border-red-200 hover:bg-red-100/70'
                      : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100'
                  } ${statusFilter === 'expired' ? 'ring-2 ring-red-500' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${counts.expired > 0 ? 'text-red-700' : 'text-slate-500'}`}>
                      Scaduti
                    </span>
                    <AlertCircle className={`w-4 h-4 ${counts.expired > 0 ? 'text-red-600' : 'text-slate-400'}`} />
                  </div>
                  <div className={`text-2xl font-extrabold ${counts.expired > 0 ? 'text-red-700' : 'text-slate-800'}`}>
                    {counts.expired}
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('interventi'); setStatusFilter(statusFilter === 'soon' ? 'all' : 'soon'); }}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    counts.soon > 0
                      ? 'bg-amber-50/90 border-amber-200 hover:bg-amber-100/70'
                      : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100'
                  } ${statusFilter === 'soon' ? 'ring-2 ring-amber-500' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${counts.soon > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
                      In Scadenza
                    </span>
                    <AlertTriangle className={`w-4 h-4 ${counts.soon > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                  </div>
                  <div className={`text-2xl font-extrabold ${counts.soon > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
                    {counts.soon}
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('interventi'); setStatusFilter(statusFilter === 'ok' ? 'all' : 'ok'); }}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer bg-emerald-50/60 border-emerald-200/80 hover:bg-emerald-100/60 ${
                    statusFilter === 'ok' ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      In Regola
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-700">{counts.ok}</div>
                </button>

                <button
                  onClick={() => { setActiveTab('interventi'); setStatusFilter(statusFilter === 'unregistered' ? 'all' : 'unregistered'); }}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer bg-slate-50 border-slate-200/80 hover:bg-slate-100 ${
                    statusFilter === 'unregistered' ? 'ring-2 ring-slate-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Da Inserire
                    </span>
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-700">{counts.unregistered}</div>
                </button>
              </div>
            </section>

            {/* BANNER DI AVVISO URGENTE */}
            {(counts.expired > 0 || counts.soon > 0) && (
              <div className="mb-6 space-y-2.5">
                {counts.expired > 0 && (
                  <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-600 text-white shadow-xs">
                    <div className="flex items-center gap-2.5 text-sm font-medium">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>
                        <strong>Attenzione:</strong> hai <strong>{counts.expired}</strong> {counts.expired === 1 ? 'intervento scaduto' : 'interventi scaduti'} che richiedono attenzione immediata.
                      </span>
                    </div>
                    <button
                      onClick={() => { setActiveTab('interventi'); setStatusFilter('expired'); }}
                      className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold whitespace-nowrap transition cursor-pointer"
                    >
                      Mostra scaduti
                    </button>
                  </div>
                )}
                {counts.soon > 0 && (
                  <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-500 text-slate-950 shadow-xs">
                    <div className="flex items-center gap-2.5 text-sm font-medium">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span>
                        <strong>Promemoria:</strong> {counts.soon === 1 ? 'c’è 1 intervento in scadenza' : `ci sono ${counts.soon} interventi in scadenza`} entro 30 giorni o 1.500 km.
                      </span>
                    </div>
                    <button
                      onClick={() => { setActiveTab('interventi'); setStatusFilter('soon'); }}
                      className="px-3 py-1 rounded-lg bg-slate-950/10 hover:bg-slate-950/20 text-xs font-bold whitespace-nowrap transition cursor-pointer"
                    >
                      Vedi scadenze
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* NAVIGAZIONE SCHEDE: INTERVENTI vs STORICO */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="inline-flex bg-slate-200/70 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('interventi')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'interventi'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Interventi & Scadenze ({vehicleTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('storico')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'storico'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Storico Eseguiti ({activeVehicle.history?.length || 0})
                </button>
              </div>

              {activeTab === 'interventi' && (
                <button
                  onClick={() => setIsCustomTaskModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-800 shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi Voce Personalizzata
                </button>
              )}
            </div>

            {/* CONTENUTO TAB 1: LISTA INTERVENTI */}
            {activeTab === 'interventi' && (
              <>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 mb-5 flex flex-wrap items-center gap-3 shadow-2xs">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cerca intervento (es. bollo, olio, gomme, freni)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="all">Tutti gli stati</option>
                      <option value="expired">🔴 Scaduti ({counts.expired})</option>
                      <option value="soon">🟠 In scadenza ({counts.soon})</option>
                      <option value="ok">🟢 In regola ({counts.ok})</option>
                      <option value="unregistered">⚪ Da registrare ({counts.unregistered})</option>
                    </select>

                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="all">Tutti i tipi</option>
                      <option value="Obbligatorio">Obbligatori (Legge)</option>
                      <option value="Consigliato">Consigliati (Manutenzione)</option>
                      <option value="Opzionale">Opzionali (Cura Auto)</option>
                    </select>

                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat === 'all' ? 'Tutte le categorie' : cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                    <p className="text-slate-500 text-sm">Nessun intervento corrisponde ai filtri selezionati.</p>
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setTypeFilter('all');
                        setCategoryFilter('all');
                        setSearchQuery('');
                      }}
                      className="mt-3 text-sm font-semibold text-slate-900 underline cursor-pointer"
                    >
                      Reimposta filtri
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {filteredTasks.map(task => {
                      const isExpanded = !!expandedCards[task.id];
                      const st = task.status;

                      let cardBorder = 'border-slate-200 bg-white';
                      let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                      if (st.code === 'expired') {
                        cardBorder = 'border-red-300 bg-red-50/40 ring-1 ring-red-200';
                        badgeStyle = 'bg-red-600 text-white border-red-600';
                      } else if (st.code === 'soon') {
                        cardBorder = 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-200';
                        badgeStyle = 'bg-amber-500 text-slate-950 border-amber-500';
                      } else if (st.code === 'ok') {
                        cardBorder = 'border-slate-200 bg-white';
                        badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                      }

                      const typeBadge =
                        task.type === 'Obbligatorio'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : task.type === 'Consigliato'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200';

                      return (
                        <div
                          key={task.id}
                          className={`rounded-2xl border p-4 sm:p-5 transition shadow-2xs ${cardBorder}`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStyle}`}>
                                  {st.label}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${typeBadge}`}>
                                  {task.type}
                                </span>
                                <span className="text-xs font-medium text-slate-500">
                                  {task.category}
                                </span>
                              </div>

                              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                                {task.title}
                              </h3>
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {task.summary}
                              </p>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-600">
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                  Ogni:{' '}
                                  {[
                                    task.freqMonths ? `${task.freqMonths} mesi` : null,
                                    task.freqKm ? `${formatNumber(task.freqKm)} km` : null
                                  ]
                                    .filter(Boolean)
                                    .join(' oppure ')}
                                </span>

                                <button
                                  onClick={() => toggleExpand(task.id)}
                                  className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 font-semibold underline decoration-slate-300 underline-offset-2 cursor-pointer"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                  <span>{isExpanded ? 'Nascondi dettagli' : 'In cosa consiste?'}</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200/70">
                              <div className="grid grid-cols-2 gap-2.5 bg-white/80 border border-slate-200/80 rounded-xl p-2.5 text-xs min-w-[250px]">
                                <div>
                                  <span className="block text-[11px] text-slate-400 font-medium">Ultima volta</span>
                                  {task.record ? (
                                    <div className="font-semibold text-slate-800 mt-0.5">
                                      <div>{formatDateIT(task.record.lastDate)}</div>
                                      {task.record.lastKm !== null && task.record.lastKm !== '' && (
                                        <div className="text-slate-500 font-normal">
                                          a {formatNumber(task.record.lastKm)} km
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic mt-0.5 block">Mai registrato</span>
                                  )}
                                </div>

                                <div className="border-l border-slate-200 pl-2.5">
                                  <span className="block text-[11px] text-slate-400 font-medium">Prossima scadenza</span>
                                  {st.code !== 'unregistered' ? (
                                    <div className="mt-0.5">
                                      {st.nextDate && (
                                        <div
                                          className={`font-bold ${
                                            st.code === 'expired'
                                              ? 'text-red-700'
                                              : st.code === 'soon'
                                              ? 'text-amber-700'
                                              : 'text-slate-900'
                                          }`}
                                        >
                                          {formatDateIT(st.nextDate)}
                                        </div>
                                      )}
                                      {st.nextKm !== null && (
                                        <div className="text-slate-600 font-medium">
                                          {formatNumber(st.nextKm)} km
                                        </div>
                                      )}
                                      <div
                                        className={`text-[11px] font-semibold mt-0.5 ${
                                          st.code === 'expired'
                                            ? 'text-red-600'
                                            : st.code === 'soon'
                                            ? 'text-amber-700'
                                            : 'text-emerald-700'
                                        }`}
                                      >
                                        {st.reason}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic mt-0.5 block">In attesa dati</span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => openLogModal(task)}
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition shadow-2xs whitespace-nowrap cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Segna come Fatto</span>
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-4 pt-3.5 border-t border-slate-200/80 text-sm text-slate-700 bg-slate-50/80 rounded-xl p-3.5">
                              <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-slate-700" />
                                Dettaglio tecnico e consigli:
                              </div>
                              <p className="leading-relaxed text-slate-600">{task.details}</p>
                              {task.record?.notes && (
                                <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                                  <strong>Nota ultimo intervento:</strong> {task.record.notes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* CONTENUTO TAB 2: STORICO INTERVENTI ESEGUITI */}
            {activeTab === 'storico' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Registro Storico Manutenzioni</h3>
                    <p className="text-xs text-slate-500">
                      Cronologia di tutti gli interventi registrati per {activeVehicle.name}
                    </p>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-100 text-sm font-bold text-slate-900">
                    Spesa totale registrata: € {totalSpent.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {!activeVehicle.history || activeVehicle.history.length === 0 ? (
                  <div className="p-10 text-center text-sm text-slate-500">
                    Non hai ancora registrato nessun intervento eseguito. Usa il tasto <strong>"Segna come Fatto"</strong> sugli interventi per popolare lo storico.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                          <th className="py-3 px-4">Data</th>
                          <th className="py-3 px-4">Intervento</th>
                          <th className="py-3 px-4">Chilometri</th>
                          <th className="py-3 px-4">Costo</th>
                          <th className="py-3 px-4">Note</th>
                          <th className="py-3 px-4 text-right">Azioni</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {activeVehicle.history.map(entry => (
                          <tr key={entry.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                              {formatDateIT(entry.date)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">{entry.taskTitle}</div>
                              <div className="text-xs text-slate-500">{entry.category}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                              {entry.km !== null && entry.km !== '' ? `${formatNumber(entry.km)} km` : '—'}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                              {entry.cost !== null && entry.cost !== ''
                                ? `€ ${Number(entry.cost).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </td>
                            <td className="py-3 px-4 text-slate-600 text-xs max-w-xs">
                              {entry.notes || '—'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDeleteHistoryEntry(entry.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Rimuovi voce dallo storico"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODALE 1: CREA / MODIFICA VEICOLO */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingVehicle ? 'Modifica Veicolo' : 'Aggiungi Nuova Auto'}
              </h3>
              <button
                onClick={() => setIsVehicleModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome / Modello Auto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Fiat Panda, Volkswagen Golf..."
                  value={vehicleForm.name}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Targa</label>
                  <input
                    type="text"
                    placeholder="Es. AB123CD"
                    value={vehicleForm.plate}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, plate: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl uppercase focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Anno Immatricolazione</label>
                  <input
                    type="number"
                    min="1960"
                    max="2030"
                    value={vehicleForm.year}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alimentazione</label>
                  <select
                    value={vehicleForm.fuel}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, fuel: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="benzina">Benzina</option>
                    <option value="diesel">Diesel</option>
                    <option value="ibrida">Ibrida</option>
                    <option value="elettrica">Elettrica</option>
                    <option value="gpl">GPL / Metano</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Km Attuali *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={vehicleForm.currentKm}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, currentKm: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                >
                  {editingVehicle ? 'Salva Modifiche' : 'Crea Auto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE 2: SEGNA INTERVENTO COME FATTO */}
      {isLogModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Registra Esecuzione
              </span>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">{selectedTask.title}</h3>
            <p className="text-xs text-slate-500 mb-4">
              Inserisci la data e i chilometri al momento dell’intervento: il conteggio per la prossima scadenza ripartirà da qui.
            </p>

            <form onSubmit={handleConfirmLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Data Intervento *
                    </span>
                  </label>
                  <input
                    type="date"
                    required
                    value={logForm.date}
                    onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    <span className="inline-flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5" /> Km dell'auto
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Es. 85000"
                    value={logForm.km}
                    onChange={(e) => setLogForm({ ...logForm, km: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <span className="inline-flex items-center gap-1">
                    <Euro className="w-3.5 h-3.5" /> Costo (€) — opzionale
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Es. 140.00"
                  value={logForm.cost}
                  onChange={(e) => setLogForm({ ...logForm, cost: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Officina / Note (opzionale)
                </label>
                <input
                  type="text"
                  placeholder="Es. Officina Rossi, olio 5W-30, fattura salvata..."
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Conferma e Aggiorna Scadenza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE 3: AGGIUNGI VOCE PERSONALIZZATA */}
      {isCustomTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Nuovo Intervento Personalizzato</h3>
              <button
                onClick={() => setIsCustomTaskModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Intervento *</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Controllo pressione gomme, Abbonamento Telepass..."
                  value={customTaskForm.title}
                  onChange={(e) => setCustomTaskForm({ ...customTaskForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={customTaskForm.category}
                    onChange={(e) => setCustomTaskForm({ ...customTaskForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Burocrazia & Tasse">Burocrazia & Tasse</option>
                    <option value="Motore & Tagliando">Motore & Tagliando</option>
                    <option value="Pneumatici">Pneumatici</option>
                    <option value="Freni & Sicurezza">Freni & Sicurezza</option>
                    <option value="Batteria, Clima & Liquidi">Batteria, Clima & Liquidi</option>
                    <option value="Opzionali & Cura Auto">Opzionali & Cura Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Importanza</label>
                  <select
                    value={customTaskForm.type}
                    onChange={(e) => setCustomTaskForm({ ...customTaskForm, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Obbligatorio">Obbligatorio</option>
                    <option value="Consigliato">Consigliato</option>
                    <option value="Opzionale">Opzionale</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ogni quanti mesi</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Es. 12"
                    value={customTaskForm.freqMonths}
                    onChange={(e) => setCustomTaskForm({ ...customTaskForm, freqMonths: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ogni quanti km (opz.)</label>
                  <input
                    type="number"
                    min="500"
                    placeholder="Es. 15000"
                    value={customTaskForm.freqKm}
                    onChange={(e) => setCustomTaskForm({ ...customTaskForm, freqKm: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrizione breve</label>
                <input
                  type="text"
                  placeholder="In cosa consiste questo controllo..."
                  value={customTaskForm.summary}
                  onChange={(e) => setCustomTaskForm({ ...customTaskForm, summary: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCustomTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                >
                  Aggiungi Voce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
