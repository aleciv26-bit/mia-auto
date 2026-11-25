import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Car,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Wrench,
  FileText,
  Gauge,
  Calendar,
  ChevronDown,
  ChevronUp,
  History,
  Trash2,
  Edit3,
  Download,
  Upload,
  Sparkles,
  ShieldAlert,
  Info,
  Euro,
  Check,
  X,
  RotateCcw,
  Filter
} from 'lucide-react';

// ============================================================================
// DATABASE INTERVENTI PREDEFINITI (Adattabili per alimentazione)
// ============================================================================
const DEFAULT_INTERVENTIONS_TEMPLATE = [
  // --- BUROCRAZIA & TASSE ---
  {
    code: 'bollo',
    title: 'Bollo Auto (Tassa Automobilistica)',
    category: 'Burocrazia & Tasse',
    mandatory: 'Obbligatorio',
    freqMonths: 12,
    freqKm: null,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Tassa regionale annuale legata al possesso del veicolo e alla sua potenza in kW / classe ambientale Euro.',
    details: 'Va pagato entro l’ultimo giorno del mese successivo a quello di scadenza tramite PagoPA, ACI, tabaccherie o app bancarie. Il ritardo comporta sanzioni e interessi progressivi (ravvedimento operoso). Alcune regioni prevedono esenzioni temporanee per auto ibride o elettriche.'
  },
  {
    code: 'assicurazione',
    title: 'Assicurazione RCA (e garanzie accessorie)',
    category: 'Burocrazia & Tasse',
    mandatory: 'Obbligatorio',
    freqMonths: 12,
    freqKm: null,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Copertura assicurativa obbligatoria per la Responsabilità Civile Auto verso terzi, più eventuali polizze (Furto/Incendio, Cristalli, Assistenza Stradale, Kasko).',
    details: 'La legge prevede un periodo di tolleranza di 15 giorni dopo la scadenza annuale, dopodiché circolare senza copertura comporta multa salata, sequestro del veicolo e decurtazione punti. Conviene confrontare i preventivi almeno 30 giorni prima.'
  },
  {
    code: 'revisione',
    title: 'Revisione Ministeriale Periodica',
    category: 'Burocrazia & Tasse',
    mandatory: 'Obbligatorio',
    freqMonths: 24,
    freqKm: null,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Controllo tecnico obbligatorio presso Motorizzazione o centri autorizzati (4 anni dalla prima immatricolazione, poi ogni 2 anni).',
    details: 'Verifica efficienza freni, sterzo, sospensioni, luci, pneumatici, integrità telaio ed emissioni inquinanti/rumorosità. Circolare con revisione scaduta comporta una sanzione amministrativa e la sospensione dalla circolazione fino all’esito regolare.'
  },
  {
    code: 'bombole_gpl_metano',
    title: 'Collaudo / Sostituzione Bombole GPL o Metano',
    category: 'Burocrazia & Tasse',
    mandatory: 'Obbligatorio',
    freqMonths: 48,
    freqKm: null,
    fuelTypes: ['GPL/Metano'],
    description: 'Verifica periodica o sostituzione del serbatoio/bombole del gas per garantire tenuta e sicurezza dell’impianto.',
    details: 'Per il Metano la revisione bombole è obbligatoria ogni 4 anni (o 5 anni secondo omologazione R110). Per il GPL il serbatoio va sostituito obbligatoriamente ogni 10 anni. Con bombole scadute non è possibile fare rifornimento né superare la revisione ministeriale.'
  },

  // --- MOTORE & TAGLIANDO ---
  {
    code: 'olio_filtro',
    title: 'Cambio Olio Motore e Filtro Olio',
    category: 'Motore & Tagliando',
    mandatory: 'Obbligatorio',
    freqMonths: 12,
    freqKm: 15000,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'GPL/Metano'],
    description: 'Sostituzione completa del lubrificante motore e della cartuccia filtro olio con olio conforme alle specifiche del costruttore.',
    details: 'L’olio lubrifica, raffredda e pulisce gli organi interni del motore. Con il tempo e i chilometri perde viscosità e accumula residui carboniosi: trascurarlo causa usura precoce di pistoni, bronzine e turbina fino alla rottura del motore.'
  },
  {
    code: 'filtro_aria',
    title: 'Sostituzione Filtro Aria Motore',
    category: 'Motore & Tagliando',
    mandatory: 'Consigliato',
    freqMonths: 24,
    freqKm: 30000,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'GPL/Metano'],
    description: 'Sostituzione dell’elemento filtrante che trattiene polvere, insetti e detriti prima che l’aria entri nella camera di combustione.',
    details: 'Un filtro aria intasato riduce l’afflusso di ossigeno al motore, peggiorando la combustione, aumentando i consumi di carburante e facendo perdere brillantezza in accelerazione.'
  },
  {
    code: 'filtro_carburante_diesel',
    title: 'Sostituzione Filtro Gasolio (e spurgo acqua)',
    category: 'Motore & Tagliando',
    mandatory: 'Obbligatorio',
    freqMonths: 24,
    freqKm: 30000,
    fuelTypes: ['Diesel'],
    description: 'Sostituzione del filtro del gasolio per trattenere impurità, paraffina e condensa d’acqua presenti nel carburante.',
    details: 'I moderni sistemi di iniezione Common Rail lavorano a pressioni altissime e sono estremamente sensibili all’acqua e allo sporco. Un filtro intasato o saturo d’acqua può danneggiare seriamente iniettori e pompa ad alta pressione.'
  },
  {
    code: 'filtro_gpl_metano',
    title: 'Sostituzione Filtri Fase Gassosa/Liquida GPL-Metano',
    category: 'Motore & Tagliando',
    mandatory: 'Consigliato',
    freqMonths: 12,
    freqKm: 20000,
    fuelTypes: ['GPL/Metano'],
    description: 'Sostituzione dei filtri sull’impianto a gas per trattenere residui oleosi e impurità pesanti del carburante.',
    details: 'Il GPL e il metano contengono spesso residui oleosi che, se non filtrati regolarmente, sporcano e bloccano gli iniettori del gas causando strattonamenti e commutazioni forzate a benzina.'
  },
  {
    code: 'candele_accensione',
    title: 'Sostituzione Candele di Accensione',
    category: 'Motore & Tagliando',
    mandatory: 'Consigliato',
    freqMonths: 48,
    freqKm: 60000,
    fuelTypes: ['Benzina', 'Ibrida', 'GPL/Metano'],
    description: 'Sostituzione delle candele che generano la scintilla per l’accensione della miscela aria-carburante nei cilindri.',
    details: 'Candele usurate provocano avviamenti difficili a freddo, mancate accensioni (misfire), minimo irregolare, aumento dei consumi e possibile danneggiamento delle bobine e del catalizzatore.'
  },
  {
    code: 'distribuzione',
    title: 'Kit Distribuzione (Cinghia / Catena) e Pompa Acqua',
    category: 'Motore & Tagliando',
    mandatory: 'Obbligatorio',
    freqMonths: 60,
    freqKm: 100000,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'GPL/Metano'],
    description: 'Sostituzione di cinghia di distribuzione, tendicinghia, galoppini, pompa dell’acqua e cinghia servizi.',
    details: 'Sincronizza il movimento di albero motore e alberi a camme. Se la cinghia si rompe o salta dei denti mentre il motore è in moto, valvole e pistoni collidono causando danni gravissimi al motore.'
  },
  {
    code: 'riduttore_elettrico',
    title: 'Controllo e Cambio Olio Riduttore / Trasmissione EV',
    category: 'Motore & Tagliando',
    mandatory: 'Consigliato',
    freqMonths: 48,
    freqKm: 80000,
    fuelTypes: ['Elettrica'],
    description: 'Ispezione del gruppo motopropulsore elettrico e sostituzione del lubrificante del riduttore a rapporto fisso.',
    details: 'Anche le auto elettriche hanno ingranaggi di riduzione sottoposti a coppie elevate istantanee: rinnovare l’olio del riduttore mantiene silenziosità ed efficienza meccanica.'
  },

  // --- PNEUMATICI ---
  {
    code: 'cambio_gomme_stagionale',
    title: 'Cambio Gomme Stagionale (Estive / Invernali)',
    category: 'Pneumatici',
    mandatory: 'Obbligatorio',
    freqMonths: 6,
    freqKm: null,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Sostituzione del treno di pneumatici stagionali (15 Novembre obbligo dotazioni invernali, 15 Aprile ritorno estive, salvo gomme 4 Stagioni).',
    details: 'Include smontaggio, rimontaggio, equilibratura e controllo pressione/usura battistrada (limite legale 1,6 mm, consigliato cambio sotto i 3 mm su bagnato). Se monti pneumatici 4 Stagioni con codice velocità adeguato, usa questa voce per il controllo pressione e usura semestrale.'
  },
  {
    code: 'inversione_convergenza',
    title: 'Inversione Pneumatici, Equilibratura e Convergenza',
    category: 'Pneumatici',
    mandatory: 'Consigliato',
    freqMonths: 12,
    freqKm: 12000,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Rotazione delle ruote tra asse anteriore e posteriore, bilanciatura elettronica e verifica geometria assetto.',
    details: 'Permette di consumare il battistrada in modo uniforme su tutte e 4 le gomme allungandone la vita utile, eliminando vibrazioni al volante e garantendo stabilità in frenata e curva.'
  },

  // --- FRENI & SICUREZZA ---
  {
    code: 'pastiglie_freni',
    title: 'Controllo / Sostituzione Pastiglie e Dischi Freni',
    category: 'Freni & Sicurezza',
    mandatory: 'Obbligatorio',
    freqMonths: 24,
    freqKm: 35000,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Verifica dello spessore del materiale d’attrito delle pastiglie freno anteriori/posteriori e dello stato di usura/ovalizzazione dei dischi.',
    details: 'Pastiglie consumate oltre il limite rigano irreversibilmente i dischi freno e allungano drasticamente gli spazi di arresto. Su auto ibride ed elettriche durano di più grazie alla frenata rigenerativa, ma vanno controllate contro l’ossidazione.'
  },
  {
    code: 'liquido_freni',
    title: 'Sostituzione Liquido Freni (DOT 4 / DOT 5.1)',
    category: 'Freni & Sicurezza',
    mandatory: 'Consigliato',
    freqMonths: 24,
    freqKm: 40000,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Spurgo completo dell’impianto frenante e sostituzione del fluido idraulico.',
    details: 'Il liquido freni è igroscopico (assorbe umidità dall’aria nel tempo). L’acqua abbassa il punto di ebollizione del fluido: in discese lunghe o frenate intense si possono formare bolle di vapore con perdita improvvisa di potenza frenante (effetto vapour lock).'
  },
  {
    code: 'spazzole_tergicristallo',
    title: 'Sostituzione Spazzole Tergicristallo e Rabbocco Lavavetri',
    category: 'Freni & Sicurezza',
    mandatory: 'Consigliato',
    freqMonths: 12,
    freqKm: null,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Sostituzione delle spazzole anteriori e posteriore e riempimento vaschetta con liquido detergente antigelo.',
    details: 'Sole estivo e gelo invernale induriscono la gomma delle spazzole, lasciando striature sul parabrezza che riducono la visibilità notturna sotto la pioggia.'
  },

  // --- BATTERIA & CLIMA ---
  {
    code: 'filtro_abitacolo',
    title: 'Sostituzione Filtro Abitacolo (Antipolline / Carboni Attivi)',
    category: 'Batteria & Clima',
    mandatory: 'Consigliato',
    freqMonths: 12,
    freqKm: 15000,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Sostituzione del filtro dell’impianto di ventilazione/climatizzazione interna.',
    details: 'Trattiene polveri sottili PM2.5, pollini, muffe e gas di scarico prima che entrino nell’abitacolo. Un filtro sporco riduce la portata d’aria, favorisce l’appannamento dei vetri e genera cattivi odori.'
  },
  {
    code: 'ricarica_clima',
    title: 'Controllo Impianto Climatizzatore e Igienizzazione',
    category: 'Batteria & Clima',
    mandatory: 'Opzionale',
    freqMonths: 24,
    freqKm: null,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Verifica pressione gas refrigerante (R134a o R1234yf), tenuta circuito, lubrificazione compressore e trattamento antibatterico condotti.',
    details: 'Mantiene efficiente il raffrescamento estivo e lo spannamento invernale, prevenendo sforzi eccessivi al compressore A/C.'
  },
  {
    code: 'batteria_12v',
    title: 'Test Stato Batteria 12V e Alternatore',
    category: 'Batteria & Clima',
    mandatory: 'Consigliato',
    freqMonths: 12,
    freqKm: null,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Controllo tensione a riposo, spunto di avviamento (CCA) e pulizia morsetti della batteria servizi 12V.',
    details: 'Le batterie moderne cedono spesso senza preavviso, specialmente ai primi freddi o col caldo estremo. Anche su auto ibride ed elettriche la batteria 12V è indispensabile per avviare l’elettronica di bordo.'
  },
  {
    code: 'check_batteria_hv',
    title: 'Diagnostica Stato Batteria Alta Tensione (SOH) e Raffreddamento',
    category: 'Batteria & Clima',
    mandatory: 'Consigliato',
    freqMonths: 12,
    freqKm: 20000,
    fuelTypes: ['Ibrida', 'Elettrica'],
    description: 'Controllo elettronico dello State of Health (SOH) delle celle, isolamento alta tensione e pulizia prese d’aria/circuito raffreddamento batteria.',
    details: 'Permette di monitorare l’efficienza del pacco batteria di trazione, mantenere attiva la garanzia del costruttore e prevenire surriscaldamenti.'
  },
  {
    code: 'liquido_radiatore',
    title: 'Controllo / Sostituzione Liquido Refrigerante Motore',
    category: 'Batteria & Clima',
    mandatory: 'Consigliato',
    freqMonths: 48,
    freqKm: 60000,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Verifica punto di congelamento/ebollizione e sostituzione del liquido antigelo del circuito di raffreddamento.',
    details: 'Evita sia il congelamento invernale sia il surriscaldamento estivo, oltre a contenere additivi anticorrosione che proteggono radiatore, termostato e pompa acqua.'
  },

  // --- OPZIONALI & CURA AUTO ---
  {
    code: 'lavaggio_sanificazione',
    title: 'Lavaggio Completo, Decontaminazione e Cura Interni',
    category: 'Opzionali & Cura Auto',
    mandatory: 'Opzionale',
    freqMonths: 3,
    freqKm: null,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Lavaggio carrozzeria e sottoscocca (fondamentale dopo sale invernale o mare), aspirazione approfondita e trattamento plastiche/pelle.',
    details: 'Protegge il trasparente della vernice da resine, guano e salsedine prevenendo ossidazioni, e mantiene l’abitacolo salubre e ben conservato nel tempo.'
  },
  {
    code: 'additivo_pulizia',
    title: 'Trattamento Additivo Pulizia Iniettori / Fap-DPF',
    category: 'Opzionali & Cura Auto',
    mandatory: 'Opzionale',
    freqMonths: 6,
    freqKm: 10000,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'GPL/Metano'],
    description: 'Aggiunta di additivo specifico nel serbatoio carburante per pulire iniettori, valvole e favorire la rigenerazione del filtro antiparticolato.',
    details: 'Utile soprattutto se si percorrono molti tragitti brevi in città, dove il motore fatica a raggiungere temperature ottimali per autopulirsi.'
  },
  {
    code: 'kit_emergenza_ruotino',
    title: 'Controllo Pressione Ruota di Scorta / Scadenza Kit Gonfiaggio',
    category: 'Opzionali & Cura Auto',
    mandatory: 'Opzionale',
    freqMonths: 12,
    freqKm: null,
    fuelTypes: ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'],
    description: 'Verifica pressione del ruotino di scorta o data di scadenza del flacone sigillante del kit riparagomme, più controllo giubbotto e triangolo.',
    details: 'Spesso ci si accorge che il ruotino è sgonfio o il sigillante è scaduto proprio nel momento in cui si fora lontano da casa.'
  }
];

// ============================================================================
// UTILITY PER DATE, CALCOLI SCADENZE E FORMATTAZIONE
// ============================================================================
function getTodayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
}

function addMonthsToDate(isoDateStr, months) {
  if (!isoDateStr || !months) return null;
  const [year, month, day] = isoDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const targetMonth = date.getMonth() + Number(months);
  date.setMonth(targetMonth);
  // Gestione fine mese (es. 31 gennaio + 1 mese -> 28/29 febbraio)
  if (date.getDate() !== day) {
    date.setDate(0);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function diffDaysFromToday(targetIsoDate) {
  if (!targetIsoDate) return null;
  const todayStr = getTodayISO();
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const [ey, em, ed] = targetIsoDate.split('-').map(Number);
  const today = new Date(ty, tm - 1, td);
  const target = new Date(ey, em - 1, ed);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function formatDateIT(isoDateStr) {
  if (!isoDateStr) return '—';
  const [y, m, d] = isoDateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatNumberIT(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return Number(num).toLocaleString('it-IT');
}

function formatFrequency(freqMonths, freqKm) {
  const parts = [];
  if (freqMonths) {
    if (freqMonths % 12 === 0) {
      const years = freqMonths / 12;
      parts.push(years === 1 ? 'Ogni 12 mesi (1 anno)' : `Ogni ${freqMonths} mesi (${years} anni)`);
    } else {
      parts.push(`Ogni ${freqMonths} mesi`);
    }
  }
  if (freqKm) {
    parts.push(`Ogni ${formatNumberIT(freqKm)} km`);
  }
  if (parts.length === 0) return 'Al bisogno';
  return parts.join(' oppure ');
}

/**
 * Calcola stato completo di un intervento rispetto ai dati del veicolo e all'ultima esecuzione
 */
function evaluateInterventionStatus(item, currentVehicleKm) {
  const hasLastDate = Boolean(item.lastDate);
  const hasLastKm = item.lastKm !== null && item.lastKm !== undefined && item.lastKm !== '';

  if (!hasLastDate && !hasLastKm) {
    return {
      status: 'unrecorded', // 'overdue' | 'due_soon' | 'ok' | 'unrecorded'
      label: 'Mai registrato',
      nextDate: null,
      daysRemaining: null,
      nextKm: null,
      kmRemaining: null,
      dateProgress: 0,
      kmProgress: 0,
      reason: 'Inserisci l’ultima data o i km per avviare il conteggio'
    };
  }

  let nextDate = null;
  let daysRemaining = null;
  let dateProgress = 0;

  if (hasLastDate && item.freqMonths) {
    nextDate = addMonthsToDate(item.lastDate, item.freqMonths);
    daysRemaining = diffDaysFromToday(nextDate);
    const totalDays = Math.max(1, item.freqMonths * 30.4375);
    const elapsedDays = totalDays - daysRemaining;
    dateProgress = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
  }

  let nextKm = null;
  let kmRemaining = null;
  let kmProgress = 0;

  if (hasLastKm && item.freqKm) {
    nextKm = Number(item.lastKm) + Number(item.freqKm);
    kmRemaining = nextKm - Number(currentVehicleKm || 0);
    const elapsedKm = Number(currentVehicleKm || 0) - Number(item.lastKm);
    kmProgress = Math.min(100, Math.max(0, Math.round((elapsedKm / Number(item.freqKm)) * 100)));
  }

  // Determinazione stato: SCADUTO (Rosso) se data passata (< 0 giorni) o km superati (< 0 km)
  const isDateOverdue = daysRemaining !== null && daysRemaining < 0;
  const isKmOverdue = kmRemaining !== null && kmRemaining < 0;

  if (isDateOverdue || isKmOverdue) {
    const reasons = [];
    if (isDateOverdue) reasons.push(`Scaduto da ${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? 'giorno' : 'giorni'}`);
    if (isKmOverdue) reasons.push(`Superato di ${formatNumberIT(Math.abs(kmRemaining))} km`);
    return {
      status: 'overdue',
      label: 'SCADUTO',
      nextDate,
      daysRemaining,
      nextKm,
      kmRemaining,
      dateProgress: 100,
      kmProgress: 100,
      reason: reasons.join(' • ')
    };
  }

  // IN SCADENZA (Arancione) se manca <= 30 giorni (1 mese) oppure <= 1.500 km
  const isDateDueSoon = daysRemaining !== null && daysRemaining <= 30;
  const isKmDueSoon = kmRemaining !== null && kmRemaining <= 1500;

  if (isDateDueSoon || isKmDueSoon) {
    const reasons = [];
    if (isDateDueSoon) {
      reasons.push(daysRemaining === 0 ? 'Scade oggi!' : `Mancano ${daysRemaining} giorni`);
    }
    if (isKmDueSoon) {
      reasons.push(`Mancano ${formatNumberIT(kmRemaining)} km`);
    }
    return {
      status: 'due_soon',
      label: 'IN SCADENZA',
      nextDate,
      daysRemaining,
      nextKm,
      kmRemaining,
      dateProgress,
      kmProgress,
      reason: reasons.join(' • ')
    };
  }

  // IN REGOLA (Verde)
  const okReasons = [];
  if (daysRemaining !== null) okReasons.push(`Tra ${daysRemaining} giorni`);
  if (kmRemaining !== null) okReasons.push(`Tra ${formatNumberIT(kmRemaining)} km`);

  return {
    status: 'ok',
    label: 'In regola',
    nextDate,
    daysRemaining,
    nextKm,
    kmRemaining,
    dateProgress,
    kmProgress,
    reason: okReasons.join(' • ') || 'Registrato'
  };
}

function buildInterventionsForFuel(fuelType) {
  return DEFAULT_INTERVENTIONS_TEMPLATE
    .filter((tpl) => tpl.fuelTypes.includes(fuelType))
    .map((tpl) => ({
      id: `${tpl.code}_${Math.random().toString(36).slice(2, 8)}`,
      code: tpl.code,
      title: tpl.title,
      category: tpl.category,
      mandatory: tpl.mandatory,
      freqMonths: tpl.freqMonths,
      freqKm: tpl.freqKm,
      description: tpl.description,
      details: tpl.details,
      lastDate: '',
      lastKm: null,
      lastCost: null,
      lastNotes: ''
    }));
}

function createDemoVehicle() {
  const today = new Date();
  const formatOffsetDays = (daysOffset) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysOffset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const currentKm = 68450;
  const baseItems = buildInterventionsForFuel('Benzina');

  const populatedItems = baseItems.map((item) => {
    if (item.code === 'bollo') {
      // Scaduto da 12 giorni
      return { ...item, lastDate: formatOffsetDays(-377), lastKm: 54000, lastCost: 198, lastNotes: 'Pagato tramite PagoPA' };
    }
    if (item.code === 'olio_filtro') {
      // In scadenza per km (mancano 550 km!)
      return { ...item, lastDate: formatOffsetDays(-260), lastKm: 54000, lastCost: 165, lastNotes: 'Tagliando completo olio 5W-30 + filtro' };
    }
    if (item.code === 'assicurazione') {
      // In scadenza tra 18 giorni (arancione)
      return { ...item, lastDate: formatOffsetDays(-347), lastKm: 55100, lastCost: 480, lastNotes: 'Polizza RCA + Assistenza stradale' };
    }
    if (item.code === 'revisione') {
      // Ok (fatta 8 mesi fa)
      return { ...item, lastDate: formatOffsetDays(-240), lastKm: 56200, lastCost: 79, lastNotes: 'Centro Revisioni Autorizzato' };
    }
    if (item.code === 'cambio_gomme_stagionale') {
      // Ok (fatto 25 giorni fa)
      return { ...item, lastDate: formatOffsetDays(-25), lastKm: 67100, lastCost: 45, lastNotes: 'Montaggio treno invernale + equilibratura' };
    }
    if (item.code === 'pastiglie_freni') {
      // Ok
      return { ...item, lastDate: formatOffsetDays(-310), lastKm: 51000, lastCost: 140, lastNotes: 'Pastiglie anteriori Brembo' };
    }
    if (item.code === 'filtro_abitacolo') {
      // In scadenza tra 22 giorni (arancione)
      return { ...item, lastDate: formatOffsetDays(-343), lastKm: 54000, lastCost: 28, lastNotes: 'Filtro ai carboni attivi' };
    }
    return item;
  });

  const demoHistory = [
    {
      id: 'h_demo_1',
      interventionTitle: 'Cambio Gomme Stagionale (Estive / Invernali)',
      category: 'Pneumatici',
      date: formatOffsetDays(-25),
      km: 67100,
      cost: 45,
      notes: 'Montaggio treno invernale + equilibratura'
    },
    {
      id: 'h_demo_2',
      interventionTitle: 'Revisione Ministeriale Periodica',
      category: 'Burocrazia & Tasse',
      date: formatOffsetDays(-240),
      km: 56200,
      cost: 79,
      notes: 'Centro Revisioni Autorizzato - Esito Regolare'
    },
    {
      id: 'h_demo_3',
      interventionTitle: 'Cambio Olio Motore e Filtro Olio',
      category: 'Motore & Tagliando',
      date: formatOffsetDays(-260),
      km: 54000,
      cost: 165,
      notes: 'Tagliando completo olio 5W-30 + filtro'
    }
  ];

  return {
    id: 'veh_demo_1',
    name: 'Volkswagen Golf 1.5 TSI',
    plate: 'GH 482 KL',
    year: 2021,
    fuelType: 'Benzina',
    currentKm,
    interventions: populatedItems,
    history: demoHistory
  };
}

// ============================================================================
// COMPONENTE PRINCIPALE APP
// ============================================================================
const STORAGE_KEY = 'scadenziario_auto_v1';

const CATEGORIES = [
  'Tutte',
  'Burocrazia & Tasse',
  'Motore & Tagliando',
  'Pneumatici',
  'Freni & Sicurezza',
  'Batteria & Clima',
  'Opzionali & Cura Auto'
];

const MANDATORY_LEVELS = ['Tutti', 'Obbligatorio', 'Consigliato', 'Opzionale'];
const FUEL_TYPES = ['Benzina', 'Diesel', 'Ibrida', 'Elettrica', 'GPL/Metano'];

export default function App() {
  // Stato principale veicoli
  const [vehicles, setVehicles] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Errore caricamento localStorage:', e);
    }
    return [createDemoVehicle()];
  });

  const [selectedVehicleId, setSelectedVehicleId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
    } catch (e) {
      // fallback
    }
    return 'veh_demo_1';
  });

  // Salvataggio automatico in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    } catch (e) {
      console.error('Errore salvataggio localStorage:', e);
    }
  }, [vehicles]);

  const activeVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  // Stati UI & Filtri
  const [activeTab, setActiveTab] = useState('interventions'); // 'interventions' | 'history'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'overdue' | 'due_soon' | 'ok' | 'unrecorded'
  const [categoryFilter, setCategoryFilter] = useState('Tutte');
  const [mandatoryFilter, setMandatoryFilter] = useState('Tutti');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  // Modali
  const [vehicleModal, setVehicleModal] = useState({ open: false, mode: 'create' }); // 'create' | 'edit'
  const [kmModalOpen, setKmModalOpen] = useState(false);
  const [completeModalItem, setCompleteModalItem] = useState(null);
  const [customInterventionModal, setCustomInterventionModal] = useState({ open: false, editItem: null });
  const [confirmDeleteVehicleOpen, setConfirmDeleteVehicleOpen] = useState(false);

  const fileInputRef = useRef(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev && prev.text === text ? null : prev));
    }, 3500);
  };

  // Calcolo valutazioni di tutti gli interventi dell'auto attiva
  const evaluatedInterventions = useMemo(() => {
    if (!activeVehicle) return [];
    return activeVehicle.interventions.map((item) => ({
      ...item,
      eval: evaluateInterventionStatus(item, activeVehicle.currentKm)
    }));
  }, [activeVehicle]);

  // Statistiche KPI
  const stats = useMemo(() => {
    const counts = {
      all: evaluatedInterventions.length,
      overdue: 0,
      due_soon: 0,
      ok: 0,
      unrecorded: 0
    };
    evaluatedInterventions.forEach((item) => {
      counts[item.eval.status] = (counts[item.eval.status] || 0) + 1;
    });
    return counts;
  }, [evaluatedInterventions]);

  // Lista filtrata e ordinata per urgenza
  const filteredInterventions = useMemo(() => {
    const priorityOrder = { overdue: 0, due_soon: 1, unrecorded: 2, ok: 3 };
    return evaluatedInterventions
      .filter((item) => {
        if (statusFilter !== 'all' && item.eval.status !== statusFilter) return false;
        if (categoryFilter !== 'Tutte' && item.category !== categoryFilter) return false;
        if (mandatoryFilter !== 'Tutti' && item.mandatory !== mandatoryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inTitle = item.title.toLowerCase().includes(q);
          const inDesc = item.description.toLowerCase().includes(q);
          const inDetails = (item.details || '').toLowerCase().includes(q);
          if (!inTitle && !inDesc && !inDetails) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const pDiff = priorityOrder[a.eval.status] - priorityOrder[b.eval.status];
        if (pDiff !== 0) return pDiff;
        // A parità di stato, ordina per giorni rimanenti crescenti
        const dA = a.eval.daysRemaining !== null ? a.eval.daysRemaining : 99999;
        const dB = b.eval.daysRemaining !== null ? b.eval.daysRemaining : 99999;
        return dA - dB;
      });
  }, [evaluatedInterventions, statusFilter, categoryFilter, mandatoryFilter, searchQuery]);

  // ============================================================================
  // AZIONI CRUD SU VEICOLI E INTERVENTI
  // ============================================================================
  const handleSaveVehicle = (formData) => {
    if (vehicleModal.mode === 'create') {
      const newVehicle = {
        id: `veh_${Date.now()}`,
        name: formData.name.trim(),
        plate: formData.plate.trim().toUpperCase(),
        year: Number(formData.year) || new Date().getFullYear(),
        fuelType: formData.fuelType,
        currentKm: Number(formData.currentKm) || 0,
        interventions: buildInterventionsForFuel(formData.fuelType),
        history: []
      };
      setVehicles((prev) => [...prev, newVehicle]);
      setSelectedVehicleId(newVehicle.id);
      setStatusFilter('all');
      showToast(`Veicolo "${newVehicle.name}" creato con ${newVehicle.interventions.length} interventi predisposti!`);
    } else if (activeVehicle) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id !== activeVehicle.id) return v;
          let updatedInterventions = v.interventions;
          // Se cambia l'alimentazione, aggiorna le voci specifiche mantenendo quelle già compilate
          if (v.fuelType !== formData.fuelType) {
            const newTemplateList = buildInterventionsForFuel(formData.fuelType);
            const existingByCode = new Map(v.interventions.map((i) => [i.code, i]));
            const customItems = v.interventions.filter((i) => i.code && i.code.startsWith('custom_'));
            updatedInterventions = [
              ...newTemplateList.map((tplItem) => existingByCode.get(tplItem.code) || tplItem),
              ...customItems
            ];
          }
          return {
            ...v,
            name: formData.name.trim(),
            plate: formData.plate.trim().toUpperCase(),
            year: Number(formData.year) || v.year,
            fuelType: formData.fuelType,
            currentKm: Number(formData.currentKm) >= 0 ? Number(formData.currentKm) : v.currentKm,
            interventions: updatedInterventions
          };
        })
      );
      showToast('Dati del veicolo aggiornati con successo!');
    }
    setVehicleModal({ open: false, mode: 'create' });
  };

  const handleDeleteVehicle = () => {
    if (!activeVehicle) return;
    const remaining = vehicles.filter((v) => v.id !== activeVehicle.id);
    setVehicles(remaining);
    setSelectedVehicleId(remaining[0]?.id || '');
    setConfirmDeleteVehicleOpen(false);
    showToast(`Veicolo "${activeVehicle.name}" eliminato.`, 'info');
  };

  const handleUpdateCurrentKm = (newKm) => {
    if (!activeVehicle) return;
    const parsed = Number(newKm);
    if (isNaN(parsed) || parsed < 0) return;
    setVehicles((prev) =>
      prev.map((v) => (v.id === activeVehicle.id ? { ...v, currentKm: parsed } : v))
    );
    setKmModalOpen(false);
    showToast(`Chilometraggio aggiornato a ${formatNumberIT(parsed)} km!`);
  };

  const handleConfirmCompleteIntervention = ({ date, km, cost, notes }) => {
    if (!activeVehicle || !completeModalItem) return;
    const numericKm = km !== '' && km !== null ? Number(km) : activeVehicle.currentKm;
    const numericCost = cost !== '' && cost !== null ? Number(cost) : null;

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== activeVehicle.id) return v;

        // Se i km inseriti sono maggiori dei km attuali del veicolo, aggiorniamo anche quelli
        const updatedVehicleKm = numericKm > v.currentKm ? numericKm : v.currentKm;

        const updatedInterventions = v.interventions.map((item) => {
          if (item.id !== completeModalItem.id) return item;
          return {
            ...item,
            lastDate: date,
            lastKm: numericKm,
            lastCost: numericCost,
            lastNotes: notes.trim()
          };
        });

        const newHistoryEntry = {
          id: `hist_${Date.now()}`,
          interventionId: completeModalItem.id,
          interventionTitle: completeModalItem.title,
          category: completeModalItem.category,
          date,
          km: numericKm,
          cost: numericCost,
          notes: notes.trim()
        };

        return {
          ...v,
          currentKm: updatedVehicleKm,
          interventions: updatedInterventions,
          history: [newHistoryEntry, ...(v.history || [])]
        };
      })
    );

    showToast(`Intervento "${completeModalItem.title}" registrato! Prossima scadenza ricalcolata.`);
    setCompleteModalItem(null);
  };

  const handleSaveCustomOrEditedIntervention = (formData) => {
    if (!activeVehicle) return;
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== activeVehicle.id) return v;
        if (customInterventionModal.editItem) {
          // Modifica intervento esistente
          return {
            ...v,
            interventions: v.interventions.map((it) =>
              it.id === customInterventionModal.editItem.id
                ? {
                    ...it,
                    title: formData.title.trim(),
                    category: formData.category,
                    mandatory: formData.mandatory,
                    freqMonths: formData.freqMonths ? Number(formData.freqMonths) : null,
                    freqKm: formData.freqKm ? Number(formData.freqKm) : null,
                    description: formData.description.trim(),
                    details: formData.details.trim()
                  }
                : it
            )
          };
        } else {
          // Nuovo intervento personalizzato
          const newItem = {
            id: `custom_${Date.now()}`,
            code: `custom_${Date.now()}`,
            title: formData.title.trim(),
            category: formData.category,
            mandatory: formData.mandatory,
            freqMonths: formData.freqMonths ? Number(formData.freqMonths) : null,
            freqKm: formData.freqKm ? Number(formData.freqKm) : null,
            description: formData.description.trim() || 'Intervento personalizzato inserito dall’utente.',
            details: formData.details.trim(),
            lastDate: formData.lastDate || '',
            lastKm: formData.lastKm !== '' ? Number(formData.lastKm) : null,
            lastCost: null,
            lastNotes: ''
          };
          return {
            ...v,
            interventions: [newItem, ...v.interventions]
          };
        }
      })
    );
    showToast(
      customInterventionModal.editItem
        ? 'Parametri intervento aggiornati!'
        : 'Nuovo intervento aggiunto alla scheda auto!'
    );
    setCustomInterventionModal({ open: false, editItem: null });
  };

  const handleDeleteIntervention = (interventionId, title) => {
    if (!activeVehicle) return;
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === activeVehicle.id
          ? { ...v, interventions: v.interventions.filter((i) => i.id !== interventionId) }
          : v
      )
    );
    showToast(`Voce "${title}" rimossa dalla lista.`, 'info');
  };

  const handleDeleteHistoryItem = (historyId) => {
    if (!activeVehicle) return;
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === activeVehicle.id
          ? { ...v, history: (v.history || []).filter((h) => h.id !== historyId) }
          : v
      )
    );
    showToast('Voce rimossa dallo storico.', 'info');
  };

  // Export / Import JSON & Demo Reset
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(vehicles, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scadenziario_auto_backup_${getTodayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON esportato!');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].interventions) {
          setVehicles(parsed);
          setSelectedVehicleId(parsed[0].id);
          showToast('Backup importato correttamente!');
        } else {
          showToast('Il file selezionato non è un backup valido.', 'error');
        }
      } catch {
        showToast('Errore durante la lettura del file JSON.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadDemo = () => {
    const demo = createDemoVehicle();
    setVehicles((prev) => {
      const withoutOldDemo = prev.filter((v) => v.id !== 'veh_demo_1');
      return [demo, ...withoutOldDemo];
    });
    setSelectedVehicleId(demo.id);
    setStatusFilter('all');
    showToast('Veicolo demo di esempio caricato!');
  };

  const toggleExpandCard = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ============================================================================
  // RENDERING INTERFACCIA
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* TOAST NOTIFICA */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toastMessage.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : toastMessage.type === 'info'
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPALE */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/20 border border-teal-400/30 p-2.5 rounded-xl text-teal-400">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Scadenziario Auto & Manutenzione
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Monitoraggio tagliandi, tasse, scadenze chilometriche e storico interventi
              </p>
            </div>
          </div>

          {/* Pulsanti Backup / Demo */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadDemo}
              title="Carica veicolo di esempio"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Carica Demo</span>
            </button>
            <button
              onClick={handleExportJSON}
              title="Esporta backup dati"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Esporta</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Importa backup dati"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Importa</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* SEZIONE 1: BARRA SELEZIONE & GESTIONE VEICOLO */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Selettore Auto + Dettagli Veicolo */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <label htmlFor="vehicle-select" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  La Mia Auto:
                </label>
                {vehicles.length > 0 ? (
                  <select
                    id="vehicle-select"
                    value={activeVehicle?.id || ''}
                    onChange={(e) => {
                      setSelectedVehicleId(e.target.value);
                      setStatusFilter('all');
                    }}
                    className="bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.plate ? `(${v.plate})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-slate-500 italic">Nessun veicolo configurato</span>
                )}
              </div>

              {activeVehicle && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {activeVehicle.plate && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 font-mono font-bold text-slate-800 tracking-wider">
                      {activeVehicle.plate}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                    {activeVehicle.fuelType}
                  </span>
                  {activeVehicle.year && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
                      Anno {activeVehicle.year}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Azioni Veicolo & Aggiornamento Km */}
            <div className="flex flex-wrap items-center gap-2.5">
              {activeVehicle && (
                <>
                  <button
                    onClick={() => setKmModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition cursor-pointer"
                  >
                    <Gauge className="w-4 h-4" />
                    <span>{formatNumberIT(activeVehicle.currentKm)} km</span>
                    <span className="text-xs bg-teal-800/60 px-2 py-0.5 rounded-md">Aggiorna Km</span>
                  </button>

                  <button
                    onClick={() => setVehicleModal({ open: true, mode: 'edit' })}
                    title="Modifica dati veicolo"
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {vehicles.length > 1 && (
                    <button
                      onClick={() => setConfirmDeleteVehicleOpen(true)}
                      title="Elimina questo veicolo"
                      className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => setVehicleModal({ open: true, mode: 'create' })}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Nuova Auto</span>
              </button>
            </div>
          </div>
        </section>

        {!activeVehicle ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <Car className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Nessun veicolo presente</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm">
              Crea subito la scheda della tua auto per generare automaticamente tutti gli interventi di manutenzione, bollo, revisione e tagliandi.
            </p>
            <button
              onClick={() => setVehicleModal({ open: true, mode: 'create' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm"
            >
              <Plus className="w-4 h-4" />
              Crea la Mia Auto
            </button>
          </div>
        ) : (
          <>
            {/* SEZIONE 2: BANNER AVVISI SCADENZE CRITICHE (ROSSO / ARANCIONE) */}
            {(stats.overdue > 0 || stats.due_soon > 0) && (
              <section className="space-y-3">
                {stats.overdue > 0 && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="bg-red-600 text-white p-2 rounded-xl shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-bold text-red-900 text-base">
                          Attenzione: {stats.overdue} {stats.overdue === 1 ? 'intervento SCADUTO!' : 'interventi SCADUTI!'}
                        </h2>
                        <p className="text-xs sm:text-sm text-red-800">
                          {evaluatedInterventions
                            .filter((i) => i.eval.status === 'overdue')
                            .map((i) => i.title)
                            .join(' • ')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('interventions');
                        setStatusFilter('overdue');
                      }}
                      className="shrink-0 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm transition"
                    >
                      Mostra Scaduti
                    </button>
                  </div>
                )}

                {stats.due_soon > 0 && (
                  <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="bg-amber-500 text-white p-2 rounded-xl shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-bold text-amber-950 text-base">
                          Promemoria: {stats.due_soon} {stats.due_soon === 1 ? 'intervento in scadenza a breve' : 'interventi in scadenza a breve'}
                        </h2>
                        <p className="text-xs sm:text-sm text-amber-900">
                          {evaluatedInterventions
                            .filter((i) => i.eval.status === 'due_soon')
                            .map((i) => `${i.title} (${i.eval.reason})`)
                            .join(' • ')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('interventions');
                        setStatusFilter('due_soon');
                      }}
                      className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm transition"
                    >
                      Mostra In Scadenza
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* SEZIONE 3: KPI FILTRABILI */}
            <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <button
                onClick={() => {
                  setActiveTab('interventions');
                  setStatusFilter('all');
                }}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  statusFilter === 'all' && activeTab === 'interventions'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-medium opacity-75">Tutti gli interventi</div>
                <div className="text-2xl font-bold mt-1">{stats.all}</div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('interventions');
                  setStatusFilter('overdue');
                }}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  statusFilter === 'overdue' && activeTab === 'interventions'
                    ? 'bg-red-600 text-white border-red-700 shadow-sm'
                    : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Scaduti</span>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold mt-1">{stats.overdue}</div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('interventions');
                  setStatusFilter('due_soon');
                }}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  statusFilter === 'due_soon' && activeTab === 'interventions'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>In Scadenza</span>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold mt-1">{stats.due_soon}</div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('interventions');
                  setStatusFilter('ok');
                }}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  statusFilter === 'ok' && activeTab === 'interventions'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>In Regola</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold mt-1">{stats.ok}</div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('interventions');
                  setStatusFilter('unrecorded');
                }}
                className={`col-span-2 sm:col-span-1 p-3.5 rounded-2xl border text-left transition ${
                  statusFilter === 'unrecorded' && activeTab === 'interventions'
                    ? 'bg-slate-600 text-white border-slate-700 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Mai Registrati</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold mt-1">{stats.unrecorded}</div>
              </button>
            </section>

            {/* SEZIONE 4: NAVIGAZIONE TAB (Interventi vs Storico) + PULSANTE NUOVO INTERVENTO */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('interventions')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    activeTab === 'interventions'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>Piano Manutenzione ({evaluatedInterventions.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    activeTab === 'history'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Storico Eseguiti ({(activeVehicle.history || []).length})</span>
                </button>
              </div>

              {activeTab === 'interventions' && (
                <button
                  onClick={() => setCustomInterventionModal({ open: true, editItem: null })}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aggiungi Intervento Personalizzato</span>
                </button>
              )}
            </div>

            {/* ==================================================================== */}
            {/* VISTA A: ELENCO INTERVENTI E SCADENZE                                */}
            {/* ==================================================================== */}
            {activeTab === 'interventions' && (
              <div className="space-y-4">
                {/* BARRA RICERCA E FILTRI */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cerca intervento (es. bollo, olio, gomme, freni, revisione...)"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat === 'Tutte' ? 'Tutte le categorie' : cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <select
                      value={mandatoryFilter}
                      onChange={(e) => setMandatoryFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      {MANDATORY_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl === 'Tutti' ? 'Obbligatorietà: Tutte' : lvl}
                        </option>
                      ))}
                    </select>

                    {(statusFilter !== 'all' || categoryFilter !== 'Tutte' || mandatoryFilter !== 'Tutti' || searchQuery) && (
                      <button
                        onClick={() => {
                          setStatusFilter('all');
                          setCategoryFilter('Tutte');
                          setMandatoryFilter('Tutti');
                          setSearchQuery('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* GRIGLIA SCHEDE INTERVENTO */}
                {filteredInterventions.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
                    <p className="font-semibold text-slate-700">Nessun intervento trovato con i filtri selezionati.</p>
                    <p className="text-sm text-slate-500">Prova a reimpostare i filtri di ricerca o aggiungi una nuova voce.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredInterventions.map((item) => {
                      const { eval: st } = item;
                      const isExpanded = Boolean(expandedCards[item.id]);

                      // Stili semantici per stato
                      const cardTheme = {
                        overdue: {
                          wrapper: 'bg-white border-2 border-red-500 shadow-md ring-2 ring-red-500/10',
                          headerBg: 'bg-red-50/80 border-b border-red-200',
                          badge: 'bg-red-600 text-white',
                          icon: <AlertCircle className="w-4 h-4" />,
                          progressBar: 'bg-red-600'
                        },
                        due_soon: {
                          wrapper: 'bg-white border-2 border-amber-400 shadow-md ring-2 ring-amber-400/10',
                          headerBg: 'bg-amber-50/80 border-b border-amber-200',
                          badge: 'bg-amber-500 text-white',
                          icon: <AlertTriangle className="w-4 h-4" />,
                          progressBar: 'bg-amber-500'
                        },
                        ok: {
                          wrapper: 'bg-white border border-slate-200 hover:border-emerald-300 shadow-sm',
                          headerBg: 'bg-emerald-50/40 border-b border-slate-100',
                          badge: 'bg-emerald-600 text-white',
                          icon: <CheckCircle2 className="w-4 h-4" />,
                          progressBar: 'bg-emerald-500'
                        },
                        unrecorded: {
                          wrapper: 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm',
                          headerBg: 'bg-slate-50 border-b border-slate-100',
                          badge: 'bg-slate-500 text-white',
                          icon: <Clock className="w-4 h-4" />,
                          progressBar: 'bg-slate-300'
                        }
                      }[st.status];

                      const mandatoryBadgeColor =
                        item.mandatory === 'Obbligatorio'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : item.mandatory === 'Consigliato'
                          ? 'bg-sky-100 text-sky-800 border-sky-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200';

                      return (
                        <article
                          key={item.id}
                          className={`rounded-2xl overflow-hidden flex flex-col justify-between transition ${cardTheme.wrapper}`}
                        >
                          <div>
                            {/* HEADER SCHEDA */}
                            <div className={`px-4 py-3 flex items-start justify-between gap-3 ${cardTheme.headerBg}`}>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    {item.category}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${mandatoryBadgeColor}`}>
                                    {item.mandatory}
                                  </span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-base leading-snug">
                                  {item.title}
                                </h3>
                              </div>

                              {/* BADGE STATO SCADENZA */}
                              <div className="flex flex-col items-end shrink-0 gap-1">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-xs ${cardTheme.badge}`}
                                >
                                  {cardTheme.icon}
                                  {st.label}
                                </span>
                                <span
                                  className={`text-[11px] font-semibold ${
                                    st.status === 'overdue'
                                      ? 'text-red-700'
                                      : st.status === 'due_soon'
                                      ? 'text-amber-800'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {st.reason}
                                </span>
                              </div>
                            </div>

                            {/* CORPO SCHEDA */}
                            <div className="p-4 space-y-3.5">
                              {/* OGNI QUANTO VA FATTO */}
                              <div className="flex items-center gap-2 text-xs sm:text-sm bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
                                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                                <span className="font-semibold text-slate-700">Ogni quanto:</span>
                                <span className="text-slate-900 font-medium">
                                  {formatFrequency(item.freqMonths, item.freqKm)}
                                </span>
                              </div>

                              {/* IN COSA CONSISTE */}
                              <div className="text-sm text-slate-700 leading-relaxed">
                                <p>{item.description}</p>
                                {item.details && (
                                  <div className="mt-1.5">
                                    {isExpanded && (
                                      <div className="mt-2 p-3 rounded-xl bg-teal-50/60 border border-teal-100 text-xs sm:text-sm text-slate-700">
                                        <span className="font-semibold text-teal-900 block mb-1">
                                          Dettaglio tecnico & perché è importante:
                                        </span>
                                        {item.details}
                                      </div>
                                    )}
                                    <button
                                      onClick={() => toggleExpandCard(item.id)}
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 mt-1"
                                    >
                                      <Info className="w-3.5 h-3.5" />
                                      <span>{isExpanded ? 'Nascondi dettagli' : 'Scopri in cosa consiste nel dettaglio'}</span>
                                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* CONFRONTO ULTIMA VOLTA vs PROSSIMA SCADENZA */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                {/* Box Ultimo Intervento */}
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    Ultima volta eseguito
                                  </div>
                                  {st.status === 'unrecorded' ? (
                                    <div className="text-xs text-slate-500 italic">
                                      Non ancora registrato
                                    </div>
                                  ) : (
                                    <div className="space-y-0.5">
                                      <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                        {formatDateIT(item.lastDate)}
                                      </div>
                                      <div className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                                        <Gauge className="w-3.5 h-3.5 text-slate-500" />
                                        {item.lastKm !== null && item.lastKm !== ''
                                          ? `${formatNumberIT(item.lastKm)} km`
                                          : 'Km non indicati'}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Box Prossima Scadenza */}
                                <div
                                  className={`p-3 rounded-xl border ${
                                    st.status === 'overdue'
                                      ? 'bg-red-50/70 border-red-200'
                                      : st.status === 'due_soon'
                                      ? 'bg-amber-50/70 border-amber-200'
                                      : 'bg-slate-50 border-slate-200/80'
                                  }`}
                                >
                                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    Prossima scadenza
                                  </div>
                                  {st.status === 'unrecorded' ? (
                                    <div className="text-xs text-slate-500 italic">
                                      In attesa di prima registrazione
                                    </div>
                                  ) : (
                                    <div className="space-y-0.5">
                                      {st.nextDate && (
                                        <div
                                          className={`text-sm font-bold flex items-center gap-1.5 ${
                                            st.daysRemaining !== null && st.daysRemaining < 0
                                              ? 'text-red-700'
                                              : st.daysRemaining !== null && st.daysRemaining <= 30
                                              ? 'text-amber-800'
                                              : 'text-slate-800'
                                          }`}
                                        >
                                          <Calendar className="w-3.5 h-3.5" />
                                          {formatDateIT(st.nextDate)}
                                        </div>
                                      )}
                                      {st.nextKm !== null && (
                                        <div
                                          className={`text-xs font-semibold flex items-center gap-1.5 ${
                                            st.kmRemaining !== null && st.kmRemaining < 0
                                              ? 'text-red-700'
                                              : st.kmRemaining !== null && st.kmRemaining <= 1500
                                              ? 'text-amber-800'
                                              : 'text-slate-600'
                                          }`}
                                        >
                                          <Gauge className="w-3.5 h-3.5" />
                                          Entro {formatNumberIT(st.nextKm)} km
                                        </div>
                                      )}
                                      {!st.nextDate && st.nextKm === null && (
                                        <div className="text-xs text-slate-500">Al bisogno</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* BARRA AVANZAMENTO VISIVA */}
                              {st.status !== 'unrecorded' && (st.nextDate || st.nextKm !== null) && (
                                <div className="space-y-1">
                                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${cardTheme.progressBar}`}
                                      style={{ width: `${Math.max(st.dateProgress, st.kmProgress)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* FOOTER SCHEDA CON PULSANTE "SEGNA COME FATTO" */}
                          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setCustomInterventionModal({ open: true, editItem: item })}
                                title="Modifica frequenza o dettagli intervento"
                                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteIntervention(item.id, item.title)}
                                title="Rimuovi intervento da questo veicolo"
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => setCompleteModalItem(item)}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white shadow-sm transition cursor-pointer ${
                                st.status === 'overdue'
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : st.status === 'due_soon'
                                  ? 'bg-amber-600 hover:bg-amber-700'
                                  : 'bg-teal-600 hover:bg-teal-700'
                              }`}
                            >
                              <Check className="w-4 h-4" />
                              <span>Segna come Fatto</span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ==================================================================== */}
            {/* VISTA B: STORICO INTERVENTI ESEGUITI                                 */}
            {/* ==================================================================== */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">Registro Storico Manutenzioni</h2>
                    <p className="text-xs text-slate-500">
                      Cronologia completa di tutti gli interventi registrati su {activeVehicle.name}
                    </p>
                  </div>
                  <div className="bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl text-right">
                    <span className="text-xs text-teal-800 block">Totale Spese Registrate</span>
                    <span className="text-lg font-bold text-teal-950">
                      €{' '}
                      {formatNumberIT(
                        (activeVehicle.history || []).reduce((acc, h) => acc + (Number(h.cost) || 0), 0)
                      )}
                    </span>
                  </div>
                </div>

                {(activeVehicle.history || []).length === 0 ? (
                  <div className="p-10 text-center space-y-2">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-700">Nessun intervento nello storico</p>
                    <p className="text-sm text-slate-500">
                      Quando clicchi su "Segna come Fatto" in un intervento, verrà salvato automaticamente qui.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                          <th className="py-3 px-4">Data</th>
                          <th className="py-3 px-4">Intervento</th>
                          <th className="py-3 px-4">Categoria</th>
                          <th className="py-3 px-4">Chilometraggio</th>
                          <th className="py-3 px-4">Costo</th>
                          <th className="py-3 px-4">Note / Officina</th>
                          <th className="py-3 px-4 text-right">Azioni</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {activeVehicle.history.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                              {formatDateIT(entry.date)}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-900">{entry.interventionTitle}</td>
                            <td className="py-3 px-4 text-xs text-slate-600">{entry.category}</td>
                            <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                              {entry.km !== null && entry.km !== undefined ? `${formatNumberIT(entry.km)} km` : '—'}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                              {entry.cost !== null && entry.cost !== undefined && entry.cost !== ''
                                ? `€ ${formatNumberIT(entry.cost)}`
                                : '—'}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">{entry.notes || '—'}</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDeleteHistoryItem(entry.id)}
                                title="Elimina voce dallo storico"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
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

      {/* ========================================================================== */}
      {/* MODALE 1: SEGNA INTERVENTO COME FATTO (Data + Km + Ricalcolo Scadenza)     */}
      {/* ========================================================================== */}
      {completeModalItem && activeVehicle && (
        <CompleteInterventionModal
          item={completeModalItem}
          vehicleCurrentKm={activeVehicle.currentKm}
          onClose={() => setCompleteModalItem(null)}
          onConfirm={handleConfirmCompleteIntervention}
        />
      )}

      {/* ========================================================================== */}
      {/* MODALE 2: CREA O MODIFICA VEICOLO                                          */}
      {/* ========================================================================== */}
      {vehicleModal.open && (
        <VehicleFormModal
          mode={vehicleModal.mode}
          initialData={vehicleModal.mode === 'edit' ? activeVehicle : null}
          onClose={() => setVehicleModal({ open: false, mode: 'create' })}
          onSave={handleSaveVehicle}
        />
      )}

      {/* ========================================================================== */}
      {/* MODALE 3: AGGIORNA CHILOMETRAGGIO ATTUALE AUTO                             */}
      {/* ========================================================================== */}
      {kmModalOpen && activeVehicle && (
        <UpdateKmModal
          vehicle={activeVehicle}
          onClose={() => setKmModalOpen(false)}
          onSave={handleUpdateCurrentKm}
        />
      )}

      {/* ========================================================================== */}
      {/* MODALE 4: AGGIUNGI / MODIFICA INTERVENTO PERSONALIZZATO                    */}
      {/* ========================================================================== */}
      {customInterventionModal.open && (
        <CustomInterventionModal
          editItem={customInterventionModal.editItem}
          vehicleCurrentKm={activeVehicle?.currentKm || 0}
          onClose={() => setCustomInterventionModal({ open: false, editItem: null })}
          onSave={handleSaveCustomOrEditedIntervention}
        />
      )}

      {/* ========================================================================== */}
      {/* MODALE 5: CONFERMA ELIMINAZIONE VEICOLO                                    */}
      {/* ========================================================================== */}
      {confirmDeleteVehicleOpen && activeVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Eliminare "{activeVehicle.name}"?</h3>
            <p className="text-sm text-slate-600">
              Verranno rimossi definitivamente tutti gli interventi e lo storico associati a questo veicolo.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteVehicleOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Annulla
              </button>
              <button
                onClick={handleDeleteVehicle}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white"
              >
                Sì, Elimina Veicolo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SOTTO-COMPONENTI MODALI
// ============================================================================

function CompleteInterventionModal({ item, vehicleCurrentKm, onClose, onConfirm }) {
  const [date, setDate] = useState(getTodayISO());
  const [km, setKm] = useState(vehicleCurrentKm ?? '');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  // Anteprima live della prossima scadenza calcolata
  const previewNextDate = useMemo(() => {
    return item.freqMonths && date ? addMonthsToDate(date, item.freqMonths) : null;
  }, [date, item.freqMonths]);

  const previewNextKm = useMemo(() => {
    return item.freqKm && km !== '' && !isNaN(Number(km)) ? Number(km) + Number(item.freqKm) : null;
  }, [km, item.freqKm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) return;
    onConfirm({ date, km, cost, notes });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-teal-400 font-semibold">
              Registra Esecuzione Intervento
            </span>
            <h3 className="font-bold text-base sm:text-lg leading-snug">{item.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Data Intervento *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Km dell'Auto al momento *
              </label>
              <input
                type="number"
                required
                min="0"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="Es. 68500"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              {Number(km) > Number(vehicleCurrentKm) && (
                <p className="text-[11px] text-teal-700 font-medium mt-1">
                  Aggiornerà anche i km attuali del veicolo a {formatNumberIT(km)} km
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Costo Sostenuto (€) <span className="text-slate-400 font-normal">(opzionale)</span>
              </label>
              <div className="relative">
                <Euro className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Officina / Note <span className="text-slate-400 font-normal">(opzionale)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Es. Officina Rossi, olio 5W-30..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* ANTEPRIMA NUOVA SCADENZA */}
          {(previewNextDate || previewNextKm !== null) && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Nuova scadenza calcolata automaticamente:
              </div>
              <div className="text-sm text-emerald-950 font-semibold pl-5">
                {previewNextDate && <span>Data: {formatDateIT(previewNextDate)}</span>}
                {previewNextDate && previewNextKm !== null && <span> • </span>}
                {previewNextKm !== null && <span>Chilometraggio: {formatNumberIT(previewNextKm)} km</span>}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white shadow-sm"
            >
              <Check className="w-4 h-4" />
              Conferma e Riavvia Conteggio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VehicleFormModal({ mode, initialData, onClose, onSave }) {
  const [name, setName] = useState(initialData?.name || '');
  const [plate, setPlate] = useState(initialData?.plate || '');
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());
  const [fuelType, setFuelType] = useState(initialData?.fuelType || 'Benzina');
  const [currentKm, setCurrentKm] = useState(initialData?.currentKm ?? '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, plate, year, fuelType, currentKm });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <h3 className="font-bold text-lg">
            {mode === 'create' ? 'Configura La Tua Auto' : 'Modifica Dati Veicolo'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Marca e Modello Auto *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Fiat Panda 1.2 / Toyota Yaris Hybrid"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Targa
              </label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="Es. AB 123 CD"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Anno Immatricolazione
              </label>
              <input
                type="number"
                min="1960"
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Alimentazione *
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {FUEL_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Km Attuali *
              </label>
              <input
                type="number"
                required
                min="0"
                value={currentKm}
                onChange={(e) => setCurrentKm(e.target.value)}
                placeholder="Es. 45000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {mode === 'create' && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900">
              In base all’alimentazione <strong>{fuelType}</strong>, verranno generati automaticamente tutti gli interventi specifici, tasse e scadenze.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white"
            >
              {mode === 'create' ? 'Crea Veicolo' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateKmModal({ vehicle, onClose, onSave }) {
  const [km, setKm] = useState(vehicle.currentKm);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(km);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">Aggiorna Chilometraggio</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Inserisci i chilometri attuali letti sul contachilometri di <strong>{vehicle.name}</strong> per ricalcolare tutte le scadenze chilometriche.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Chilometri Attuali
            </label>
            <input
              type="number"
              required
              min="0"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white"
            >
              Aggiorna Km
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomInterventionModal({ editItem, vehicleCurrentKm, onClose, onSave }) {
  const [title, setTitle] = useState(editItem?.title || '');
  const [category, setCategory] = useState(editItem?.category || 'Motore & Tagliando');
  const [mandatory, setMandatory] = useState(editItem?.mandatory || 'Consigliato');
  const [freqMonths, setFreqMonths] = useState(editItem?.freqMonths ?? 12);
  const [freqKm, setFreqKm] = useState(editItem?.freqKm ?? '');
  const [description, setDescription] = useState(editItem?.description || '');
  const [details, setDetails] = useState(editItem?.details || '');
  const [lastDate, setLastDate] = useState('');
  const [lastKm, setLastKm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title,
      category,
      mandatory,
      freqMonths,
      freqKm,
      description,
      details,
      lastDate,
      lastKm
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <h3 className="font-bold text-lg">
            {editItem ? 'Modifica Intervento' : 'Nuovo Intervento Personalizzato'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Nome Intervento / Scadenza *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Controllo ammortizzatori / Lavaggio cambio automatico"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {CATEGORIES.filter((c) => c !== 'Tutte').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Livello Priorità
              </label>
              <select
                value={mandatory}
                onChange={(e) => setMandatory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {MANDATORY_LEVELS.filter((m) => m !== 'Tutti').map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Frequenza in Mesi
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={freqMonths}
                onChange={(e) => setFreqMonths(e.target.value)}
                placeholder="Es. 12 (vuoto se solo km)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Frequenza in Km
              </label>
              <input
                type="number"
                min="500"
                step="500"
                value={freqKm}
                onChange={(e) => setFreqKm(e.target.value)}
                placeholder="Es. 15000 (opzionale)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              In cosa consiste (Descrizione breve)
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Spiega cosa viene controllato o sostituito..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Dettagli tecnici / Consigli (opzionale)
            </label>
            <textarea
              rows="2"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Approfondimenti su perché è importante farlo..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {!editItem && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700">
                Ultima esecuzione (opzionale, puoi registrarla anche dopo):
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
                <input
                  type="number"
                  min="0"
                  value={lastKm}
                  onChange={(e) => setLastKm(e.target.value)}
                  placeholder={`Km (attuali: ${vehicleCurrentKm})`}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white"
            >
              {editItem ? 'Salva Modifiche' : 'Aggiungi Intervento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}