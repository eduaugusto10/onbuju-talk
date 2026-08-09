import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  UIManager,
  View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { arasaacService } from './services/arasaacService';
import { getCachedImageUri, getImageCacheMetrics, warmImageCache } from './services/imageCacheService';
import { generateNormalizedPhrase, saveAiApiKey } from './services/aiService';
import * as ImagePicker from 'expo-image-picker';
import {
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets
} from 'expo-audio';
import {
  CustomCategory,
  CustomSymbol,
  HistoryPhrase,
  PersonalSymbol,
  RoutineDay,
  RoutineProgress,
  RoutineStep,
  SavedPhrase,
  SymbolItem,
  VisualScene,
  VisualSceneHotspot
} from './types';
import { NUNITO_FONT_MAP, resolveTheme, type Theme, type ThemeName } from './theme';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { IOSBottomSheet } from './ui';
import { triggerHaptic } from './services/hapticsService';
import {
  CORE_VOCABULARY_MAX,
  CUSTOM_CATEGORIES_MAX,
  DEFAULT_CORE_VOCABULARY,
  DEFAULT_SAVED_PHRASES,
  PERSONAL_SYMBOLS_MAX,
  PHRASE_HISTORY_MAX,
  ROUTINE_STEPS_MAX,
  SAVED_PHRASES_MAX
} from './constants';
import { deletePersonalSymbolImage, savePersonalSymbolImage } from './services/personalSymbolsService';
import { deletePersonalAudioFile, savePersonalAudioFile } from './services/personalAudioService';
import { categoryColorFamily } from './categoryColors';

type ToastState = { message: string; type: 'success' | 'error' } | null;
type UiScale = 'compacto' | 'padrao' | 'confortavel';
type ConfigRoute =
  | 'home'
  | 'voz' | 'acessibilidade' | 'aparencia'
  | 'vocabulario' | 'frases' | 'simbolos' | 'categorias' | 'rotina' | 'cenas'
  | 'secoes'
  | 'senha' | 'chave-ia';

type SectionVisibility = {
  frases: boolean;
  historico: boolean;
  rotina: boolean;
  cenas: boolean;
};

// Frases, Histórico, Rotina e Cenas começam OCULTAS — o cuidador liga o que
// quiser em Configurações → Abas visíveis. Mantém a tela principal enxuta para
// o público autista (menos abas competindo por atenção).
const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  frases: false,
  historico: false,
  rotina: false,
  cenas: false
};

function sanitizeSectionVisibility(raw: string | null): SectionVisibility {
  if (!raw) return DEFAULT_SECTION_VISIBILITY;
  try {
    const parsed = JSON.parse(raw);
    return {
      frases: typeof parsed?.frases === 'boolean' ? parsed.frases : false,
      historico: typeof parsed?.historico === 'boolean' ? parsed.historico : false,
      rotina: typeof parsed?.rotina === 'boolean' ? parsed.rotina : false,
      cenas: typeof parsed?.cenas === 'boolean' ? parsed.cenas : false
    };
  } catch {
    return DEFAULT_SECTION_VISIBILITY;
  }
}
type GridColumns = 2 | 3 | 4 | 5;

const GRID_COLUMNS_OPTIONS: GridColumns[] = [2, 3, 4, 5];
const DEFAULT_GRID_COLUMNS: GridColumns = 3;
const MIN_GRID_COLUMNS = 2;
const MAX_GRID_COLUMNS = 5;
const DEFAULT_AI_API_KEY = (process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '').trim();

const STORAGE_KEYS = {
  favorites: 'arasaac_favorites',
  customSymbols: 'arasaac_custom_symbols',
  pitch: 'arasaac_pitch',
  rate: 'arasaac_rate',
  adminPasswordHash: 'admin_password_hash',
  uiScale: 'ui_scale',
  themeName: 'theme_name',
  themeDarkReset: 'theme_dark_reset_v1',
  visualFeedback: 'visual_feedback',
  sectionVisibility: 'section_visibility',
  gridColumns: 'grid_columns',
  coreVocabulary: 'core_vocabulary',
  savedPhrases: 'arasaac_saved_phrases',
  phraseHistory: 'arasaac_phrase_history',
  personalSymbols: 'arasaac_personal_symbols',
  customCategories: 'arasaac_custom_categories',
  routineSteps: 'arasaac_routine_steps',
  routineProgress: 'arasaac_routine_progress',
  visualScenes: 'arasaac_visual_scenes'
};

const VISUAL_SCENES_MAX = 20;
const HOTSPOTS_PER_SCENE_MAX = 12;
const HOTSPOT_DEFAULT_RADIUS = 0.08;

const ROUTINE_DAYS: RoutineDay[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
const ROUTINE_DAY_LABELS: Record<RoutineDay, string> = {
  seg: 'Seg',
  ter: 'Ter',
  qua: 'Qua',
  qui: 'Qui',
  sex: 'Sex',
  sab: 'Sáb',
  dom: 'Dom'
};
function getTodayRoutineDay(): RoutineDay {
  // Date.getDay(): 0 = domingo, 1 = segunda, ..., 6 = sábado
  const map: RoutineDay[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  return map[new Date().getDay()];
}

const normalizeCoreWord = (word: string) => word.trim().toLowerCase();

function sanitizeCoreVocabulary(words: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of words) {
    if (typeof raw !== 'string') continue;
    const normalized = normalizeCoreWord(raw);
    if (!normalized) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= CORE_VOCABULARY_MAX) break;
  }
  return result;
}

const normalizeSpokenText = (text: string) => text.replace(/\s+/g, ' ').trim();

function buildDefaultSavedPhrases(): SavedPhrase[] {
  return DEFAULT_SAVED_PHRASES.map((text, index) => ({
    id: `default-phrase-${index}`,
    text: normalizeSpokenText(text),
    createdAt: new Date(0).toISOString()
  })).filter(phrase => phrase.text.length > 0);
}

function sanitizeSavedPhrases(raw: unknown): SavedPhrase[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const result: SavedPhrase[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const candidate = entry as Partial<SavedPhrase>;
    const text = typeof candidate.text === 'string' ? normalizeSpokenText(candidate.text) : '';
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const id = typeof candidate.id === 'string' && candidate.id ? candidate.id : `phrase-${Date.now()}-${result.length}`;
    const createdAt = typeof candidate.createdAt === 'string' && candidate.createdAt ? candidate.createdAt : new Date().toISOString();
    result.push({ id, text, createdAt });
    if (result.length >= SAVED_PHRASES_MAX) break;
  }
  return result;
}

function sanitizePersonalSymbols(raw: unknown): PersonalSymbol[] {
  if (!Array.isArray(raw)) return [];
  const result: PersonalSymbol[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const candidate = entry as Partial<PersonalSymbol>;
    const label = typeof candidate.label === 'string' ? candidate.label.trim() : '';
    const imageUri = typeof candidate.imageUri === 'string' ? candidate.imageUri.trim() : '';
    if (!label || !imageUri) continue;
    const id = typeof candidate.id === 'string' && candidate.id ? candidate.id : `personal-${Date.now()}-${result.length}`;
    const categoryId = typeof candidate.categoryId === 'string' && candidate.categoryId ? candidate.categoryId : null;
    const audioUri = typeof candidate.audioUri === 'string' && candidate.audioUri ? candidate.audioUri : null;
    const createdAt = typeof candidate.createdAt === 'string' && candidate.createdAt ? candidate.createdAt : new Date().toISOString();
    result.push({ id, label, categoryId, imageUri, audioUri, createdAt });
    if (result.length >= PERSONAL_SYMBOLS_MAX) break;
  }
  return result;
}

function sanitizeCustomCategories(raw: unknown): CustomCategory[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const result: CustomCategory[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const candidate = entry as Partial<CustomCategory>;
    const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const id = typeof candidate.id === 'string' && candidate.id ? candidate.id : `cat-${Date.now()}-${result.length}`;
    const createdAt = typeof candidate.createdAt === 'string' && candidate.createdAt ? candidate.createdAt : new Date().toISOString();
    result.push({ id, name, createdAt });
    if (result.length >= CUSTOM_CATEGORIES_MAX) break;
  }
  return result;
}

function sanitizeRoutineSteps(raw: unknown): RoutineStep[] {
  if (!Array.isArray(raw)) return [];
  const result: RoutineStep[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const candidate = entry as Partial<RoutineStep>;
    const label = typeof candidate.label === 'string' ? candidate.label.trim() : '';
    if (!label) continue;
    const id = typeof candidate.id === 'string' && candidate.id ? candidate.id : `step-${Date.now()}-${result.length}`;
    const imageUri = typeof candidate.imageUri === 'string' && candidate.imageUri ? candidate.imageUri : null;
    const audioUri = typeof candidate.audioUri === 'string' && candidate.audioUri ? candidate.audioUri : null;
    const createdAt = typeof candidate.createdAt === 'string' && candidate.createdAt ? candidate.createdAt : new Date().toISOString();
    let activeDays: RoutineDay[] | undefined;
    if (Array.isArray(candidate.activeDays)) {
      const filtered = candidate.activeDays.filter((d): d is RoutineDay => typeof d === 'string' && (ROUTINE_DAYS as string[]).includes(d));
      activeDays = filtered.length > 0 ? filtered : undefined;
    }
    result.push({ id, label, imageUri, audioUri, activeDays, createdAt });
    if (result.length >= ROUTINE_STEPS_MAX) break;
  }
  return result;
}

function sanitizeVisualScenes(raw: unknown): VisualScene[] {
  if (!Array.isArray(raw)) return [];
  const result: VisualScene[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const candidate = entry as Partial<VisualScene>;
    const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
    const photoUri = typeof candidate.photoUri === 'string' && candidate.photoUri ? candidate.photoUri : '';
    if (!name || !photoUri) continue;
    const id = typeof candidate.id === 'string' && candidate.id ? candidate.id : `scene-${Date.now()}-${result.length}`;
    const createdAt = typeof candidate.createdAt === 'string' && candidate.createdAt ? candidate.createdAt : new Date().toISOString();
    const hotspots: VisualSceneHotspot[] = [];
    if (Array.isArray(candidate.hotspots)) {
      for (const h of candidate.hotspots) {
        if (!h || typeof h !== 'object') continue;
        const hc = h as Partial<VisualSceneHotspot>;
        const hLabel = typeof hc.label === 'string' ? hc.label.trim() : '';
        if (!hLabel) continue;
        const x = typeof hc.x === 'number' && isFinite(hc.x) ? Math.min(1, Math.max(0, hc.x)) : 0.5;
        const y = typeof hc.y === 'number' && isFinite(hc.y) ? Math.min(1, Math.max(0, hc.y)) : 0.5;
        const radius = typeof hc.radius === 'number' && isFinite(hc.radius) && hc.radius > 0
          ? Math.min(0.3, Math.max(0.03, hc.radius))
          : HOTSPOT_DEFAULT_RADIUS;
        const audioUri = typeof hc.audioUri === 'string' && hc.audioUri ? hc.audioUri : null;
        const hId = typeof hc.id === 'string' && hc.id ? hc.id : `hs-${Date.now()}-${hotspots.length}`;
        hotspots.push({ id: hId, label: hLabel, audioUri, x, y, radius });
        if (hotspots.length >= HOTSPOTS_PER_SCENE_MAX) break;
      }
    }
    result.push({ id, name, photoUri, hotspots, createdAt });
    if (result.length >= VISUAL_SCENES_MAX) break;
  }
  return result;
}

function sanitizeRoutineProgress(raw: unknown): RoutineProgress {
  const today = getTodayIso();
  if (!raw || typeof raw !== 'object') return { date: today, completedStepIds: [] };
  const candidate = raw as Partial<RoutineProgress>;
  const date = typeof candidate.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(candidate.date) ? candidate.date : today;
  if (date !== today) {
    return { date: today, completedStepIds: [] };
  }
  const ids = Array.isArray(candidate.completedStepIds)
    ? candidate.completedStepIds.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];
  return { date, completedStepIds: ids };
}

function sanitizePhraseHistory(raw: unknown): HistoryPhrase[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const result: HistoryPhrase[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const candidate = entry as Partial<HistoryPhrase>;
    const text = typeof candidate.text === 'string' ? normalizeSpokenText(candidate.text) : '';
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const id = typeof candidate.id === 'string' && candidate.id ? candidate.id : `history-${Date.now()}-${result.length}`;
    const spokenAt = typeof candidate.spokenAt === 'string' && candidate.spokenAt ? candidate.spokenAt : new Date().toISOString();
    result.push({ id, text, spokenAt });
    if (result.length >= PHRASE_HISTORY_MAX) break;
  }
  return result;
}

const CATEGORIES = {
  favorites: 'Favoritos',
  all: 'Tudo',
  custom: 'Customizados',
  savedPhrases: 'Frases',
  history: 'Historico',
  routine: 'Rotina',
  scenes: 'Cenas'
};

const CATEGORY_ICONS: Record<string, string> = {
  [CATEGORIES.favorites]: '⭐',
  [CATEGORIES.all]: '🔣',
  [CATEGORIES.custom]: '✏️',
  [CATEGORIES.savedPhrases]: '💬',
  [CATEGORIES.history]: '🕐',
  [CATEGORIES.routine]: '📅',
  [CATEGORIES.scenes]: '🖼️'
};

// Non-readers can't act on text-only labels, so every category tab carries an
// icon next to its word. Known tabs map to a specific emoji; dynamic ARASAAC or
// custom categories fall back to a generic tag.
function categoryIcon(label: string): string {
  return CATEGORY_ICONS[label] ?? '🏷️';
}

const getTodayIso = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MONTH_NAMES_PT = [
  'janeiro',
  'fevereiro',
  'marco',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro'
];

function formatTodayLabelPt(iso: string) {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  if (Number.isNaN(day) || Number.isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) return iso;
  return `Hoje, ${day} de ${MONTH_NAMES_PT[monthIdx]}`;
}

const normalizePhrase = (symbols: SymbolItem[]) => {
  const raw = symbols.map(item => item.label.trim().toLowerCase()).filter(Boolean).join(' ');
  if (!raw) return '';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

function hashSecret(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0).toString(16);
}

function normalizeGridColumns(value: string | null): GridColumns {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_GRID_COLUMNS;
  const clamped = Math.min(MAX_GRID_COLUMNS, Math.max(MIN_GRID_COLUMNS, Math.round(parsed)));
  return clamped as GridColumns;
}

const GRID_FILLER_PREFIX = '__grid_filler__';

// Pads a grid's data so the last row is always full. Without this, a lone card
// on an incomplete last row stretches to full width (flex: 1) and breaks the
// column alignment. Fillers carry a sentinel id and render as invisible spacers
// (see styles.gridFiller).
function padToColumns<T extends { id: string }>(
  data: T[],
  columns: number,
  makeFiller: (id: string) => T
): T[] {
  const remainder = data.length % columns;
  if (remainder === 0) return data;
  const fillers = Array.from({ length: columns - remainder }, (_, i) =>
    makeFiller(`${GRID_FILLER_PREFIX}${i}`)
  );
  return [...data, ...fillers];
}

function FalaApp() {
  const hasPrimedExtendedCache = useRef(false);
  const searchInputRef = useRef<TextInput>(null);
  const configScrollRef = useRef<ScrollView>(null);
  const [selectedSymbols, setSelectedSymbols] = useState<SymbolItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES.favorites);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [symbols, setSymbols] = useState<SymbolItem[]>([]);
  const [favorites, setFavorites] = useState<SymbolItem[]>([]);
  const [customSymbols, setCustomSymbols] = useState<CustomSymbol[]>([]);
  const [normalizedPhrase, setNormalizedPhrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [uiScale, setUiScale] = useState<UiScale>('padrao');
  const [themeName, setThemeName] = useState<ThemeName>('default');
  const [visualFeedbackEnabled, setVisualFeedbackEnabled] = useState(true);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>(DEFAULT_SECTION_VISIBILITY);
  const [gridColumns, setGridColumns] = useState<GridColumns>(DEFAULT_GRID_COLUMNS);
  const [coreVocabulary, setCoreVocabulary] = useState<string[]>(() => sanitizeCoreVocabulary(DEFAULT_CORE_VOCABULARY));
  const [newCoreWord, setNewCoreWord] = useState('');
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>(() => buildDefaultSavedPhrases());
  const [phraseHistory, setPhraseHistory] = useState<HistoryPhrase[]>([]);
  const [newPhraseInput, setNewPhraseInput] = useState('');
  const [editingPhraseId, setEditingPhraseId] = useState<string | null>(null);
  const [editingPhraseText, setEditingPhraseText] = useState('');
  const [personalSymbols, setPersonalSymbols] = useState<PersonalSymbol[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [pickerBusy, setPickerBusy] = useState(false);
  const [pendingSymbolImage, setPendingSymbolImage] = useState<string | null>(null);
  const [pendingSymbolLabel, setPendingSymbolLabel] = useState('');
  const [pendingSymbolCategoryId, setPendingSymbolCategoryId] = useState<string | null>(null);
  const [isSymbolDraftOpen, setIsSymbolDraftOpen] = useState(false);
  const [newCustomCategoryName, setNewCustomCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [draftAudioUri, setDraftAudioUri] = useState<string | null>(null);
  const [audioSymbolId, setAudioSymbolId] = useState<string | null>(null);
  const [routineSteps, setRoutineSteps] = useState<RoutineStep[]>([]);
  const [routineProgress, setRoutineProgress] = useState<RoutineProgress>(() => ({ date: getTodayIso(), completedStepIds: [] }));
  const [routineDraft, setRoutineDraft] = useState<{ imageUri: string; audioUri: string | null; label: string; activeDays: RoutineDay[] } | null>(null);
  const [isRoutineSymbolPickerOpen, setIsRoutineSymbolPickerOpen] = useState(false);
  const [visualScenes, setVisualScenes] = useState<VisualScene[]>([]);
  const [editingScene, setEditingScene] = useState<VisualScene | null>(null);
  const [viewerScene, setViewerScene] = useState<VisualScene | null>(null);
  const [hotspotRecordingId, setHotspotRecordingId] = useState<string | null>(null);
  const audioPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 200);
  const [isBootHydrating, setIsBootHydrating] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configRoute, setConfigRoute] = useState<ConfigRoute>('home');
  const [adminPassword, setAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [aiApiKeyInput, setAiApiKeyInput] = useState(DEFAULT_AI_API_KEY);
  const [adminPasswordHash, setAdminPasswordHash] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [fontsLoaded] = useFonts(NUNITO_FONT_MAP);
  const theme = useMemo(() => resolveTheme(themeName), [themeName]);
  const styles = useMemo(() => makeStyles(theme), [theme]);
  // Espelha tema e estilos resolvidos em escopo de modulo para que os
  // componentes auxiliares (CategoryButton, SymbolCard, etc.) — definidos
  // fora de App — leiam o tema ativo. Eles sempre renderizam como filhos de
  // App, entao o espelho ja esta atualizado quando renderizam.
  moduleTheme = theme;
  moduleStyles = styles;
  const needsAdminSetup = !adminPasswordHash;
  const uiScaleFactor = uiScale === 'compacto' ? 0.92 : uiScale === 'confortavel' ? 1.08 : 1;
  const isDarkTheme = theme.isDark;
  const isHighContrast = isDarkTheme;
  const effectiveGridColumns: GridColumns = gridColumns;
  const androidTopInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
  const safeAreaInsets = useSafeAreaInsets();
  const androidBottomInset = Platform.OS === 'android' ? safeAreaInsets.bottom : 0;

  const phraseText = useMemo(() => {
    return normalizedPhrase || selectedSymbols.map(s => s.label.toUpperCase()).join(' + ');
  }, [normalizedPhrase, selectedSymbols]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const resetConfigFields = useCallback(() => {
    setAdminPassword('');
    setNewAdminPassword('');
    setConfirmAdminPassword('');
    setAiApiKeyInput(DEFAULT_AI_API_KEY);
    setConfigRoute('home');
  }, []);

  const openConfigModal = useCallback(() => {
    resetConfigFields();
    setIsConfigModalOpen(true);
  }, [resetConfigFields]);

  const handleAdminLogin = useCallback(() => {
    if (!adminPasswordHash) {
      showToast('Cadastre uma senha de admin primeiro.', 'error');
      return;
    }
    if (hashSecret(adminPassword) === adminPasswordHash) {
      setIsAdmin(true);
      setIsConfigModalOpen(false);
      resetConfigFields();
      showToast('Modo administrador ativado.', 'success');
      return;
    }
    showToast('Senha inválida.', 'error');
  }, [adminPassword, adminPasswordHash, resetConfigFields, showToast]);

  const handleSaveAdminPassword = useCallback(async () => {
    const password = newAdminPassword.trim();
    if (password.length < 4) {
      showToast('A senha precisa ter pelo menos 4 caracteres.', 'error');
      return;
    }
    if (password !== confirmAdminPassword.trim()) {
      showToast('As senhas não conferem.', 'error');
      return;
    }

    const passwordHash = hashSecret(password);
    await AsyncStorage.setItem(STORAGE_KEYS.adminPasswordHash, passwordHash);
    setAdminPasswordHash(passwordHash);
    setIsAdmin(true);
    setIsConfigModalOpen(false);
    resetConfigFields();
    showToast('Senha de administrador salva com sucesso.', 'success');
  }, [confirmAdminPassword, newAdminPassword, resetConfigFields, showToast]);

  const handleUpdateAdminPassword = useCallback(async () => {
    if (!adminPasswordHash || hashSecret(adminPassword) !== adminPasswordHash) {
      showToast('Senha atual inválida.', 'error');
      return;
    }
    const password = newAdminPassword.trim();
    if (password.length < 4) {
      showToast('A nova senha precisa ter pelo menos 4 caracteres.', 'error');
      return;
    }
    if (password !== confirmAdminPassword.trim()) {
      showToast('As novas senhas não conferem.', 'error');
      return;
    }

    const nextHash = hashSecret(password);
    await AsyncStorage.setItem(STORAGE_KEYS.adminPasswordHash, nextHash);
    setAdminPasswordHash(nextHash);
    setIsConfigModalOpen(false);
    resetConfigFields();
    showToast('Senha de administrador atualizada.', 'success');
  }, [adminPassword, adminPasswordHash, confirmAdminPassword, newAdminPassword, resetConfigFields, showToast]);

  const handleSaveAiKey = useCallback(async () => {
    const key = aiApiKeyInput.trim();
    if (!key) {
      showToast('Informe uma chave da IA válida.', 'error');
      return;
    }
    await saveAiApiKey(key);
    setAiApiKeyInput(key);
    showToast('Chave da IA salva no dispositivo.', 'success');
  }, [aiApiKeyInput, showToast]);

  const handleAdminLogout = useCallback(() => {
    setIsAdmin(false);
    setIsMenuOpen(false);
    showToast('Modo usuário ativado.', 'success');
  }, [showToast]);

  const openConfigRoute = useCallback((route: ConfigRoute) => {
    // Grupo "App" (voz/acessibilidade/aparencia) e sempre livre.
    const APP_ROUTES: ConfigRoute[] = ['voz', 'acessibilidade', 'aparencia'];
    if (route === 'home') { setConfigRoute('home'); return; }
    if (!isAdmin && !APP_ROUTES.includes(route)) {
      // Cuidador deslogado tentando entrar em grupo protegido: enviar para o gate de senha.
      setConfigRoute('senha');
      return;
    }
    setConfigRoute(route);
  }, [isAdmin]);

  const SECTION_TO_CATEGORY: Record<keyof SectionVisibility, string> = {
    frases: CATEGORIES.savedPhrases,
    historico: CATEGORIES.history,
    rotina: CATEGORIES.routine,
    cenas: CATEGORIES.scenes
  };

  const toggleSection = useCallback((key: keyof SectionVisibility) => {
    // If turning a section OFF while it's the open tab, fall back to "Tudo" so
    // the main screen never shows a section whose tab no longer exists.
    if (sectionVisibility[key] && activeCategory === SECTION_TO_CATEGORY[key]) {
      setActiveCategory(CATEGORIES.all);
    }
    setSectionVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  }, [sectionVisibility, activeCategory]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    const loadLocalData = async () => {
      try {
        const [
          savedFavorites,
          savedCustomSymbols,
          savedRate,
          savedPitch,
          savedAdminPasswordHash,
          savedUiScale,
          savedThemeName,
          savedLegacyContrast,
          savedThemeDarkReset,
          savedVisualFeedback,
          savedSectionVisibility,
          savedGridColumns,
          savedCoreVocabulary,
          savedPhrasesRaw,
          savedPhraseHistory,
          savedPersonalSymbols,
          savedCustomCategories,
          savedRoutineSteps,
          savedRoutineProgress,
          savedVisualScenes
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.favorites),
          AsyncStorage.getItem(STORAGE_KEYS.customSymbols),
          AsyncStorage.getItem(STORAGE_KEYS.rate),
          AsyncStorage.getItem(STORAGE_KEYS.pitch),
          AsyncStorage.getItem(STORAGE_KEYS.adminPasswordHash),
          AsyncStorage.getItem(STORAGE_KEYS.uiScale),
          AsyncStorage.getItem(STORAGE_KEYS.themeName),
          AsyncStorage.getItem('contrast_mode'),
          AsyncStorage.getItem(STORAGE_KEYS.themeDarkReset),
          AsyncStorage.getItem(STORAGE_KEYS.visualFeedback),
          AsyncStorage.getItem(STORAGE_KEYS.sectionVisibility),
          AsyncStorage.getItem(STORAGE_KEYS.gridColumns),
          AsyncStorage.getItem(STORAGE_KEYS.coreVocabulary),
          AsyncStorage.getItem(STORAGE_KEYS.savedPhrases),
          AsyncStorage.getItem(STORAGE_KEYS.phraseHistory),
          AsyncStorage.getItem(STORAGE_KEYS.personalSymbols),
          AsyncStorage.getItem(STORAGE_KEYS.customCategories),
          AsyncStorage.getItem(STORAGE_KEYS.routineSteps),
          AsyncStorage.getItem(STORAGE_KEYS.routineProgress),
          AsyncStorage.getItem(STORAGE_KEYS.visualScenes)
        ]);

        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        if (savedCustomSymbols) {
          setCustomSymbols(JSON.parse(savedCustomSymbols));
        }
        if (savedRate) {
          setRate(Number(savedRate));
        }
        if (savedPitch) {
          setPitch(Number(savedPitch));
        }
        if (savedAdminPasswordHash) {
          setAdminPasswordHash(savedAdminPasswordHash);
        }
        if (savedUiScale === 'compacto' || savedUiScale === 'padrao' || savedUiScale === 'confortavel') {
          setUiScale(savedUiScale);
        }
        if (
          savedThemeDarkReset !== '1' &&
          (savedThemeName === 'sereno-escuro' || savedLegacyContrast === 'alto')
        ) {
          // One-time reset: dark mode here was almost always an accidental
          // carry-over from the legacy 'alto contraste' migration, not a
          // deliberate choice — and it landed users on a cold, half-broken dark
          // screen. Reset to the calm light default once. After this, the theme
          // picker is fully respected (re-selecting Sereno Escuro sticks).
          setThemeName('default');
          void AsyncStorage.setItem(STORAGE_KEYS.themeName, 'default');
          void AsyncStorage.setItem(STORAGE_KEYS.themeDarkReset, '1');
          void AsyncStorage.removeItem('contrast_mode');
        } else if (
          savedThemeName === 'default' ||
          savedThemeName === 'terracota' ||
          savedThemeName === 'sereno-escuro'
        ) {
          setThemeName(savedThemeName);
        } else {
          // 'padrao' ou ausente -> tema padrao claro.
          setThemeName('default');
          void AsyncStorage.setItem(STORAGE_KEYS.themeName, 'default');
          void AsyncStorage.removeItem('contrast_mode');
        }
        if (savedVisualFeedback) {
          setVisualFeedbackEnabled(savedVisualFeedback === '1');
        }
        setSectionVisibility(sanitizeSectionVisibility(savedSectionVisibility));
        setGridColumns(normalizeGridColumns(savedGridColumns));

        if (savedCoreVocabulary) {
          try {
            const parsed = JSON.parse(savedCoreVocabulary);
            if (Array.isArray(parsed)) {
              const sanitized = sanitizeCoreVocabulary(parsed);
              if (sanitized.length > 0) {
                setCoreVocabulary(sanitized);
              }
            }
          } catch {
            /* keep default */
          }
        }

        if (savedPhrasesRaw) {
          try {
            const parsed = JSON.parse(savedPhrasesRaw);
            const sanitized = sanitizeSavedPhrases(parsed);
            if (sanitized.length > 0) {
              setSavedPhrases(sanitized);
            } else {
              setSavedPhrases([]);
            }
          } catch {
            /* keep default */
          }
        }

        if (savedPhraseHistory) {
          try {
            const parsed = JSON.parse(savedPhraseHistory);
            setPhraseHistory(sanitizePhraseHistory(parsed));
          } catch {
            /* keep empty */
          }
        }

        if (savedPersonalSymbols) {
          try {
            setPersonalSymbols(sanitizePersonalSymbols(JSON.parse(savedPersonalSymbols)));
          } catch {
            /* keep empty */
          }
        }

        if (savedCustomCategories) {
          try {
            setCustomCategories(sanitizeCustomCategories(JSON.parse(savedCustomCategories)));
          } catch {
            /* keep empty */
          }
        }

        if (savedRoutineSteps) {
          try {
            setRoutineSteps(sanitizeRoutineSteps(JSON.parse(savedRoutineSteps)));
          } catch {
            /* keep empty */
          }
        }

        if (savedRoutineProgress) {
          try {
            setRoutineProgress(sanitizeRoutineProgress(JSON.parse(savedRoutineProgress)));
          } catch {
            setRoutineProgress({ date: getTodayIso(), completedStepIds: [] });
          }
        } else {
          setRoutineProgress({ date: getTodayIso(), completedStepIds: [] });
        }

        if (savedVisualScenes) {
          try {
            setVisualScenes(sanitizeVisualScenes(JSON.parse(savedVisualScenes)));
          } catch {
            /* keep empty */
          }
        }
      } finally {
        setIsBootHydrating(false);
      }
    };

    const loadInitialSymbols = async () => {
      setIsLoading(true);
      try {
        const [symbolsData, categoriesData] = await Promise.all([
          arasaacService.getBestSymbols('pt'),
          arasaacService.getCategories('pt')
        ]);
        setSymbols(symbolsData);
        setCategories(categoriesData);
      } finally {
        setIsLoading(false);
      }
    };

    void loadLocalData();
    void loadInitialSymbols();
  }, []);

  useEffect(() => {
    // iOS silences audio when the device's ring switch is on silent; play TTS
    // and recordings anyway so the app works without asking the user to flip
    // the physical switch (was previously surfaced as a red toast on every play).
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.customSymbols, JSON.stringify(customSymbols));
  }, [customSymbols]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.rate, String(rate));
  }, [rate]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.pitch, String(pitch));
  }, [pitch]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.uiScale, uiScale);
  }, [uiScale]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.themeName, themeName);
  }, [themeName]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.visualFeedback, visualFeedbackEnabled ? '1' : '0');
  }, [visualFeedbackEnabled]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.sectionVisibility, JSON.stringify(sectionVisibility));
  }, [sectionVisibility]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.gridColumns, String(gridColumns));
  }, [gridColumns]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.coreVocabulary, JSON.stringify(coreVocabulary));
  }, [coreVocabulary]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.savedPhrases, JSON.stringify(savedPhrases));
  }, [savedPhrases]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.phraseHistory, JSON.stringify(phraseHistory));
  }, [phraseHistory]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.personalSymbols, JSON.stringify(personalSymbols));
  }, [personalSymbols]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.customCategories, JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.routineSteps, JSON.stringify(routineSteps));
  }, [routineSteps]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.routineProgress, JSON.stringify(routineProgress));
  }, [routineProgress]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.visualScenes, JSON.stringify(visualScenes));
  }, [visualScenes]);

  const toggleFavorite = useCallback((symbol: SymbolItem) => {
    if (!isAdmin) {
      showToast('Somente admin pode alterar favoritos.', 'error');
      return;
    }

    setFavorites(prev => {
      const exists = prev.some(item => item.id === symbol.id || item.label.toLowerCase() === symbol.label.toLowerCase());
      if (exists) {
        return prev.filter(item => item.id !== symbol.id && item.label.toLowerCase() !== symbol.label.toLowerCase());
      }
      return [symbol, ...prev];
    });
  }, [isAdmin, showToast]);

  const isFavorite = useCallback(
    (symbol: SymbolItem) => favorites.some(item => item.id === symbol.id || item.label.toLowerCase() === symbol.label.toLowerCase()),
    [favorites]
  );

  const addSymbol = useCallback((symbol: SymbolItem) => {
    triggerHaptic('light');
    setSelectedSymbols(prev => [...prev, symbol]);
    setNormalizedPhrase(prev => (prev ? `${prev} ${symbol.label}` : prev));
  }, []);

  const addCoreWord = useCallback((word: string) => {
    const normalized = normalizeCoreWord(word);
    if (!normalized) return;
    const slug = normalized.replace(/\s+/g, '-');
    addSymbol({
      id: `core-${slug}-${Date.now()}`,
      label: normalized,
      imageUrl: '',
      category: 'core'
    });
  }, [addSymbol]);

  const addCoreVocabularyWord = useCallback(() => {
    const normalized = normalizeCoreWord(newCoreWord);
    if (!normalized) {
      showToast('Digite uma palavra valida.', 'error');
      return;
    }
    if (coreVocabulary.length >= CORE_VOCABULARY_MAX) {
      showToast(`Maximo de ${CORE_VOCABULARY_MAX} palavras no core.`, 'error');
      return;
    }
    if (coreVocabulary.includes(normalized)) {
      showToast('Essa palavra ja esta no vocabulario core.', 'error');
      return;
    }
    setCoreVocabulary(prev => [...prev, normalized]);
    setNewCoreWord('');
  }, [coreVocabulary, newCoreWord, showToast]);

  const removeCoreVocabularyWord = useCallback((word: string) => {
    setCoreVocabulary(prev => prev.filter(item => item !== word));
  }, []);

  const moveCoreVocabularyWord = useCallback((word: string, direction: -1 | 1) => {
    setCoreVocabulary(prev => {
      const index = prev.indexOf(word);
      if (index === -1) return prev;
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  }, []);

  const resetCoreVocabulary = useCallback(() => {
    setCoreVocabulary(sanitizeCoreVocabulary(DEFAULT_CORE_VOCABULARY));
    showToast('Vocabulario core restaurado.', 'success');
  }, [showToast]);

  const recordPhraseHistory = useCallback((rawText: string) => {
    const normalized = normalizeSpokenText(rawText);
    if (!normalized) return;
    setPhraseHistory(prev => {
      const filtered = prev.filter(item => item.text.toLowerCase() !== normalized.toLowerCase());
      const entry: HistoryPhrase = {
        id: `history-${Date.now()}`,
        text: normalized,
        spokenAt: new Date().toISOString()
      };
      return [entry, ...filtered].slice(0, PHRASE_HISTORY_MAX);
    });
  }, []);

  const speakPhraseText = useCallback(
    (rawText: string) => {
      const text = normalizeSpokenText(rawText);
      if (!text) {
        showToast('Frase vazia.', 'error');
        return;
      }
      Speech.stop();
      Speech.speak(text, {
        language: 'pt-BR',
        rate,
        pitch,
        onError: () => showToast('Nao foi possivel reproduzir a voz.', 'error')
      });
      recordPhraseHistory(text);
    },
    [pitch, rate, recordPhraseHistory, showToast]
  );

  const addSavedPhrase = useCallback(() => {
    const text = normalizeSpokenText(newPhraseInput);
    if (!text) {
      showToast('Digite uma frase valida.', 'error');
      return;
    }
    if (savedPhrases.length >= SAVED_PHRASES_MAX) {
      showToast(`Maximo de ${SAVED_PHRASES_MAX} frases prontas.`, 'error');
      return;
    }
    if (savedPhrases.some(item => item.text.toLowerCase() === text.toLowerCase())) {
      showToast('Essa frase ja esta salva.', 'error');
      return;
    }
    const entry: SavedPhrase = {
      id: `phrase-${Date.now()}`,
      text,
      createdAt: new Date().toISOString()
    };
    setSavedPhrases(prev => [entry, ...prev]);
    setNewPhraseInput('');
  }, [newPhraseInput, savedPhrases, showToast]);

  const removeSavedPhrase = useCallback((id: string) => {
    setSavedPhrases(prev => prev.filter(item => item.id !== id));
    setEditingPhraseId(current => (current === id ? null : current));
  }, []);

  const startEditingPhrase = useCallback((phrase: SavedPhrase) => {
    setEditingPhraseId(phrase.id);
    setEditingPhraseText(phrase.text);
  }, []);

  const cancelEditingPhrase = useCallback(() => {
    setEditingPhraseId(null);
    setEditingPhraseText('');
  }, []);

  const commitEditingPhrase = useCallback(() => {
    if (!editingPhraseId) return;
    const text = normalizeSpokenText(editingPhraseText);
    if (!text) {
      showToast('Frase vazia.', 'error');
      return;
    }
    setSavedPhrases(prev => {
      const duplicated = prev.some(
        item => item.id !== editingPhraseId && item.text.toLowerCase() === text.toLowerCase()
      );
      if (duplicated) {
        showToast('Essa frase ja esta salva.', 'error');
        return prev;
      }
      return prev.map(item => (item.id === editingPhraseId ? { ...item, text } : item));
    });
    setEditingPhraseId(null);
    setEditingPhraseText('');
  }, [editingPhraseId, editingPhraseText, showToast]);

  const clearPhraseHistory = useCallback(() => {
    setPhraseHistory([]);
    showToast('Historico de frases limpo.', 'success');
  }, [showToast]);

  const closeSymbolDraft = useCallback(
    async (shouldDeleteImage: boolean) => {
      const imageToDelete = shouldDeleteImage ? pendingSymbolImage : null;
      const audioToDelete = shouldDeleteImage ? draftAudioUri : null;
      setIsSymbolDraftOpen(false);
      setPendingSymbolImage(null);
      setPendingSymbolLabel('');
      setPendingSymbolCategoryId(null);
      if (shouldDeleteImage) setDraftAudioUri(null);
      if (imageToDelete) {
        await deletePersonalSymbolImage(imageToDelete);
      }
      if (audioToDelete) {
        await deletePersonalAudioFile(audioToDelete);
      }
    },
    [draftAudioUri, pendingSymbolImage]
  );

  const handlePickImageResult = useCallback(
    async (result: ImagePicker.ImagePickerResult) => {
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      if (personalSymbols.length >= PERSONAL_SYMBOLS_MAX) {
        showToast(`Maximo de ${PERSONAL_SYMBOLS_MAX} simbolos pessoais.`, 'error');
        return;
      }
      try {
        const storedUri = await savePersonalSymbolImage(asset.uri);
        setPendingSymbolImage(storedUri);
        setPendingSymbolLabel('');
        setPendingSymbolCategoryId(null);
        setConfigRoute('simbolos');
        setTimeout(() => {
          configScrollRef.current?.scrollTo({ y: 0, animated: true });
        }, 40);
        showToast('Foto pronta. Preencha o nome e toque em Salvar simbolo.', 'success');
      } catch (error) {
        if (__DEV__) {
          console.error('Erro ao salvar imagem pessoal:', error);
        }
        showToast('Nao foi possivel preparar a imagem.', 'error');
      }
    },
    [personalSymbols.length, showToast]
  );

  const pickFromCamera = useCallback(async () => {
    if (pickerBusy) return;
    setPickerBusy(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showToast('Permita o acesso a camera para continuar.', 'error');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });
      await handlePickImageResult(result);
    } catch (error) {
      if (__DEV__) {
        console.error('Erro ao abrir camera:', error);
      }
      showToast('Nao foi possivel abrir a camera.', 'error');
    } finally {
      setPickerBusy(false);
    }
  }, [handlePickImageResult, pickerBusy, showToast]);

  const pickFromGallery = useCallback(async () => {
    if (pickerBusy) return;
    setPickerBusy(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast('Permita o acesso as fotos para continuar.', 'error');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });
      await handlePickImageResult(result);
    } catch (error) {
      if (__DEV__) {
        console.error('Erro ao abrir galeria:', error);
      }
      showToast('Nao foi possivel abrir a galeria.', 'error');
    } finally {
      setPickerBusy(false);
    }
  }, [handlePickImageResult, pickerBusy, showToast]);

  const savePendingSymbol = useCallback(async () => {
    if (!pendingSymbolImage) return;
    const label = pendingSymbolLabel.trim();
    if (!label) {
      showToast('Digite um rotulo para o simbolo.', 'error');
      return;
    }
    if (label.length > 40) {
      showToast('Rotulo muito longo (max 40 caracteres).', 'error');
      return;
    }
    triggerHaptic('success');
    const entry: PersonalSymbol = {
      id: `personal-${Date.now()}`,
      label,
      categoryId: pendingSymbolCategoryId,
      imageUri: pendingSymbolImage,
      audioUri: draftAudioUri ?? null,
      createdAt: new Date().toISOString()
    };
    setPersonalSymbols(prev => [entry, ...prev]);
    setDraftAudioUri(null);
    await closeSymbolDraft(false);
    showToast('Simbolo pessoal adicionado.', 'success');
  }, [closeSymbolDraft, draftAudioUri, pendingSymbolCategoryId, pendingSymbolImage, pendingSymbolLabel, showToast]);

  const cancelPendingSymbol = useCallback(() => {
    void closeSymbolDraft(true);
  }, [closeSymbolDraft]);

  const removePersonalSymbol = useCallback(
    async (id: string) => {
      const target = personalSymbols.find(item => item.id === id);
      setPersonalSymbols(prev => prev.filter(item => item.id !== id));
      if (target) {
        await deletePersonalSymbolImage(target.imageUri);
        if (target.audioUri) {
          await deletePersonalAudioFile(target.audioUri);
        }
      }
    },
    [personalSymbols]
  );

  const addCustomCategory = useCallback(() => {
    const name = newCustomCategoryName.trim();
    if (!name) {
      showToast('Digite um nome para a categoria.', 'error');
      return;
    }
    if (customCategories.length >= CUSTOM_CATEGORIES_MAX) {
      showToast(`Maximo de ${CUSTOM_CATEGORIES_MAX} categorias.`, 'error');
      return;
    }
    if (customCategories.some(item => item.name.toLowerCase() === name.toLowerCase())) {
      showToast('Ja existe uma categoria com esse nome.', 'error');
      return;
    }
    const entry: CustomCategory = {
      id: `cat-${Date.now()}`,
      name,
      createdAt: new Date().toISOString()
    };
    setCustomCategories(prev => [...prev, entry]);
    setNewCustomCategoryName('');
  }, [customCategories, newCustomCategoryName, showToast]);

  const removeCustomCategory = useCallback((id: string) => {
    setPersonalSymbols(prev => prev.map(ps => (ps.categoryId === id ? { ...ps, categoryId: null } : ps)));
    setCustomCategories(prev => prev.filter(item => item.id !== id));
    setEditingCategoryId(current => (current === id ? null : current));
    setActiveCategory(current => (current === id ? CATEGORIES.all : current));
  }, []);

  const startEditCategory = useCallback((category: CustomCategory) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  }, []);

  const cancelEditCategory = useCallback(() => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  }, []);

  const commitEditCategory = useCallback(() => {
    if (!editingCategoryId) return;
    const name = editingCategoryName.trim();
    if (!name) {
      showToast('Nome da categoria vazio.', 'error');
      return;
    }
    setCustomCategories(prev => {
      const duplicated = prev.some(
        item => item.id !== editingCategoryId && item.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicated) {
        showToast('Ja existe uma categoria com esse nome.', 'error');
        return prev;
      }
      return prev.map(item => (item.id === editingCategoryId ? { ...item, name } : item));
    });
    setEditingCategoryId(null);
    setEditingCategoryName('');
  }, [editingCategoryId, editingCategoryName, showToast]);

  const teardownAudioPlayer = useCallback(() => {
    const player = audioPlayerRef.current;
    audioPlayerRef.current = null;
    if (!player) return;
    try {
      player.pause();
    } catch {
      /* ignore */
    }
    try {
      player.remove();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    return () => {
      teardownAudioPlayer();
    };
  }, [teardownAudioPlayer]);

  const playAudioFromUri = useCallback(
    (uri: string) => {
      if (!uri) return;
      teardownAudioPlayer();
      try {
        const player = createAudioPlayer(uri);
        audioPlayerRef.current = player;
        player.play();
      } catch (error) {
        if (__DEV__) {
          console.error('Erro ao reproduzir audio:', error);
        }
        showToast('Nao foi possivel reproduzir o audio.', 'error');
      }
    },
    [showToast, teardownAudioPlayer]
  );

  const startDraftRecording = useCallback(async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        showToast('Permita o acesso ao microfone para continuar.', 'error');
        return;
      }
      if (draftAudioUri) {
        await deletePersonalAudioFile(draftAudioUri);
        setDraftAudioUri(null);
      }
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      if (__DEV__) {
        console.error('Erro ao iniciar gravacao:', error);
      }
      showToast('Nao foi possivel iniciar a gravacao.', 'error');
    }
  }, [audioRecorder, draftAudioUri, showToast]);

  const stopDraftRecording = useCallback(async () => {
    try {
      await audioRecorder.stop();
      const tempUri = audioRecorder.uri;
      if (!tempUri) {
        showToast('Gravacao vazia.', 'error');
        return;
      }
      const storedUri = await savePersonalAudioFile(tempUri);
      setDraftAudioUri(storedUri);
    } catch (error) {
      if (__DEV__) {
        console.error('Erro ao finalizar gravacao:', error);
      }
      showToast('Nao foi possivel salvar a gravacao.', 'error');
    }
  }, [audioRecorder, showToast]);

  const playDraftAudio = useCallback(() => {
    if (!draftAudioUri) return;
    playAudioFromUri(draftAudioUri);
  }, [draftAudioUri, playAudioFromUri]);

  const discardDraftAudio = useCallback(async () => {
    if (!draftAudioUri) return;
    await deletePersonalAudioFile(draftAudioUri);
    setDraftAudioUri(null);
  }, [draftAudioUri]);

  const attachRecordedAudioToSymbol = useCallback(
    async (symbolId: string) => {
      if (!draftAudioUri) return;
      triggerHaptic('success');
      const target = personalSymbols.find(item => item.id === symbolId);
      const previousAudio = target?.audioUri ?? null;
      setPersonalSymbols(prev =>
        prev.map(item => (item.id === symbolId ? { ...item, audioUri: draftAudioUri } : item))
      );
      setDraftAudioUri(null);
      setAudioSymbolId(null);
      if (previousAudio && previousAudio !== draftAudioUri) {
        await deletePersonalAudioFile(previousAudio);
      }
      showToast('Voz gravada salva.', 'success');
    },
    [draftAudioUri, personalSymbols, showToast]
  );

  const openAudioRecorderFor = useCallback(
    async (symbolId: string) => {
      if (draftAudioUri) {
        await deletePersonalAudioFile(draftAudioUri);
        setDraftAudioUri(null);
      }
      setAudioSymbolId(symbolId);
    },
    [draftAudioUri]
  );

  const closeAudioRecorder = useCallback(async () => {
    if (recorderState.isRecording) {
      try {
        await audioRecorder.stop();
      } catch {
        /* ignore */
      }
    }
    if (draftAudioUri) {
      await deletePersonalAudioFile(draftAudioUri);
      setDraftAudioUri(null);
    }
    setAudioSymbolId(null);
  }, [audioRecorder, draftAudioUri, recorderState.isRecording]);

  const clearSymbolAudio = useCallback(
    async (symbolId: string) => {
      const target = personalSymbols.find(item => item.id === symbolId);
      if (!target?.audioUri) return;
      const uriToDelete = target.audioUri;
      setPersonalSymbols(prev =>
        prev.map(item => (item.id === symbolId ? { ...item, audioUri: null } : item))
      );
      await deletePersonalAudioFile(uriToDelete);
      showToast('Voz removida.', 'success');
    },
    [personalSymbols, showToast]
  );

  const openRoutineDraftFromPersonalSymbol = useCallback((symbol: PersonalSymbol) => {
    if (routineSteps.length >= ROUTINE_STEPS_MAX) {
      showToast(`Maximo de ${ROUTINE_STEPS_MAX} passos na rotina.`, 'error');
      return;
    }
    setRoutineDraft({ imageUri: symbol.imageUri, audioUri: symbol.audioUri ?? null, label: symbol.label, activeDays: [...ROUTINE_DAYS] });
    setIsRoutineSymbolPickerOpen(false);
  }, [routineSteps.length, showToast]);

  const openRoutineDraftFromSymbol = useCallback((symbol: SymbolItem) => {
    if (routineSteps.length >= ROUTINE_STEPS_MAX) {
      showToast(`Maximo de ${ROUTINE_STEPS_MAX} passos na rotina.`, 'error');
      return;
    }
    setRoutineDraft({ imageUri: symbol.imageUrl, audioUri: null, label: symbol.label, activeDays: [...ROUTINE_DAYS] });
    setIsRoutineSymbolPickerOpen(false);
  }, [routineSteps.length, showToast]);

  const handleRoutinePickResult = useCallback(
    async (result: ImagePicker.ImagePickerResult) => {
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      if (routineSteps.length >= ROUTINE_STEPS_MAX) {
        showToast(`Maximo de ${ROUTINE_STEPS_MAX} passos na rotina.`, 'error');
        return;
      }
      try {
        const storedUri = await savePersonalSymbolImage(asset.uri);
        setRoutineDraft({ imageUri: storedUri, audioUri: null, label: '', activeDays: [...ROUTINE_DAYS] });
        setIsRoutineSymbolPickerOpen(false);
      } catch (error) {
        if (__DEV__) {
          console.error('Erro ao salvar imagem da rotina:', error);
        }
        showToast('Nao foi possivel preparar a imagem.', 'error');
      }
    },
    [routineSteps.length, showToast]
  );

  const pickRoutineImageFromCamera = useCallback(async () => {
    if (pickerBusy) return;
    setPickerBusy(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showToast('Permita o acesso a camera para continuar.', 'error');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });
      await handleRoutinePickResult(result);
    } catch (error) {
      if (__DEV__) {
        console.error('Erro ao abrir camera (rotina):', error);
      }
      showToast('Nao foi possivel abrir a camera.', 'error');
    } finally {
      setPickerBusy(false);
    }
  }, [handleRoutinePickResult, pickerBusy, showToast]);

  const pickRoutineImageFromGallery = useCallback(async () => {
    if (pickerBusy) return;
    setPickerBusy(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast('Permita o acesso as fotos para continuar.', 'error');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });
      await handleRoutinePickResult(result);
    } catch (error) {
      if (__DEV__) {
        console.error('Erro ao abrir galeria (rotina):', error);
      }
      showToast('Nao foi possivel abrir a galeria.', 'error');
    } finally {
      setPickerBusy(false);
    }
  }, [handleRoutinePickResult, pickerBusy, showToast]);

  const cancelRoutineDraft = useCallback(() => {
    setRoutineDraft(null);
  }, []);

  const saveRoutineDraft = useCallback(() => {
    if (!routineDraft) return;
    const label = routineDraft.label.trim();
    if (!label) {
      showToast('Dê um nome ao passo (ex: escovar dentes).', 'error');
      return;
    }
    if (routineSteps.length >= ROUTINE_STEPS_MAX) {
      showToast(`Maximo de ${ROUTINE_STEPS_MAX} passos na rotina.`, 'error');
      return;
    }
    if (routineSteps.some(item => item.label.toLowerCase() === label.toLowerCase())) {
      showToast('Já existe um passo com esse nome.', 'error');
      return;
    }
    if (routineDraft.activeDays.length === 0) {
      showToast('Selecione ao menos um dia da semana.', 'error');
      return;
    }
    const entry: RoutineStep = {
      id: `step-${Date.now()}`,
      label,
      imageUri: routineDraft.imageUri,
      audioUri: routineDraft.audioUri,
      activeDays: [...routineDraft.activeDays],
      createdAt: new Date().toISOString()
    };
    setRoutineSteps(prev => [...prev, entry]);
    setRoutineDraft(null);
  }, [routineDraft, routineSteps, showToast]);

  const toggleDraftDay = useCallback((day: RoutineDay) => {
    setRoutineDraft(prev => {
      if (!prev) return prev;
      const has = prev.activeDays.includes(day);
      const nextDays = has ? prev.activeDays.filter(d => d !== day) : [...prev.activeDays, day];
      return { ...prev, activeDays: nextDays };
    });
  }, []);

  const toggleStepDay = useCallback((stepId: string, day: RoutineDay) => {
    setRoutineSteps(prev =>
      prev.map(item => {
        if (item.id !== stepId) return item;
        const current = item.activeDays && item.activeDays.length > 0 ? item.activeDays : [...ROUTINE_DAYS];
        const has = current.includes(day);
        const nextDays = has ? current.filter(d => d !== day) : [...current, day];
        // Salvaguarda: nunca deixar vazio (criança nunca veria o passo)
        if (nextDays.length === 0) return item;
        return { ...item, activeDays: nextDays };
      })
    );
  }, []);

  const speakRoutineStep = useCallback(
    (step: RoutineStep) => {
      if (step.audioUri) {
        playAudioFromUri(step.audioUri);
        return;
      }
      const text = step.label.trim();
      if (!text) return;
      Speech.stop();
      Speech.speak(text, {
        language: 'pt-BR',
        rate,
        pitch,
        onError: () => {
          /* silent — narração da rotina não deve mostrar toast a cada falha */
        }
      });
    },
    [pitch, playAudioFromUri, rate]
  );

  const speakHotspot = useCallback(
    (hotspot: VisualSceneHotspot) => {
      triggerHaptic('light');
      if (hotspot.audioUri) {
        playAudioFromUri(hotspot.audioUri);
        return;
      }
      const text = hotspot.label.trim();
      if (!text) return;
      Speech.stop();
      Speech.speak(text, { language: 'pt-BR', rate, pitch });
    },
    [pitch, playAudioFromUri, rate]
  );

  const startSceneEditorWithPhoto = useCallback((photoUri: string) => {
    setEditingScene({
      id: `scene-${Date.now()}`,
      name: '',
      photoUri,
      hotspots: [],
      createdAt: new Date().toISOString()
    });
  }, []);

  const pickScenePhotoFromCamera = useCallback(async () => {
    if (pickerBusy) return;
    if (visualScenes.length >= VISUAL_SCENES_MAX) {
      showToast(`Maximo de ${VISUAL_SCENES_MAX} cenas.`, 'error');
      return;
    }
    setPickerBusy(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showToast('Permita o acesso a camera para continuar.', 'error');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.85,
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      const storedUri = await savePersonalSymbolImage(asset.uri);
      setIsConfigModalOpen(false);
      setTimeout(() => startSceneEditorWithPhoto(storedUri), 450);
    } catch (error) {
      if (__DEV__) console.error('Erro ao abrir camera (cena):', error);
      showToast('Nao foi possivel abrir a camera.', 'error');
    } finally {
      setPickerBusy(false);
    }
  }, [pickerBusy, showToast, startSceneEditorWithPhoto, visualScenes.length]);

  const pickScenePhotoFromGallery = useCallback(async () => {
    if (pickerBusy) return;
    if (visualScenes.length >= VISUAL_SCENES_MAX) {
      showToast(`Maximo de ${VISUAL_SCENES_MAX} cenas.`, 'error');
      return;
    }
    setPickerBusy(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast('Permita o acesso as fotos para continuar.', 'error');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.85,
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      const storedUri = await savePersonalSymbolImage(asset.uri);
      setIsConfigModalOpen(false);
      setTimeout(() => startSceneEditorWithPhoto(storedUri), 450);
    } catch (error) {
      if (__DEV__) console.error('Erro ao abrir galeria (cena):', error);
      showToast('Nao foi possivel abrir a galeria.', 'error');
    } finally {
      setPickerBusy(false);
    }
  }, [pickerBusy, showToast, startSceneEditorWithPhoto, visualScenes.length]);

  const editExistingScene = useCallback((scene: VisualScene) => {
    const sceneCopy: VisualScene = { ...scene, hotspots: scene.hotspots.map(h => ({ ...h })) };
    setIsConfigModalOpen(false);
    setTimeout(() => setEditingScene(sceneCopy), 450);
  }, []);

  const cancelSceneEditor = useCallback(() => {
    setEditingScene(null);
    setHotspotRecordingId(null);
  }, []);

  const addHotspotToDraft = useCallback((x: number, y: number) => {
    setEditingScene(prev => {
      if (!prev) return prev;
      if (prev.hotspots.length >= HOTSPOTS_PER_SCENE_MAX) {
        showToast(`Maximo de ${HOTSPOTS_PER_SCENE_MAX} marcadores por cena.`, 'error');
        return prev;
      }
      const newHotspot: VisualSceneHotspot = {
        id: `hs-${Date.now()}`,
        label: '',
        audioUri: null,
        x: Math.min(1, Math.max(0, x)),
        y: Math.min(1, Math.max(0, y)),
        radius: HOTSPOT_DEFAULT_RADIUS
      };
      return { ...prev, hotspots: [...prev.hotspots, newHotspot] };
    });
    triggerHaptic('light');
  }, [showToast]);

  const updateHotspotLabel = useCallback((id: string, label: string) => {
    setEditingScene(prev =>
      prev ? { ...prev, hotspots: prev.hotspots.map(h => (h.id === id ? { ...h, label } : h)) } : prev
    );
  }, []);

  const removeHotspot = useCallback(async (id: string) => {
    let audioToDelete: string | null = null;
    setEditingScene(prev => {
      if (!prev) return prev;
      const target = prev.hotspots.find(h => h.id === id);
      audioToDelete = target?.audioUri ?? null;
      return { ...prev, hotspots: prev.hotspots.filter(h => h.id !== id) };
    });
    if (audioToDelete) {
      await deletePersonalAudioFile(audioToDelete);
    }
  }, []);

  const startHotspotRecording = useCallback(async (id: string) => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        showToast('Permita o acesso ao microfone.', 'error');
        return;
      }
      teardownAudioPlayer();
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setHotspotRecordingId(id);
    } catch (error) {
      if (__DEV__) console.error('Erro ao iniciar gravacao de hotspot:', error);
      showToast('Nao foi possivel iniciar a gravacao.', 'error');
    }
  }, [audioRecorder, showToast, teardownAudioPlayer]);

  const stopHotspotRecording = useCallback(async () => {
    if (!hotspotRecordingId) return;
    try {
      await audioRecorder.stop();
      const tempUri = audioRecorder.uri;
      if (!tempUri) {
        setHotspotRecordingId(null);
        return;
      }
      const storedUri = await savePersonalAudioFile(tempUri);
      const recordedId = hotspotRecordingId;
      let previousAudio: string | null = null;
      setEditingScene(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          hotspots: prev.hotspots.map(h => {
            if (h.id !== recordedId) return h;
            previousAudio = h.audioUri ?? null;
            return { ...h, audioUri: storedUri };
          })
        };
      });
      if (previousAudio) await deletePersonalAudioFile(previousAudio);
      setHotspotRecordingId(null);
      triggerHaptic('success');
    } catch (error) {
      if (__DEV__) console.error('Erro ao parar gravacao de hotspot:', error);
      showToast('Nao foi possivel salvar a gravacao.', 'error');
      setHotspotRecordingId(null);
    }
  }, [audioRecorder, hotspotRecordingId, showToast]);

  const saveSceneEditor = useCallback(async () => {
    if (!editingScene) return;
    const name = editingScene.name.trim();
    if (!name) {
      showToast('Dê um nome para a cena (ex: cozinha).', 'error');
      return;
    }
    const cleanedHotspots: VisualSceneHotspot[] = [];
    for (const h of editingScene.hotspots) {
      const label = h.label.trim();
      if (!label) {
        showToast('Cada marcador precisa de um nome.', 'error');
        return;
      }
      cleanedHotspots.push({ ...h, label });
    }
    const sceneToSave: VisualScene = { ...editingScene, name, hotspots: cleanedHotspots };
    setVisualScenes(prev => {
      const idx = prev.findIndex(s => s.id === sceneToSave.id);
      if (idx === -1) return [...prev, sceneToSave];
      const next = [...prev];
      next[idx] = sceneToSave;
      return next;
    });
    setEditingScene(null);
    setHotspotRecordingId(null);
    showToast('Cena salva.', 'success');
  }, [editingScene, showToast]);

  const deleteVisualScene = useCallback(async (sceneId: string) => {
    let target: VisualScene | undefined;
    setVisualScenes(prev => {
      target = prev.find(s => s.id === sceneId);
      return prev.filter(s => s.id !== sceneId);
    });
    if (target) {
      await deletePersonalSymbolImage(target.photoUri);
      for (const h of target.hotspots) {
        if (h.audioUri) await deletePersonalAudioFile(h.audioUri);
      }
    }
  }, []);

  const removeRoutineStep = useCallback((id: string) => {
    setRoutineSteps(prev => prev.filter(item => item.id !== id));
    setRoutineProgress(prev => ({ ...prev, completedStepIds: prev.completedStepIds.filter(sid => sid !== id) }));
  }, []);

  const moveRoutineStep = useCallback((id: string, direction: -1 | 1) => {
    setRoutineSteps(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index === -1) return prev;
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  }, []);

  const toggleRoutineStep = useCallback((id: string) => {
    triggerHaptic('success');
    let didCheck = false;
    setRoutineProgress(prev => {
      const today = getTodayIso();
      const base = prev.date === today ? prev : { date: today, completedStepIds: [] };
      const already = base.completedStepIds.includes(id);
      didCheck = !already;
      const nextIds = already
        ? base.completedStepIds.filter(sid => sid !== id)
        : [...base.completedStepIds, id];
      return { date: today, completedStepIds: nextIds };
    });
    if (didCheck) {
      const step = routineSteps.find(item => item.id === id);
      if (step) speakRoutineStep(step);
    }
  }, [routineSteps, speakRoutineStep]);

  const resetTodayRoutineProgress = useCallback(() => {
    setRoutineProgress({ date: getTodayIso(), completedStepIds: [] });
    showToast('Progresso do dia zerado.', 'success');
  }, [showToast]);

  const clearSymbols = useCallback(() => {
    triggerHaptic('warning');
    setSelectedSymbols([]);
    setNormalizedPhrase('');
  }, []);

  const handlePlay = useCallback(() => {
    if (isPlaying) return;
    triggerHaptic('light');
    setIsPlaying(true);
    const rawText = normalizedPhrase.trim() || selectedSymbols.map(item => item.label).join(' ').trim();
    const text = normalizeSpokenText(rawText);
    if (!text) {
      setIsPlaying(false);
      showToast('Digite um texto ou selecione símbolos antes de ouvir.', 'error');
      return;
    }
    Speech.stop();
    Speech.speak(text, {
      language: 'pt-BR',
      rate,
      pitch,
      onDone: () => setIsPlaying(false),
      onStopped: () => setIsPlaying(false),
      onError: () => {
        setIsPlaying(false);
        showToast('Não foi possível reproduzir a voz.', 'error');
      }
    });
    recordPhraseHistory(text);
  }, [isPlaying, normalizedPhrase, pitch, rate, recordPhraseHistory, selectedSymbols, showToast]);

  const handleGenerate = useCallback(async () => {
    if (selectedSymbols.length === 0) return;
    triggerHaptic('medium');
    const labels = selectedSymbols.map(symbol => symbol.label);
    setIsGenerating(true);
    try {
      const result = await generateNormalizedPhrase(labels);
      setNormalizedPhrase(result.text.toUpperCase());
      if (result.degraded && result.message) {
        showToast(result.message, 'error');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error generating phrase:', error);
      }
      showToast('Erro ao gerar frase. Usando fallback local.', 'error');
      setNormalizedPhrase(labels.join(' ').toUpperCase());
    } finally {
      setIsGenerating(false);
    }
  }, [selectedSymbols, showToast]);

  const saveCustomSymbol = useCallback(() => {
    if (!isAdmin) {
      showToast('Somente admin pode criar customizados.', 'error');
      return;
    }
    if (!selectedSymbols.length) {
      showToast('Selecione símbolos para salvar.', 'error');
      return;
    }
    setNewGroupName(normalizedPhrase || `Grupo ${customSymbols.length + 1}`);
    setIsNamingModalOpen(true);
  }, [customSymbols.length, normalizedPhrase, selectedSymbols.length, isAdmin, showToast]);

  const confirmSaveCustomSymbol = useCallback(() => {
    const name = newGroupName.trim();
    if (!name) return;
    triggerHaptic('success');

    const item: CustomSymbol = {
      id: `custom-${Date.now()}`,
      label: name,
      symbols: selectedSymbols,
      createdAt: new Date().toISOString(),
      phrase: normalizedPhrase
    };

    setCustomSymbols(prev => [item, ...prev]);
    setIsNamingModalOpen(false);
    setActiveCategory(CATEGORIES.custom);
    clearSymbols();
    setIsAdmin(false);
    showToast('Grupo salvo. Voltando para modo usuário.', 'success');
  }, [clearSymbols, newGroupName, normalizedPhrase, selectedSymbols, showToast]);

  const removeCustomSymbol = useCallback((id: string) => {
    setCustomSymbols(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleCategoryClick = useCallback(
    async (category: string) => {
      setActiveCategory(category);
      setSearchTerm('');
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsSearchOpen(false);
      if (
        category === CATEGORIES.favorites ||
        category === CATEGORIES.custom ||
        category === CATEGORIES.savedPhrases ||
        category === CATEGORIES.history ||
        category === CATEGORIES.routine ||
        category === CATEGORIES.scenes ||
        category.startsWith('cat-')
      ) {
        return;
      }

      setIsLoading(true);
      try {
        if (category === CATEGORIES.all) {
          setSymbols(await arasaacService.getBestSymbols('pt'));
        } else {
          setSymbols(await arasaacService.getSymbolsByCategory(category, 'pt'));
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(async () => {
    const term = searchTerm.trim();
    setIsLoading(true);
    try {
      if (!term) {
        setSymbols(await arasaacService.getBestSymbols('pt'));
      } else {
        setSymbols(await arasaacService.searchSymbols(term, 'pt'));
      }
      setActiveCategory(CATEGORIES.all);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  const clearSearchAndClose = useCallback(async () => {
    setSearchTerm('');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearchOpen(false);
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      setSymbols(await arasaacService.getBestSymbols('pt'));
      setActiveCategory(CATEGORIES.all);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const symbolsToRender = useMemo(() => {
    if (activeCategory === CATEGORIES.favorites) {
      return favorites;
    }
    if (activeCategory === CATEGORIES.custom) {
      return [];
    }
    return symbols;
  }, [activeCategory, favorites, symbols]);

  const prewarmBatch = useMemo(() => symbolsToRender.slice(0, 36).map(item => item.imageUrl), [symbolsToRender]);
  const prewarmSignature = useMemo(() => prewarmBatch.join('|'), [prewarmBatch]);

  useEffect(() => {
    if (prewarmBatch.length === 0) return;
    void warmImageCache(prewarmBatch).then(() => {
      if (__DEV__) {
        console.log('Image cache metrics:', getImageCacheMetrics());
      }
    });
  }, [prewarmBatch, prewarmSignature]);

  useEffect(() => {
    if (hasPrimedExtendedCache.current) return;
    const seedUrls = [
      ...symbols.map(item => item.imageUrl),
      ...favorites.map(item => item.imageUrl),
      ...customSymbols.flatMap(group => group.symbols.map(symbol => symbol.imageUrl))
    ];
    const uniqueSeedUrls = Array.from(new Set(seedUrls.filter(Boolean))).slice(0, 180);
    if (uniqueSeedUrls.length === 0) return;

    hasPrimedExtendedCache.current = true;
    void warmImageCache(uniqueSeedUrls).then(() => {
      if (__DEV__) {
        console.log('Extended image cache warm complete:', getImageCacheMetrics());
      }
    });
  }, [customSymbols, favorites, symbols]);

  if (!fontsLoaded || isBootHydrating) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.bootLoadingState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.bg}
      />
      <KeyboardAvoidingView
        style={[styles.container, { paddingHorizontal: 12 * uiScaleFactor, paddingTop: androidTopInset + 10, paddingBottom: androidBottomInset + 8 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.headerCard, isHighContrast && styles.cardHighContrast]}>
          <View style={styles.headerRow}>
            <Pressable
              style={styles.menuButton}
              onPress={openConfigModal}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Abrir configurações do cuidador"
            >
              <Text style={styles.menuIcon}>⚙</Text>
            </Pressable>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesRow}
            >
            <CategoryButton
              label={CATEGORIES.favorites}
              active={activeCategory === CATEGORIES.favorites}
              highContrast={isHighContrast}
              onPress={() => void handleCategoryClick(CATEGORIES.favorites)}
            />
            <CategoryButton
              label={CATEGORIES.all}
              active={activeCategory === CATEGORIES.all}
              highContrast={isHighContrast}
              onPress={() => void handleCategoryClick(CATEGORIES.all)}
            />
            {sectionVisibility.frases && (
              <CategoryButton
                label={CATEGORIES.savedPhrases}
                active={activeCategory === CATEGORIES.savedPhrases}
                highContrast={isHighContrast}
                onPress={() => void handleCategoryClick(CATEGORIES.savedPhrases)}
              />
            )}
            {sectionVisibility.historico && (
              <CategoryButton
                label={CATEGORIES.history}
                active={activeCategory === CATEGORIES.history}
                highContrast={isHighContrast}
                onPress={() => void handleCategoryClick(CATEGORIES.history)}
              />
            )}
            {sectionVisibility.rotina && (
              <CategoryButton
                label={CATEGORIES.routine}
                active={activeCategory === CATEGORIES.routine}
                highContrast={isHighContrast}
                onPress={() => void handleCategoryClick(CATEGORIES.routine)}
              />
            )}
            {sectionVisibility.cenas && (
              <CategoryButton
                label={CATEGORIES.scenes}
                active={activeCategory === CATEGORIES.scenes}
                highContrast={isHighContrast}
                onPress={() => void handleCategoryClick(CATEGORIES.scenes)}
              />
            )}
            {customSymbols.length > 0 && (
              <CategoryButton
                label={CATEGORIES.custom}
                active={activeCategory === CATEGORIES.custom}
                highContrast={isHighContrast}
                onPress={() => void handleCategoryClick(CATEGORIES.custom)}
              />
            )}
            {customCategories.map(category => (
              <CategoryButton
                key={`custom-cat-${category.id}`}
                label={category.name}
                active={activeCategory === category.id}
                highContrast={isHighContrast}
                onPress={() => void handleCategoryClick(category.id)}
              />
            ))}
            {categories.map(category => (
              <CategoryButton
                key={category}
                label={category}
                active={activeCategory === category}
                highContrast={isHighContrast}
                onPress={() => void handleCategoryClick(category)}
              />
            ))}
            </ScrollView>
            {isAdmin && (
              <View style={styles.headerActions}>
                <Pressable
                  style={[styles.searchToggleButton, (isSearchOpen || searchTerm.trim()) && styles.searchToggleButtonActive]}
                  onPress={() => {
                    if (isSearchOpen) {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setIsSearchOpen(false);
                      Keyboard.dismiss();
                      return;
                    }
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 40);
                  }}
                >
                  <Text style={styles.searchToggleIcon}>🔍</Text>
                </Pressable>
                <View style={[styles.adminBadge, styles.adminBadgeOn]}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              </View>
            )}
          </View>

          {isSearchOpen && (
            <View style={styles.searchRow}>
              <TextInput
                ref={searchInputRef}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Pesquisar símbolos..."
                style={[styles.searchInput, isHighContrast && styles.inputHighContrast]}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              <Pressable style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Buscar</Text>
              </Pressable>
              <Pressable style={styles.searchClearButton} onPress={() => void clearSearchAndClose()}>
                <Text style={styles.searchClearButtonText}>✕</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={[styles.listCard, isHighContrast && styles.cardHighContrast]}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : activeCategory === CATEGORIES.custom ? (
            <FlatList
              data={customSymbols}
              keyExtractor={item => item.id}
              key="custom"
              numColumns={2}
              contentContainerStyle={styles.grid}
              renderItem={({ item }) => (
                <CustomSymbolCard
                  item={item}
                  onUse={() => {
                    setSelectedSymbols(prev => (prev.length ? [...prev, ...item.symbols] : item.symbols));
                    setNormalizedPhrase(item.phrase || '');
                  }}
                  onDelete={() => removeCustomSymbol(item.id)}
                  isAdmin={isAdmin}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                <Text style={[styles.emptyText, isHighContrast && styles.textMutedHighContrast]}>Nenhum grupo salvo.</Text>
                </View>
              }
            />
          ) : activeCategory === CATEGORIES.savedPhrases ? (
            <FlatList
              data={savedPhrases}
              keyExtractor={item => item.id}
              key="saved-phrases"
              contentContainerStyle={styles.phraseList}
              renderItem={({ item }) => (
                <PhraseCard
                  text={item.text}
                  tone="saved"
                  highContrast={isHighContrast}
                  uiScaleFactor={uiScaleFactor}
                  onPress={() => speakPhraseText(item.text)}
                  onDelete={isAdmin ? () => removeSavedPhrase(item.id) : undefined}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, isHighContrast && styles.textMutedHighContrast]}>
                    Nenhuma frase salva ainda.
                  </Text>
                </View>
              }
            />
          ) : activeCategory === CATEGORIES.history ? (
            <FlatList
              data={phraseHistory}
              keyExtractor={item => item.id}
              key="phrase-history"
              contentContainerStyle={styles.phraseList}
              renderItem={({ item }) => (
                <PhraseCard
                  text={item.text}
                  tone="history"
                  highContrast={isHighContrast}
                  uiScaleFactor={uiScaleFactor}
                  onPress={() => speakPhraseText(item.text)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, isHighContrast && styles.textMutedHighContrast]}>
                    Nenhuma frase no historico ainda.
                  </Text>
                </View>
              }
            />
          ) : activeCategory === CATEGORIES.routine ? (
            <View style={styles.routineContainer}>
              <View style={styles.routineHeader}>
                <Text style={[styles.routineHeaderTitle, isHighContrast && styles.textHighContrast]}>Rotina do dia</Text>
                <Text style={[styles.routineHeaderDate, isHighContrast && styles.textMutedHighContrast]}>
                  {formatTodayLabelPt(routineProgress.date)}
                </Text>
              </View>
              <FlatList
                data={routineSteps.filter(s => !s.activeDays || s.activeDays.length === 0 || s.activeDays.includes(getTodayRoutineDay()))}
                keyExtractor={item => item.id}
                key="routine-steps"
                contentContainerStyle={styles.routineList}
                renderItem={({ item, index }) => (
                  <RoutineStepCard
                    step={item}
                    stepNumber={index + 1}
                    completed={routineProgress.completedStepIds.includes(item.id)}
                    onToggle={() => toggleRoutineStep(item.id)}
                    onPreview={() => speakRoutineStep(item)}
                    highContrast={isHighContrast}
                    uiScaleFactor={uiScaleFactor}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, isHighContrast && styles.textMutedHighContrast]}>
                      Ainda nao ha rotina configurada. Peca ao cuidador para adicionar passos.
                    </Text>
                  </View>
                }
              />
            </View>
          ) : activeCategory === CATEGORIES.scenes ? (
            <FlatList
              data={visualScenes}
              keyExtractor={item => item.id}
              key={`scenes-${effectiveGridColumns}`}
              numColumns={2}
              accessibilityLabel="Grade de cenas visuais"
              contentContainerStyle={styles.grid}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    triggerHaptic('light');
                    setViewerScene(item);
                  }}
                  style={styles.sceneTile}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir cena ${item.name}`}
                >
                  <Image source={{ uri: item.photoUri }} style={styles.sceneTileImage} resizeMode="cover" />
                  <View style={styles.sceneTileOverlay}>
                    <Text style={styles.sceneTileLabel} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.sceneTileMeta}>{item.hotspots.length} {item.hotspots.length === 1 ? 'item' : 'itens'}</Text>
                  </View>
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, isHighContrast && styles.textMutedHighContrast]}>
                    Nenhuma cena ainda. Peça ao cuidador para tirar uma foto e marcar os itens.
                  </Text>
                </View>
              }
            />
          ) : customCategories.some(c => c.id === activeCategory) ? (
            <FlatList
              data={padToColumns(
                personalSymbols.filter(ps => ps.categoryId === activeCategory),
                effectiveGridColumns,
                id => ({ id, label: '', categoryId: null, imageUri: '', createdAt: '' })
              )}
              keyExtractor={item => item.id}
              key={`personal-${activeCategory}-${effectiveGridColumns}`}
              numColumns={effectiveGridColumns}
              accessibilityLabel={`Grade de simbolos pessoais ${effectiveGridColumns} colunas`}
              contentContainerStyle={styles.grid}
              renderItem={({ item }) => {
                if (item.id.startsWith(GRID_FILLER_PREFIX)) {
                  return <View style={styles.gridFiller} />;
                }
                const symbolItem: SymbolItem = {
                  id: item.id,
                  label: item.label,
                  imageUrl: item.imageUri,
                  category: 'personal'
                };
                return (
                  <SymbolCard
                    item={symbolItem}
                    columns={effectiveGridColumns}
                    favorite={isFavorite(symbolItem)}
                    onPress={() => addSymbol(symbolItem)}
                    onFavoritePress={() => toggleFavorite(symbolItem)}
                    onLongPress={item.audioUri ? () => playAudioFromUri(item.audioUri!) : undefined}
                    hasAudio={!!item.audioUri}
                    isAdmin={isAdmin}
                  />
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, isHighContrast && styles.textMutedHighContrast]}>
                    Nenhum simbolo nesta categoria.
                  </Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={padToColumns(symbolsToRender, effectiveGridColumns, id => ({ id, label: '', imageUrl: '', category: '' }))}
              keyExtractor={item => item.id}
              key={`symbols-${effectiveGridColumns}`}
              numColumns={effectiveGridColumns}
              accessibilityLabel={`Grade de simbolos ${effectiveGridColumns} colunas`}
              contentContainerStyle={styles.grid}
              ListHeaderComponent={
                activeCategory !== CATEGORIES.scenes &&
                activeCategory !== CATEGORIES.routine &&
                coreVocabulary.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.coreVocabRow}
                    accessibilityLabel="Vocabulario essencial"
                  >
                    {coreVocabulary.map(word => (
                      <Pressable
                        key={`core-word-${word}`}
                        onPress={() => addCoreWord(word)}
                        style={styles.coreVocabButton}
                        accessibilityRole="button"
                        accessibilityLabel={`Adicionar palavra ${word}`}
                      >
                        <Text style={[styles.coreVocabButtonText, { fontSize: 14 * uiScaleFactor }]}>
                          {word.toUpperCase()}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : null
              }
              renderItem={({ item }) =>
                item.id.startsWith(GRID_FILLER_PREFIX) ? (
                  <View style={styles.gridFiller} />
                ) : (
                  <SymbolCard
                    item={item}
                    columns={effectiveGridColumns}
                    favorite={isFavorite(item)}
                    onPress={() => addSymbol(item)}
                    onFavoritePress={() => toggleFavorite(item)}
                    isAdmin={isAdmin}
                  />
                )
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, isHighContrast && styles.textMutedHighContrast]}>Nenhum símbolo encontrado.</Text>
                </View>
              }
            />
          )}
        </View>

        {activeCategory !== CATEGORIES.scenes && activeCategory !== CATEGORIES.routine && (
        <View style={[styles.composerCard, isHighContrast && styles.cardHighContrast]}>
          <View style={styles.phraseChipsRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.phraseChipsScroll}
              contentContainerStyle={styles.selectedList}
            >
              {selectedSymbols.map((symbol, index) => (
                  <Pressable
                    key={`${symbol.id}-${index}`}
                    onPress={() => {
                      setSelectedSymbols(prev => prev.filter((_, i) => i !== index));
                      setNormalizedPhrase('');
                    }}
                  >
                    {symbol.imageUrl ? (
                      <CachedImage uri={symbol.imageUrl} style={styles.selectedImage} resizeMode="contain" />
                    ) : (
                      <View style={[styles.selectedTextChip, isHighContrast && styles.selectedTextChipHighContrast]}>
                        <Text
                          style={[styles.selectedTextChipText, isHighContrast && styles.selectedTextChipTextHighContrast]}
                          numberOfLines={1}
                        >
                          {symbol.label.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </Pressable>
              ))}
            </ScrollView>
            {selectedSymbols.length > 0 && (
              <Pressable style={styles.clearLink} onPress={clearSymbols} accessibilityRole="button" accessibilityLabel="Limpar frase">
                <Text style={styles.clearLinkText}>limpar</Text>
              </Pressable>
            )}
          </View>

          <TextInput
            value={phraseText}
            onChangeText={setNormalizedPhrase}
            placeholder="Toque nos símbolos para começar"
            style={[styles.phraseText, { fontSize: 14 * uiScaleFactor }, isHighContrast && styles.inputHighContrast]}
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          <View style={styles.iconActionRow}>
            <Pressable
              onPress={() => void handleGenerate()}
              style={({ pressed }) => [styles.generateButton, pressed && styles.generateButtonPressed, isGenerating && styles.generateButtonBusy]}
              accessibilityRole="button"
              accessibilityLabel="Gerar frase com IA"
              disabled={isGenerating}
            >
              <Text style={styles.generateGlyph}>{isGenerating ? '…' : '✦'}</Text>
              <Text style={styles.generateButtonLabel}>Gerar</Text>
            </Pressable>
            {isAdmin && (
              <Pressable onPress={saveCustomSymbol} style={styles.saveGroupButton} accessibilityRole="button" accessibilityLabel="Salvar grupo">
                <Text style={styles.iconGlyph}>💾</Text>
                <Text style={styles.saveGroupButtonLabel}>Salvar</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handlePlay}
              style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="Ouvir a frase"
            >
              <Text style={styles.playGlyph}>{isPlaying ? '◼' : '▶'}</Text>
              <Text style={styles.playButtonLabel}>Ouvir</Text>
            </Pressable>
          </View>
        </View>
        )}
      </KeyboardAvoidingView>

      <IOSBottomSheet
        visible={isNamingModalOpen}
        onRequestClose={() => setIsNamingModalOpen(false)}
        title="Salvar grupo"
        leftAction={{ label: 'Cancelar', onPress: () => setIsNamingModalOpen(false) }}
        rightAction={{ label: 'Salvar', onPress: confirmSaveCustomSymbol, bold: true }}
      >
        <View style={styles.sheetContent}>
          <TextInput
            value={newGroupName}
            onChangeText={setNewGroupName}
            placeholder="Nome do grupo"
            style={styles.modalInput}
            autoFocus
          />
        </View>
      </IOSBottomSheet>

      <IOSBottomSheet
        visible={audioSymbolId !== null}
        onRequestClose={() => void closeAudioRecorder()}
        title="Gravar voz"
        leftAction={{ label: 'Cancelar', onPress: () => void closeAudioRecorder() }}
        rightAction={{
          label: 'Salvar voz',
          onPress: () => audioSymbolId && void attachRecordedAudioToSymbol(audioSymbolId),
          bold: true,
          disabled: !draftAudioUri
        }}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.modalHint}>Essa gravacao vai tocar no lugar do TTS quando o simbolo for usado.</Text>
          <AudioRecorderControls
            isRecording={recorderState.isRecording}
            durationMillis={recorderState.durationMillis}
            hasRecording={!!draftAudioUri}
            onStart={() => void startDraftRecording()}
            onStop={() => void stopDraftRecording()}
            onPlay={playDraftAudio}
            onDiscard={() => void discardDraftAudio()}
          />
        </View>
      </IOSBottomSheet>

      <IOSBottomSheet
        visible={false}
        onRequestClose={cancelPendingSymbol}
        title="Novo simbolo"
        closeOnBackdropPress={false}
        leftAction={{ label: 'Cancelar', onPress: cancelPendingSymbol }}
        rightAction={{ label: 'Salvar', onPress: () => void savePendingSymbol(), bold: true }}
      >
        <ScrollView style={styles.sheetScrollContent} contentContainerStyle={styles.sheetContent}>
          {pendingSymbolImage && (
            <Image
              source={{ uri: pendingSymbolImage }}
              style={styles.symbolDraftPreview}
              resizeMode="cover"
              accessibilityLabel="Previsualizacao da imagem do simbolo"
            />
          )}
          <TextInput
            value={pendingSymbolLabel}
            onChangeText={setPendingSymbolLabel}
            placeholder="Rotulo (ex: vovo)"
            placeholderTextColor={theme.colors.textSoft}
            style={styles.modalInput}
            autoFocus
            maxLength={40}
          />
          <Text style={styles.modalHint}>Voz gravada (opcional):</Text>
          <AudioRecorderControls
            isRecording={recorderState.isRecording}
            durationMillis={recorderState.durationMillis}
            hasRecording={!!draftAudioUri}
            onStart={() => void startDraftRecording()}
            onStop={() => void stopDraftRecording()}
            onPlay={playDraftAudio}
            onDiscard={() => void discardDraftAudio()}
          />
          <Text style={styles.modalHint}>Categoria (opcional):</Text>
          <View style={styles.symbolDraftCategoryRow}>
            <Pressable
              onPress={() => setPendingSymbolCategoryId(null)}
              style={[styles.symbolDraftCategoryChip, pendingSymbolCategoryId === null && styles.symbolDraftCategoryChipActive]}
              accessibilityRole="button"
              accessibilityLabel="Sem categoria"
            >
              <Text style={[styles.symbolDraftCategoryChipText, pendingSymbolCategoryId === null && styles.symbolDraftCategoryChipTextActive]}>
                Sem categoria
              </Text>
            </Pressable>
            {customCategories.map(cat => {
              const selected = pendingSymbolCategoryId === cat.id;
              return (
                <Pressable
                  key={`draft-cat-${cat.id}`}
                  onPress={() => setPendingSymbolCategoryId(cat.id)}
                  style={[styles.symbolDraftCategoryChip, selected && styles.symbolDraftCategoryChipActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Categoria ${cat.name}`}
                >
                  <Text style={[styles.symbolDraftCategoryChipText, selected && styles.symbolDraftCategoryChipTextActive]}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </IOSBottomSheet>

      <IOSBottomSheet
        visible={isConfigModalOpen}
        onRequestClose={() => {
          setIsConfigModalOpen(false);
          resetConfigFields();
        }}
        title={configRoute === 'home' ? 'Ajustes' : CONFIG_ROUTE_TITLES[configRoute]}
        leftAction={{
          label: 'Fechar',
          onPress: () => {
            setIsConfigModalOpen(false);
            resetConfigFields();
          }
        }}
      >
        <View style={[styles.configSheet, isHighContrast && styles.modalCardHighContrast]}>
          {configRoute === 'home' ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.configHomeContent}
            >
              {/* Grupo APP — sempre clicavel */}
              <View style={styles.sGroupBlock}>
                <Text style={styles.sGroupTitle}>APP</Text>
                <View style={styles.sCard}>
                  <ConfigGroupRow icon="🔊" label="Voz" onPress={() => openConfigRoute('voz')} first />
                  <ConfigGroupRow icon="👁" label="Acessibilidade" onPress={() => openConfigRoute('acessibilidade')} />
                  <ConfigGroupRow icon="⚙" label="Aparência" onPress={() => openConfigRoute('aparencia')} />
                </View>
              </View>
              {/* Grupo CONTEUDO DA CRIANCA — gated por senha */}
              <View style={styles.sGroupBlock}>
                <Text style={styles.sGroupTitle}>CONTEÚDO DA CRIANÇA</Text>
                <View style={styles.sCard}>
                  <ConfigGroupRow icon="🗣" label="Vocabulário core" locked={!isAdmin} onPress={() => openConfigRoute('vocabulario')} first />
                  <ConfigGroupRow icon="💬" label="Frases prontas" locked={!isAdmin} onPress={() => openConfigRoute('frases')} />
                  <ConfigGroupRow icon="📷" label="Símbolos pessoais" locked={!isAdmin} onPress={() => openConfigRoute('simbolos')} />
                  <ConfigGroupRow icon="🗂" label="Categorias" locked={!isAdmin} onPress={() => openConfigRoute('categorias')} />
                  <ConfigGroupRow icon="📅" label="Rotina do dia" locked={!isAdmin} onPress={() => openConfigRoute('rotina')} />
                  <ConfigGroupRow icon="🏠" label="Cenas visuais" locked={!isAdmin} onPress={() => openConfigRoute('cenas')} />
                  <ConfigGroupRow icon="🧩" label="Abas visíveis" locked={!isAdmin} onPress={() => openConfigRoute('secoes')} />
                </View>
              </View>
              {/* Grupo CUIDADOR — gated; opcoes mudam por estado */}
              <View style={styles.sGroupBlock}>
                <Text style={styles.sGroupTitle}>CUIDADOR</Text>
                <View style={styles.sCard}>
                  <ConfigGroupRow
                    icon="🔐"
                    label={isAdmin ? 'Senha' : (needsAdminSetup ? 'Criar senha' : 'Entrar como cuidador')}
                    onPress={() => openConfigRoute('senha')}
                    first
                  />
                  <ConfigGroupRow icon="🔑" label="Chave da IA" locked={!isAdmin} onPress={() => openConfigRoute('chave-ia')} />
                  {isAdmin ? (
                    <ConfigGroupRow
                      icon="🚪"
                      label="Sair do modo cuidador"
                      danger
                      onPress={() => { handleAdminLogout(); resetConfigFields(); }}
                    />
                  ) : null}
                </View>
              </View>
            </ScrollView>
          ) : (
            <>
              <View style={styles.configDetailHeader}>
                <Pressable
                  onPress={() => setConfigRoute('home')}
                  style={styles.configBackButton}
                  accessibilityRole="button"
                  accessibilityLabel="Voltar para Ajustes"
                >
                  <Text style={styles.configBackText}>‹ Ajustes</Text>
                </Pressable>
              </View>
              <ScrollView
                ref={configScrollRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.configDetailBody}
              >
            {configRoute === 'vocabulario' && (
              !isAdmin ? (
                <Text style={styles.drillEmptyHint}>Entre como cuidador para editar o vocabulário core.</Text>
              ) : (
                <>
                  <Text style={styles.drillSectionTitle}>PALAVRAS ATUAIS</Text>
                  <View style={styles.drillListCard}>
                    {coreVocabulary.length === 0 ? (
                      <Text style={styles.drillEmptyHint}>Nenhuma palavra no core ainda.</Text>
                    ) : (
                      coreVocabulary.map((word, index) => (
                        <View
                          key={`core-edit-${word}`}
                          style={[styles.drillItemRow, index > 0 && styles.drillItemRowDivider]}
                        >
                          <Text style={styles.drillItemLabel} numberOfLines={1}>{word.toUpperCase()}</Text>
                          <Pressable
                            onPress={() => moveCoreVocabularyWord(word, -1)}
                            disabled={index === 0}
                            style={[styles.drillIconButton, index === 0 && { opacity: 0.4 }]}
                            accessibilityRole="button"
                            accessibilityLabel={`Mover ${word} para cima`}
                          >
                            <Text style={styles.drillIconButtonText}>↑</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => moveCoreVocabularyWord(word, 1)}
                            disabled={index === coreVocabulary.length - 1}
                            style={[styles.drillIconButton, index === coreVocabulary.length - 1 && { opacity: 0.4 }]}
                            accessibilityRole="button"
                            accessibilityLabel={`Mover ${word} para baixo`}
                          >
                            <Text style={styles.drillIconButtonText}>↓</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => removeCoreVocabularyWord(word)}
                            style={[styles.drillIconButton, styles.drillIconButtonDanger]}
                            accessibilityRole="button"
                            accessibilityLabel={`Remover ${word}`}
                          >
                            <Text style={[styles.drillIconButtonText, styles.drillIconButtonTextDanger]}>✕</Text>
                          </Pressable>
                        </View>
                      ))
                    )}
                  </View>

                  <Text style={styles.drillSectionTitle}>ADICIONAR</Text>
                  <View style={styles.drillSectionCard}>
                    <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                      <TextInput
                        value={newCoreWord}
                        onChangeText={setNewCoreWord}
                        placeholder="Nova palavra (ex.: água)"
                        placeholderTextColor={theme.colors.textMuted}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={styles.drillInlineInput}
                        onSubmitEditing={addCoreVocabularyWord}
                      />
                      <Pressable
                        onPress={addCoreVocabularyWord}
                        style={styles.drillPrimaryButton}
                        accessibilityRole="button"
                        accessibilityLabel="Adicionar palavra ao core"
                      >
                        <Text style={styles.drillPrimaryButtonText}>Adicionar</Text>
                      </Pressable>
                    </View>
                    <Text style={styles.drillFieldHint}>
                      Máximo de {CORE_VOCABULARY_MAX} palavras. Duplicadas são ignoradas.
                    </Text>
                  </View>

                  <Pressable
                    onPress={resetCoreVocabulary}
                    style={styles.drillSecondaryButton}
                    accessibilityRole="button"
                    accessibilityLabel="Restaurar vocabulário core padrão"
                  >
                    <Text style={styles.drillSecondaryButtonText}>Restaurar padrão</Text>
                  </Pressable>
                </>
              )
            )}

            {configRoute === 'frases' && (
              !isAdmin ? (
                <Text style={styles.drillEmptyHint}>Entre como cuidador para editar as frases prontas.</Text>
              ) : (
                <>
                  <Text style={styles.drillSectionTitle}>FRASES SALVAS</Text>
                  <View style={styles.drillListCard}>
                    {savedPhrases.length === 0 ? (
                      <Text style={styles.drillEmptyHint}>Nenhuma frase salva ainda. Adicione abaixo.</Text>
                    ) : (
                      savedPhrases.map((phrase, index) => {
                        const isEditing = editingPhraseId === phrase.id;
                        return (
                          <View
                            key={`phrase-edit-${phrase.id}`}
                            style={[styles.drillItemRow, index > 0 && styles.drillItemRowDivider]}
                          >
                            {isEditing ? (
                              <TextInput
                                value={editingPhraseText}
                                onChangeText={setEditingPhraseText}
                                style={styles.drillInlineInput}
                                placeholder="Editar frase"
                                placeholderTextColor={theme.colors.textMuted}
                                autoFocus
                                onSubmitEditing={commitEditingPhrase}
                              />
                            ) : (
                              <Text style={styles.drillItemLabel} numberOfLines={2}>
                                {phrase.text}
                              </Text>
                            )}
                            {isEditing ? (
                              <>
                                <Pressable
                                  onPress={commitEditingPhrase}
                                  style={styles.drillIconButton}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Salvar edição da frase ${phrase.text}`}
                                >
                                  <Text style={styles.drillIconButtonText}>OK</Text>
                                </Pressable>
                                <Pressable
                                  onPress={cancelEditingPhrase}
                                  style={[styles.drillIconButton, styles.drillIconButtonDanger]}
                                  accessibilityRole="button"
                                  accessibilityLabel="Cancelar edição da frase"
                                >
                                  <Text style={[styles.drillIconButtonText, styles.drillIconButtonTextDanger]}>✕</Text>
                                </Pressable>
                              </>
                            ) : (
                              <>
                                <Pressable
                                  onPress={() => startEditingPhrase(phrase)}
                                  style={styles.drillIconButton}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Editar frase ${phrase.text}`}
                                >
                                  <Text style={styles.drillIconButtonText}>✎</Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => removeSavedPhrase(phrase.id)}
                                  style={[styles.drillIconButton, styles.drillIconButtonDanger]}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Remover frase ${phrase.text}`}
                                >
                                  <Text style={[styles.drillIconButtonText, styles.drillIconButtonTextDanger]}>✕</Text>
                                </Pressable>
                              </>
                            )}
                          </View>
                        );
                      })
                    )}
                  </View>

                  <Text style={styles.drillSectionTitle}>ADICIONAR</Text>
                  <View style={styles.drillSectionCard}>
                    <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                      <TextInput
                        value={newPhraseInput}
                        onChangeText={setNewPhraseInput}
                        placeholder="Nova frase (ex: quero agua)"
                        placeholderTextColor={theme.colors.textMuted}
                        style={styles.drillInlineInput}
                        onSubmitEditing={addSavedPhrase}
                      />
                      <Pressable
                        onPress={addSavedPhrase}
                        style={styles.drillPrimaryButton}
                        accessibilityRole="button"
                        accessibilityLabel="Adicionar nova frase pronta"
                      >
                        <Text style={styles.drillPrimaryButtonText}>Adicionar</Text>
                      </Pressable>
                    </View>
                    <Text style={styles.drillFieldHint}>
                      Máximo de {SAVED_PHRASES_MAX} frases. Histórico guarda as últimas {PHRASE_HISTORY_MAX} faladas.
                    </Text>
                  </View>

                  <Text style={styles.drillSectionTitle}>HISTÓRICO</Text>
                  <Pressable
                    onPress={clearPhraseHistory}
                    style={styles.drillSecondaryButton}
                    accessibilityRole="button"
                    accessibilityLabel="Limpar histórico de frases"
                  >
                    <Text style={styles.drillSecondaryButtonText}>Limpar histórico ({phraseHistory.length})</Text>
                  </Pressable>
                </>
              )
            )}

            {configRoute === 'simbolos' && (
              !isAdmin ? (
                <Text style={styles.drillEmptyHint}>Entre como cuidador para gerenciar símbolos pessoais.</Text>
              ) : (
                <>
                  <Text style={styles.drillSectionTitle}>FONTES</Text>
                  <View style={styles.drillSectionCard}>
                    <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                      <Pressable
                        onPress={() => void pickFromCamera()}
                        disabled={pickerBusy}
                        style={[styles.drillPrimaryButton, { flex: 1 }, pickerBusy && { opacity: 0.6 }]}
                        accessibilityRole="button"
                        accessibilityLabel="Tirar foto para novo símbolo"
                      >
                        <Text style={styles.drillPrimaryButtonText}>📷 Câmera</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => void pickFromGallery()}
                        disabled={pickerBusy}
                        style={[styles.drillPrimaryButton, { flex: 1 }, pickerBusy && { opacity: 0.6 }]}
                        accessibilityRole="button"
                        accessibilityLabel="Escolher imagem da galeria"
                      >
                        <Text style={styles.drillPrimaryButtonText}>🖼 Galeria</Text>
                      </Pressable>
                    </View>
                    <Text style={styles.drillFieldHint}>
                      Tire uma foto familiar ou escolha da galeria. Você pode dar um rótulo e gravar a voz do cuidador para o novo símbolo. Máximo de {PERSONAL_SYMBOLS_MAX} símbolos pessoais.
                    </Text>
                  </View>

                  {pendingSymbolImage && (
                    <View style={styles.drillSectionCard}>
                      <Image
                        source={{ uri: pendingSymbolImage }}
                        style={styles.symbolDraftPreview}
                        resizeMode="cover"
                        accessibilityLabel="Previsualizacao da imagem do simbolo"
                      />
                      <TextInput
                        value={pendingSymbolLabel}
                        onChangeText={setPendingSymbolLabel}
                        placeholder="Rótulo (ex: vovó)"
                        placeholderTextColor={theme.colors.textMuted}
                        style={styles.drillInlineInput}
                        maxLength={40}
                      />
                      <Text style={styles.drillFieldHint}>Categoria (opcional):</Text>
                      <View style={styles.symbolDraftCategoryRow}>
                        <Pressable
                          onPress={() => setPendingSymbolCategoryId(null)}
                          style={[styles.symbolDraftCategoryChip, pendingSymbolCategoryId === null && styles.symbolDraftCategoryChipActive]}
                          accessibilityRole="button"
                          accessibilityLabel="Sem categoria"
                        >
                          <Text style={[styles.symbolDraftCategoryChipText, pendingSymbolCategoryId === null && styles.symbolDraftCategoryChipTextActive]}>
                            Sem categoria
                          </Text>
                        </Pressable>
                        {customCategories.map(cat => {
                          const selected = pendingSymbolCategoryId === cat.id;
                          return (
                            <Pressable
                              key={`draft-inline-cat-${cat.id}`}
                              onPress={() => setPendingSymbolCategoryId(cat.id)}
                              style={[styles.symbolDraftCategoryChip, selected && styles.symbolDraftCategoryChipActive]}
                              accessibilityRole="button"
                              accessibilityLabel={`Categoria ${cat.name}`}
                            >
                              <Text style={[styles.symbolDraftCategoryChipText, selected && styles.symbolDraftCategoryChipTextActive]}>
                                {cat.name}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                        <Pressable
                          onPress={() => void savePendingSymbol()}
                          style={[styles.drillPrimaryButton, { flex: 1 }]}
                          accessibilityRole="button"
                          accessibilityLabel="Salvar novo símbolo"
                        >
                          <Text style={styles.drillPrimaryButtonText}>Salvar símbolo</Text>
                        </Pressable>
                        <Pressable
                          onPress={cancelPendingSymbol}
                          style={[styles.drillSecondaryButton, { flex: 1 }]}
                          accessibilityRole="button"
                          accessibilityLabel="Cancelar novo símbolo"
                        >
                          <Text style={styles.drillSecondaryButtonText}>Cancelar</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}

                  <Text style={styles.drillSectionTitle}>GALERIA DE SÍMBOLOS PESSOAIS</Text>
                  <View style={styles.drillListCard}>
                    {personalSymbols.length === 0 ? (
                      <Text style={styles.drillEmptyHint}>Nenhum símbolo pessoal ainda.</Text>
                    ) : (
                      personalSymbols.map((symbol, index) => {
                        const category = customCategories.find(c => c.id === symbol.categoryId);
                        const hasAudio = !!symbol.audioUri;
                        return (
                          <View
                            key={`personal-row-${symbol.id}`}
                            style={[styles.drillItemRow, index > 0 && styles.drillItemRowDivider]}
                          >
                            <Image source={{ uri: symbol.imageUri }} style={styles.personalSymbolThumb} resizeMode="cover" />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.drillItemLabel} numberOfLines={1}>
                                {symbol.label}
                                {hasAudio ? ' 🔊' : ''}
                              </Text>
                              <Text style={styles.drillItemSubLabel} numberOfLines={1}>
                                {category ? category.name : 'Sem categoria'}
                              </Text>
                            </View>
                            <Pressable
                              onPress={() => void openAudioRecorderFor(symbol.id)}
                              style={styles.drillIconButton}
                              accessibilityRole="button"
                              accessibilityLabel={hasAudio ? `Regravar voz do símbolo ${symbol.label}` : `Gravar voz para ${symbol.label}`}
                            >
                              <Text style={styles.drillIconButtonText}>🎙</Text>
                            </Pressable>
                            {hasAudio && (
                              <Pressable
                                onPress={() => void clearSymbolAudio(symbol.id)}
                                style={styles.drillIconButton}
                                accessibilityRole="button"
                                accessibilityLabel={`Remover voz do símbolo ${symbol.label}`}
                              >
                                <Text style={styles.drillIconButtonText}>🔇</Text>
                              </Pressable>
                            )}
                            <Pressable
                              onPress={() => void removePersonalSymbol(symbol.id)}
                              style={[styles.drillIconButton, styles.drillIconButtonDanger]}
                              accessibilityRole="button"
                              accessibilityLabel={`Remover símbolo ${symbol.label}`}
                            >
                              <Text style={[styles.drillIconButtonText, styles.drillIconButtonTextDanger]}>✕</Text>
                            </Pressable>
                          </View>
                        );
                      })
                    )}
                  </View>
                </>
              )
            )}

            {configRoute === 'categorias' && (
              !isAdmin ? (
                <Text style={styles.drillEmptyHint}>Entre como cuidador para gerenciar categorias.</Text>
              ) : (
                <>
                  <Text style={styles.drillSectionTitle}>CATEGORIAS ATUAIS</Text>
                  <View style={styles.drillListCard}>
                    {customCategories.length === 0 ? (
                      <Text style={styles.drillEmptyHint}>Nenhuma categoria customizada ainda.</Text>
                    ) : (
                      customCategories.map((cat, index) => {
                        const count = personalSymbols.filter(ps => ps.categoryId === cat.id).length;
                        const isEditing = editingCategoryId === cat.id;
                        return (
                          <View
                            key={`cat-edit-${cat.id}`}
                            style={[styles.drillItemRow, index > 0 && styles.drillItemRowDivider]}
                          >
                            {isEditing ? (
                              <TextInput
                                value={editingCategoryName}
                                onChangeText={setEditingCategoryName}
                                style={styles.drillInlineInput}
                                autoFocus
                                onSubmitEditing={commitEditCategory}
                                placeholder="Nome da categoria"
                                placeholderTextColor={theme.colors.textMuted}
                              />
                            ) : (
                              <View style={{ flex: 1 }}>
                                <Text style={styles.drillItemLabel} numberOfLines={1}>
                                  {cat.name}
                                </Text>
                                <Text style={styles.drillItemSubLabel}>
                                  {count} símbolo{count === 1 ? '' : 's'}
                                </Text>
                              </View>
                            )}
                            {isEditing ? (
                              <>
                                <Pressable
                                  onPress={commitEditCategory}
                                  style={styles.drillIconButton}
                                  accessibilityRole="button"
                                  accessibilityLabel="Salvar categoria"
                                >
                                  <Text style={styles.drillIconButtonText}>OK</Text>
                                </Pressable>
                                <Pressable
                                  onPress={cancelEditCategory}
                                  style={[styles.drillIconButton, styles.drillIconButtonDanger]}
                                  accessibilityRole="button"
                                  accessibilityLabel="Cancelar edição"
                                >
                                  <Text style={[styles.drillIconButtonText, styles.drillIconButtonTextDanger]}>✕</Text>
                                </Pressable>
                              </>
                            ) : (
                              <>
                                <Pressable
                                  onPress={() => startEditCategory(cat)}
                                  style={styles.drillIconButton}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Renomear ${cat.name}`}
                                >
                                  <Text style={styles.drillIconButtonText}>✎</Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => removeCustomCategory(cat.id)}
                                  style={[styles.drillIconButton, styles.drillIconButtonDanger]}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Remover ${cat.name}`}
                                >
                                  <Text style={[styles.drillIconButtonText, styles.drillIconButtonTextDanger]}>✕</Text>
                                </Pressable>
                              </>
                            )}
                          </View>
                        );
                      })
                    )}
                  </View>

                  <Text style={styles.drillSectionTitle}>ADICIONAR</Text>
                  <View style={styles.drillSectionCard}>
                    <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                      <TextInput
                        value={newCustomCategoryName}
                        onChangeText={setNewCustomCategoryName}
                        placeholder="Nova categoria (ex: Casa)"
                        placeholderTextColor={theme.colors.textMuted}
                        style={styles.drillInlineInput}
                        onSubmitEditing={addCustomCategory}
                      />
                      <Pressable
                        onPress={addCustomCategory}
                        style={styles.drillPrimaryButton}
                        accessibilityRole="button"
                        accessibilityLabel="Adicionar categoria"
                      >
                        <Text style={styles.drillPrimaryButtonText}>Adicionar</Text>
                      </Pressable>
                    </View>
                    <Text style={styles.drillFieldHint}>
                      Remover uma categoria não apaga os símbolos — eles ficam como "Sem categoria".
                    </Text>
                  </View>
                </>
              )
            )}

            {configRoute === 'rotina' && (
              !isAdmin ? (
                <Text style={styles.drillEmptyHint}>Entre como cuidador para editar a rotina do dia.</Text>
              ) : (
                <>
                  <Text style={styles.drillSectionTitle}>PASSOS DO DIA</Text>
                  <View style={styles.drillSectionCard}>
                    <Text style={styles.drillFieldHint}>
                      Cada passo é uma imagem (símbolo, foto ou da galeria). A criança vê a imagem grande e ouve o passo ao tocar.
                    </Text>
                    <View style={styles.phraseEditorList}>
                      {routineSteps.length === 0 && (
                        <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                          Nenhum passo na rotina ainda.
                        </Text>
                      )}
                      {routineSteps.map((step, index) => {
                        const stepDays = step.activeDays && step.activeDays.length > 0 ? step.activeDays : ROUTINE_DAYS;
                        return (
                          <View
                            key={`routine-edit-${step.id}`}
                            style={styles.routineStepEditCard}
                          >
                            <View style={[styles.phraseEditorRow, isHighContrast && styles.phraseEditorRowHighContrast]}>
                              <Text
                                style={[styles.phraseEditorLabel, isHighContrast && styles.textHighContrast]}
                                numberOfLines={1}
                              >
                                {index + 1}. {step.label}
                              </Text>
                              <Pressable
                                onPress={() => moveRoutineStep(step.id, -1)}
                                disabled={index === 0}
                                style={[styles.phraseEditorButton, index === 0 && styles.coreVocabEditorButtonDisabled]}
                                accessibilityRole="button"
                                accessibilityLabel={`Mover ${step.label} para cima`}
                              >
                                <Text style={styles.phraseEditorButtonText}>↑</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => moveRoutineStep(step.id, 1)}
                                disabled={index === routineSteps.length - 1}
                                style={[
                                  styles.phraseEditorButton,
                                  index === routineSteps.length - 1 && styles.coreVocabEditorButtonDisabled
                                ]}
                                accessibilityRole="button"
                                accessibilityLabel={`Mover ${step.label} para baixo`}
                              >
                                <Text style={styles.phraseEditorButtonText}>↓</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => removeRoutineStep(step.id)}
                                style={[styles.phraseEditorButton, styles.phraseEditorButtonDanger]}
                                accessibilityRole="button"
                                accessibilityLabel={`Remover passo ${step.label}`}
                              >
                                <Text style={[styles.phraseEditorButtonText, styles.phraseEditorButtonTextDanger]}>✕</Text>
                              </Pressable>
                            </View>
                            <View style={styles.routineDayChipsRow}>
                              {ROUTINE_DAYS.map(day => {
                                const active = stepDays.includes(day);
                                return (
                                  <Pressable
                                    key={`step-${step.id}-day-${day}`}
                                    onPress={() => toggleStepDay(step.id, day)}
                                    style={[styles.routineDayChip, active && styles.routineDayChipActive]}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${active ? 'Desativar' : 'Ativar'} ${ROUTINE_DAY_LABELS[day]} para passo ${step.label}`}
                                  >
                                    <Text style={[styles.routineDayChipText, active && styles.routineDayChipTextActive]}>
                                      {ROUTINE_DAY_LABELS[day]}
                                    </Text>
                                  </Pressable>
                                );
                              })}
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    {!routineDraft && (
                      <>
                        <Text style={[styles.routinePickerSectionTitle, isHighContrast && styles.textHighContrast]}>
                          Adicionar passo
                        </Text>
                        <View style={styles.routinePickerSourceRow}>
                          <Pressable
                            onPress={() => {
                              triggerHaptic('light');
                              setIsRoutineSymbolPickerOpen(prev => !prev);
                            }}
                            style={[
                              styles.routinePickerSourceButton,
                              isRoutineSymbolPickerOpen && styles.routinePickerSourceButtonActive
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel="Escolher um símbolo"
                          >
                            <Text style={styles.routinePickerSourceIcon}>★</Text>
                            <Text style={styles.routinePickerSourceLabel}>Símbolo</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              triggerHaptic('light');
                              setIsRoutineSymbolPickerOpen(false);
                              void pickRoutineImageFromCamera();
                            }}
                            style={styles.routinePickerSourceButton}
                            disabled={pickerBusy}
                            accessibilityRole="button"
                            accessibilityLabel="Tirar foto do passo"
                          >
                            <Text style={styles.routinePickerSourceIcon}>📷</Text>
                            <Text style={styles.routinePickerSourceLabel}>Câmera</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              triggerHaptic('light');
                              setIsRoutineSymbolPickerOpen(false);
                              void pickRoutineImageFromGallery();
                            }}
                            style={styles.routinePickerSourceButton}
                            disabled={pickerBusy}
                            accessibilityRole="button"
                            accessibilityLabel="Escolher imagem da galeria"
                          >
                            <Text style={styles.routinePickerSourceIcon}>🖼</Text>
                            <Text style={styles.routinePickerSourceLabel}>Galeria</Text>
                          </Pressable>
                        </View>

                        {isRoutineSymbolPickerOpen && (
                          <View style={[styles.routineSymbolPicker, isHighContrast && styles.routineSymbolPickerHighContrast]}>
                            {personalSymbols.length === 0 && favorites.length === 0 ? (
                              <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                                Nenhum símbolo pessoal ou favorito disponível. Use Câmera ou Galeria, ou crie símbolos pessoais primeiro.
                              </Text>
                            ) : (
                              <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.routineSymbolPickerRow}
                              >
                                {personalSymbols.map(ps => (
                                  <Pressable
                                    key={`routine-pick-personal-${ps.id}`}
                                    onPress={() => openRoutineDraftFromPersonalSymbol(ps)}
                                    style={styles.routineSymbolPickerItem}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Usar símbolo ${ps.label}`}
                                  >
                                    <Image source={{ uri: ps.imageUri }} style={styles.routineSymbolPickerThumb} resizeMode="cover" />
                                    <Text style={styles.routineSymbolPickerCaption} numberOfLines={1}>{ps.label}</Text>
                                    {ps.audioUri ? <Text style={styles.routineSymbolPickerAudioBadge}>🔊</Text> : null}
                                  </Pressable>
                                ))}
                                {favorites.map(fav => (
                                  <Pressable
                                    key={`routine-pick-fav-${fav.id}`}
                                    onPress={() => openRoutineDraftFromSymbol(fav)}
                                    style={styles.routineSymbolPickerItem}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Usar símbolo ${fav.label}`}
                                  >
                                    <CachedImage uri={fav.imageUrl} style={styles.routineSymbolPickerThumb} resizeMode="contain" />
                                    <Text style={styles.routineSymbolPickerCaption} numberOfLines={1}>{fav.label}</Text>
                                  </Pressable>
                                ))}
                              </ScrollView>
                            )}
                          </View>
                        )}
                      </>
                    )}

                    {routineDraft && (
                      <View style={[styles.routineDraftCard, isHighContrast && styles.configSectionCardHighContrast]}>
                        <Image
                          source={{ uri: routineDraft.imageUri }}
                          style={styles.routineDraftPreview}
                          resizeMode="cover"
                          accessibilityLabel="Previsualização do passo"
                        />
                        <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                          Nome do passo (a criança vai ouvir esse texto):
                        </Text>
                        <TextInput
                          value={routineDraft.label}
                          onChangeText={text => setRoutineDraft(prev => (prev ? { ...prev, label: text } : prev))}
                          placeholder="Ex: escovar dentes"
                          placeholderTextColor={theme.colors.textSoft}
                          style={[styles.modalInput, isHighContrast && styles.inputHighContrast]}
                          maxLength={40}
                        />
                        {routineDraft.audioUri && (
                          <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                            🔊 Esse passo tem voz gravada do cuidador (será reproduzida no lugar do TTS).
                          </Text>
                        )}
                        <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                          Dias da semana em que esse passo aparece:
                        </Text>
                        <View style={styles.routineDayChipsRow}>
                          {ROUTINE_DAYS.map(day => {
                            const active = routineDraft.activeDays.includes(day);
                            return (
                              <Pressable
                                key={`draft-day-${day}`}
                                onPress={() => toggleDraftDay(day)}
                                style={[styles.routineDayChip, active && styles.routineDayChipActive]}
                                accessibilityRole="button"
                                accessibilityLabel={`${active ? 'Desativar' : 'Ativar'} ${ROUTINE_DAY_LABELS[day]}`}
                              >
                                <Text style={[styles.routineDayChipText, active && styles.routineDayChipTextActive]}>
                                  {ROUTINE_DAY_LABELS[day]}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                        <View style={styles.routineDraftActionsRow}>
                          <Pressable
                            onPress={saveRoutineDraft}
                            style={[styles.modalButtonPrimary, styles.routineDraftActionButton]}
                            accessibilityRole="button"
                            accessibilityLabel="Salvar passo da rotina"
                          >
                            <Text style={styles.modalButtonPrimaryText}>Salvar passo</Text>
                          </Pressable>
                          <Pressable
                            onPress={cancelRoutineDraft}
                            style={[styles.modalButtonLight, styles.routineDraftActionButton]}
                            accessibilityRole="button"
                            accessibilityLabel="Descartar passo"
                          >
                            <Text>Cancelar</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}

                    <Pressable
                      onPress={resetTodayRoutineProgress}
                      style={styles.modalButtonLight}
                      accessibilityRole="button"
                      accessibilityLabel="Zerar progresso do dia"
                    >
                      <Text>Zerar progresso do dia ({routineProgress.completedStepIds.length}/{routineSteps.length})</Text>
                    </Pressable>

                    <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                      Maximo de {ROUTINE_STEPS_MAX} passos. O progresso reinicia automaticamente no proximo dia.
                    </Text>
                  </View>
                </>
              )
            )}

            {configRoute === 'cenas' && (
              !isAdmin ? (
                <Text style={styles.drillEmptyHint}>Entre como cuidador para gerenciar cenas visuais.</Text>
              ) : (
                <>
                  <Text style={styles.drillSectionTitle}>CENAS</Text>
                  <View style={styles.drillSectionCard}>
                    <Text style={styles.drillFieldHint}>
                      Tire fotos de ambientes (cozinha, quarto) e marque os itens. A criança toca em cada item e ouve o nome.
                    </Text>
                    <View style={styles.routinePickerSourceRow}>
                      <Pressable
                        onPress={() => void pickScenePhotoFromCamera()}
                        style={styles.routinePickerSourceButton}
                        disabled={pickerBusy}
                        accessibilityRole="button"
                        accessibilityLabel="Tirar foto de uma cena"
                      >
                        <Text style={styles.routinePickerSourceIcon}>📷</Text>
                        <Text style={styles.routinePickerSourceLabel}>Nova foto</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => void pickScenePhotoFromGallery()}
                        style={styles.routinePickerSourceButton}
                        disabled={pickerBusy}
                        accessibilityRole="button"
                        accessibilityLabel="Escolher cena da galeria"
                      >
                        <Text style={styles.routinePickerSourceIcon}>🖼</Text>
                        <Text style={styles.routinePickerSourceLabel}>Da galeria</Text>
                      </Pressable>
                    </View>

                    <View style={styles.sceneListContainer}>
                      {visualScenes.length === 0 && (
                        <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                          Nenhuma cena ainda.
                        </Text>
                      )}
                      {visualScenes.map(scene => (
                        <View
                          key={`scene-row-${scene.id}`}
                          style={[styles.sceneListRow, isHighContrast && styles.phraseEditorRowHighContrast]}
                        >
                          <Image source={{ uri: scene.photoUri }} style={styles.sceneListThumb} resizeMode="cover" />
                          <View style={styles.sceneListInfo}>
                            <Text style={[styles.sceneListName, isHighContrast && styles.textHighContrast]} numberOfLines={1}>
                              {scene.name}
                            </Text>
                            <Text style={[styles.sceneListMeta, isHighContrast && styles.textMutedHighContrast]}>
                              {scene.hotspots.length} {scene.hotspots.length === 1 ? 'item marcado' : 'itens marcados'}
                            </Text>
                          </View>
                          <Pressable
                            onPress={() => editExistingScene(scene)}
                            style={styles.phraseEditorButton}
                            accessibilityRole="button"
                            accessibilityLabel={`Editar cena ${scene.name}`}
                          >
                            <Text style={styles.phraseEditorButtonText}>✎</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => void deleteVisualScene(scene.id)}
                            style={[styles.phraseEditorButton, styles.phraseEditorButtonDanger]}
                            accessibilityRole="button"
                            accessibilityLabel={`Remover cena ${scene.name}`}
                          >
                            <Text style={[styles.phraseEditorButtonText, styles.phraseEditorButtonTextDanger]}>✕</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>

                    <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                      Máximo de {VISUAL_SCENES_MAX} cenas com até {HOTSPOTS_PER_SCENE_MAX} marcadores cada.
                    </Text>
                  </View>
                </>
              )
            )}

            {configRoute === 'aparencia' && (
              <>
                <Text style={styles.drillSectionTitle}>ESCALA DA INTERFACE</Text>
                <View style={styles.drillSectionCard}>
                  <Text style={styles.drillFieldHint}>Ajuste a densidade visual conforme a preferência da criança.</Text>
                  <View style={styles.drillChipRow}>
                    <OptionChip label="Compacto"    active={uiScale === 'compacto'}    onPress={() => setUiScale('compacto')} />
                    <OptionChip label="Padrão"      active={uiScale === 'padrao'}      onPress={() => setUiScale('padrao')} />
                    <OptionChip label="Confortável" active={uiScale === 'confortavel'} onPress={() => setUiScale('confortavel')} />
                  </View>
                </View>

                <Text style={styles.drillSectionTitle}>IMAGENS POR LINHA</Text>
                <View style={styles.drillSectionCard}>
                  <Text style={styles.drillFieldHint}>Quantos pictogramas aparecem por linha na grade principal.</Text>
                  <View style={styles.drillChipRow}>
                    {GRID_COLUMNS_OPTIONS.map(option => (
                      <OptionChip
                        key={`grid-col-${option}`}
                        label={`${option} col`}
                        active={gridColumns === option}
                        onPress={() => setGridColumns(option)}
                      />
                    ))}
                  </View>
                </View>
              </>
            )}

            {configRoute === 'acessibilidade' && (
              <>
                <Text style={styles.drillSectionTitle}>TEMA DO APLICATIVO</Text>
                <View style={styles.drillSectionCard}>
                  <Text style={styles.drillFieldHint}>
                    O tema muda as cores do aplicativo. Sereno Escuro é um modo escuro calmo para uso noturno ou crianças sensíveis a brilho.
                  </Text>
                  <View style={styles.drillChipRow}>
                    <OptionChip label="Sálvia & Creme" active={themeName === 'default'}        onPress={() => setThemeName('default')} />
                    <OptionChip label="Terracota"      active={themeName === 'terracota'}      onPress={() => setThemeName('terracota')} />
                    <OptionChip label="Sereno Escuro"  active={themeName === 'sereno-escuro'}  onPress={() => setThemeName('sereno-escuro')} />
                  </View>
                </View>

                <Text style={styles.drillSectionTitle}>FEEDBACK</Text>
                <View style={styles.drillSectionCard}>
                  <View style={styles.drillToggleRow}>
                    <Text style={styles.drillFieldLabel}>Feedback visual ao tocar</Text>
                    <Switch
                      value={visualFeedbackEnabled}
                      onValueChange={setVisualFeedbackEnabled}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      thumbColor="#FFFFFF"
                      accessibilityLabel="Alternar feedback visual"
                    />
                  </View>
                  <Text style={styles.drillFieldHint}>
                    Quando ativado, um halo discreto aparece ao redor das figuras tocadas.
                  </Text>
                </View>
              </>
            )}

            {configRoute === 'secoes' && (
              <>
                <Text style={styles.drillSectionTitle}>ABAS NA TELA PRINCIPAL</Text>
                <View style={styles.drillSectionCard}>
                  <Text style={styles.drillFieldHint}>
                    Ative só as abas que a criança vai usar. Menos abas deixam a tela mais simples e focada. Elas vêm desativadas por padrão.
                  </Text>
                </View>
                <View style={styles.drillSectionCard}>
                  <View style={styles.drillToggleRow}>
                    <Text style={styles.drillFieldLabel}>💬 Frases</Text>
                    <Switch
                      value={sectionVisibility.frases}
                      onValueChange={() => toggleSection('frases')}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      thumbColor="#FFFFFF"
                      accessibilityLabel="Alternar aba Frases"
                    />
                  </View>
                  <View style={styles.drillToggleRow}>
                    <Text style={styles.drillFieldLabel}>🕐 Histórico</Text>
                    <Switch
                      value={sectionVisibility.historico}
                      onValueChange={() => toggleSection('historico')}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      thumbColor="#FFFFFF"
                      accessibilityLabel="Alternar aba Histórico"
                    />
                  </View>
                  <View style={styles.drillToggleRow}>
                    <Text style={styles.drillFieldLabel}>📅 Rotina</Text>
                    <Switch
                      value={sectionVisibility.rotina}
                      onValueChange={() => toggleSection('rotina')}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      thumbColor="#FFFFFF"
                      accessibilityLabel="Alternar aba Rotina"
                    />
                  </View>
                  <View style={styles.drillToggleRow}>
                    <Text style={styles.drillFieldLabel}>🏠 Cenas</Text>
                    <Switch
                      value={sectionVisibility.cenas}
                      onValueChange={() => toggleSection('cenas')}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      thumbColor="#FFFFFF"
                      accessibilityLabel="Alternar aba Cenas"
                    />
                  </View>
                </View>
              </>
            )}

            {configRoute === 'voz' && (
              <>
                <Text style={styles.drillSectionTitle}>VELOCIDADE</Text>
                <View style={styles.drillSectionCard}>
                  <Text style={styles.drillFieldLabel}>Velocidade da fala: {rate.toFixed(1)}</Text>
                  <View style={styles.drillChipRow}>
                    <OptionChip label="0.8" active={rate === 0.8} onPress={() => setRate(0.8)} />
                    <OptionChip label="1.0" active={rate === 1}   onPress={() => setRate(1)} />
                    <OptionChip label="1.2" active={rate === 1.2} onPress={() => setRate(1.2)} />
                  </View>
                </View>

                <Text style={styles.drillSectionTitle}>TOM</Text>
                <View style={styles.drillSectionCard}>
                  <Text style={styles.drillFieldLabel}>Tom da voz: {pitch.toFixed(1)}</Text>
                  <View style={styles.drillChipRow}>
                    <OptionChip label="0.8" active={pitch === 0.8} onPress={() => setPitch(0.8)} />
                    <OptionChip label="1.0" active={pitch === 1}   onPress={() => setPitch(1)} />
                    <OptionChip label="1.2" active={pitch === 1.2} onPress={() => setPitch(1.2)} />
                  </View>
                </View>

                <Pressable
                  style={styles.drillPrimaryButton}
                  onPress={() =>
                    Speech.speak('Olá, esta é a voz do aplicativo.', { language: 'pt-BR', rate, pitch })
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Testar voz"
                >
                  <Text style={styles.drillPrimaryButtonText}>Testar voz</Text>
                </Pressable>
              </>
            )}

            {configRoute === 'senha' && (
              needsAdminSetup ? (
                <>
                  <View style={styles.drillSectionCard}>
                    <Text style={styles.drillFieldHint}>
                      Defina uma senha com pelo menos 4 caracteres para proteger as configurações da criança. Apenas o cuidador deve saber.
                    </Text>
                    <TextInput
                      value={newAdminPassword}
                      onChangeText={setNewAdminPassword}
                      placeholder="Nova senha"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry
                      style={styles.drillPasswordInput}
                      autoFocus
                    />
                    <TextInput
                      value={confirmAdminPassword}
                      onChangeText={setConfirmAdminPassword}
                      placeholder="Confirmar senha"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry
                      style={styles.drillPasswordInput}
                    />
                    <Pressable
                      style={styles.drillPrimaryButton}
                      onPress={() => void handleSaveAdminPassword()}
                      accessibilityRole="button"
                      accessibilityLabel="Criar senha e entrar"
                    >
                      <Text style={styles.drillPrimaryButtonText}>Criar senha e entrar</Text>
                    </Pressable>
                  </View>
                </>
              ) : !isAdmin ? (
                <>
                  <Text style={styles.drillSectionTitle}>ENTRAR COMO CUIDADOR</Text>
                  <View style={styles.drillSectionCard}>
                    <Text style={styles.drillFieldHint}>
                      Informe a senha para gerenciar favoritos, símbolos pessoais, frases e configurações avançadas.
                    </Text>
                    <TextInput
                      value={adminPassword}
                      onChangeText={setAdminPassword}
                      placeholder="Senha do cuidador"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry
                      style={styles.drillPasswordInput}
                      autoFocus
                      onSubmitEditing={handleAdminLogin}
                    />
                    <Pressable
                      style={styles.drillPrimaryButton}
                      onPress={handleAdminLogin}
                      accessibilityRole="button"
                      accessibilityLabel="Entrar como cuidador"
                    >
                      <Text style={styles.drillPrimaryButtonText}>Entrar</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.drillSectionTitle}>ALTERAR SENHA</Text>
                  <View style={styles.drillSectionCard}>
                    <Text style={styles.drillFieldHint}>
                      A nova senha precisa ter pelo menos 4 caracteres.
                    </Text>
                    <TextInput
                      value={adminPassword}
                      onChangeText={setAdminPassword}
                      placeholder="Senha atual"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry
                      style={styles.drillPasswordInput}
                    />
                    <TextInput
                      value={newAdminPassword}
                      onChangeText={setNewAdminPassword}
                      placeholder="Nova senha"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry
                      style={styles.drillPasswordInput}
                    />
                    <TextInput
                      value={confirmAdminPassword}
                      onChangeText={setConfirmAdminPassword}
                      placeholder="Confirmar nova senha"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry
                      style={styles.drillPasswordInput}
                    />
                    <Pressable
                      style={styles.drillPrimaryButton}
                      onPress={() => void handleUpdateAdminPassword()}
                      accessibilityRole="button"
                      accessibilityLabel="Atualizar senha"
                    >
                      <Text style={styles.drillPrimaryButtonText}>Atualizar senha</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.drillSectionTitle}>SESSÃO</Text>
                  <View style={styles.drillSectionCard}>
                    <Text style={styles.drillFieldHint}>
                      Você está como cuidador. Para devolver o controle à criança, encerre a sessão.
                    </Text>
                    <Pressable
                      style={styles.drillDangerButton}
                      onPress={() => {
                        handleAdminLogout();
                        setIsConfigModalOpen(false);
                        resetConfigFields();
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Sair do modo cuidador"
                    >
                      <Text style={styles.drillDangerButtonText}>Sair do modo cuidador</Text>
                    </Pressable>
                  </View>
                </>
              )
            )}

            {configRoute === 'chave-ia' && (
              !isAdmin ? (
                <Text style={styles.drillEmptyHint}>Entre como cuidador para alterar a chave da IA.</Text>
              ) : (
                <>
                  <Text style={styles.drillSectionTitle}>CHAVE DA IA (GEMINI)</Text>
                  <View style={styles.drillSectionCard}>
                    <Text style={styles.drillFieldHint}>
                      A chave do `.env` é usada por padrão. Você pode substituir por outra aqui — fica salva apenas neste dispositivo.
                    </Text>
                    <TextInput
                      value={aiApiKeyInput}
                      onChangeText={setAiApiKeyInput}
                      placeholder="EXPO_PUBLIC_GOOGLE_AI_API_KEY"
                      placeholderTextColor={theme.colors.textMuted}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.drillPasswordInput}
                    />
                    <Pressable
                      style={styles.drillPrimaryButton}
                      onPress={() => void handleSaveAiKey()}
                      accessibilityRole="button"
                      accessibilityLabel="Salvar chave da IA"
                    >
                      <Text style={styles.drillPrimaryButtonText}>Salvar chave da IA</Text>
                    </Pressable>
                  </View>
                </>
              )
            )}
              </ScrollView>
            </>
          )}
          {toast && (
            <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
              <Text style={styles.toastText}>{toast.message}</Text>
            </View>
          )}
        </View>
      </IOSBottomSheet>

      {viewerScene && (
        <SceneViewer
          scene={viewerScene}
          onClose={() => setViewerScene(null)}
          onHotspotPress={speakHotspot}
        />
      )}

      {editingScene && (
        <SceneEditor
          scene={editingScene}
          onUpdateName={name => setEditingScene(prev => (prev ? { ...prev, name } : prev))}
          onAddHotspot={addHotspotToDraft}
          onUpdateHotspotLabel={updateHotspotLabel}
          onRemoveHotspot={removeHotspot}
          onStartRecord={startHotspotRecording}
          onStopRecord={stopHotspotRecording}
          recordingId={hotspotRecordingId}
          onCancel={cancelSceneEditor}
          onSave={() => void saveSceneEditor()}
          isHighContrast={isHighContrast}
        />
      )}

      {toast && (
        <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------------------
// Espelho de modulo do tema/estilos ativos.
// Os componentes auxiliares abaixo sao definidos fora de App e renderizam
// sempre como filhos de App. App atualiza estes espelhos no inicio do seu
// render, antes dos filhos renderizarem, entao os auxiliares sempre leem o
// tema ativo. Inicializados com o tema padrao para satisfazer o tsc.
// ----------------------------------------------------------------------------
let moduleTheme: Theme = resolveTheme('default');
let moduleStyles: ReturnType<typeof makeStyles> = makeStyles(moduleTheme);

function CategoryButton({
  label,
  active,
  onPress,
  highContrast = false
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  highContrast?: boolean;
}) {
  const styles = moduleStyles;
  return (
    <Pressable onPress={onPress} style={[styles.categoryButton, highContrast && styles.categoryButtonHighContrast, active && styles.categoryButtonActive]}>
      <Text style={styles.categoryButtonIcon}>{categoryIcon(label)}</Text>
      <Text numberOfLines={1} style={[styles.categoryButtonText, active && styles.categoryButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ConfigTab({ label, active, onPress, highContrast = false }: { label: string; active: boolean; onPress: () => void; highContrast?: boolean }) {
  const styles = moduleStyles;
  return (
    <Pressable onPress={onPress} style={[styles.configTab, highContrast && styles.configTabHighContrast, active && styles.configTabActive]}>
      <Text style={[styles.configTabText, highContrast && styles.configTabTextHighContrast, active && styles.configTabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const CONFIG_ROUTE_TITLES: Record<Exclude<ConfigRoute, 'home'>, string> = {
  voz: 'Voz',
  acessibilidade: 'Acessibilidade',
  aparencia: 'Aparência',
  vocabulario: 'Vocabulário core',
  frases: 'Frases prontas',
  simbolos: 'Símbolos pessoais',
  categorias: 'Categorias',
  rotina: 'Rotina do dia',
  cenas: 'Cenas visuais',
  secoes: 'Abas visíveis',
  senha: 'Senha do cuidador',
  'chave-ia': 'Chave da IA'
};

function ConfigGroupRow({
  icon,
  label,
  onPress,
  locked = false,
  danger = false,
  first = false
}: {
  icon: string;
  label: string;
  onPress: () => void;
  locked?: boolean;
  danger?: boolean;
  first?: boolean;
}) {
  const styles = moduleStyles;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.sRow, !first && styles.sRowDivider, pressed && { opacity: 0.6 }]}
      accessibilityRole="button"
      accessibilityLabel={`${label}${locked ? ' (bloqueado)' : ''}`}
    >
      <View style={styles.sIcon}><Text style={styles.sIconEmoji}>{icon}</Text></View>
      <Text style={[styles.sLabel, danger && styles.sLabelDanger]} numberOfLines={1}>{label}</Text>
      {locked ? <Text style={styles.sLockBadge}>🔒</Text> : null}
      {!danger ? <Text style={styles.sChevron}>›</Text> : null}
    </Pressable>
  );
}

function OptionChip({ label, active, onPress, highContrast = false }: { label: string; active: boolean; onPress: () => void; highContrast?: boolean }) {
  const styles = moduleStyles;
  return (
    <Pressable onPress={onPress} style={[styles.optionChip, highContrast && styles.optionChipHighContrast, active && styles.optionChipActive]}>
      <Text style={[styles.optionChipText, highContrast && styles.optionChipTextHighContrast, active && styles.optionChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function CachedImage({
  uri,
  style,
  resizeMode = 'contain'
}: {
  uri: string;
  style: object;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}) {
  const [resolvedUri, setResolvedUri] = useState(uri);

  useEffect(() => {
    let cancelled = false;
    setResolvedUri(uri);
    if (!uri) return;
    void getCachedImageUri(uri).then(cachedUri => {
      if (!cancelled) {
        setResolvedUri(cachedUri);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [uri]);

  return <Image source={{ uri: resolvedUri }} style={style} resizeMode={resizeMode} />;
}

function ActionButton({
  label,
  onPress,
  tone
}: {
  label: string;
  onPress: () => void;
  tone: 'primary' | 'secondary' | 'muted' | 'neutral';
}) {
  const styles = moduleStyles;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionButton,
        tone === 'primary' && styles.actionPrimary,
        tone === 'secondary' && styles.actionSecondary,
        tone === 'muted' && styles.actionMuted,
        tone === 'neutral' && styles.actionNeutral
      ]}
    >
      <Text style={[styles.actionButtonText, tone === 'muted' && styles.actionMutedText, tone === 'neutral' && styles.actionNeutralText]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SymbolCard({
  item,
  columns,
  favorite,
  onPress,
  onFavoritePress,
  onLongPress,
  hasAudio = false,
  isAdmin
}: {
  item: SymbolItem;
  columns: GridColumns;
  favorite: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
  onLongPress?: () => void;
  hasAudio?: boolean;
  isAdmin: boolean;
}) {
  const styles = moduleStyles;
  const isDense = columns >= 4;
  const isUltraDense = columns >= 5;
  const tileColor = categoryColorFamily(item.category);
  return (
    <Pressable
      style={[styles.symbolCard, isDense && styles.symbolCardDense, isUltraDense && styles.symbolCardUltraDense]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
    >
      {hasAudio && (
        <View style={styles.audioBadge} accessibilityLabel="Simbolo com voz gravada">
          <Text style={styles.audioBadgeText}>🔊</Text>
        </View>
      )}
      {isAdmin && (
        <Pressable onPress={onFavoritePress} style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}>
          <Text style={styles.favoriteButtonText}>{favorite ? '★' : '☆'}</Text>
        </Pressable>
      )}
      <View
        style={[
          styles.symbolTile,
          isDense && styles.symbolTileDense,
          isUltraDense && styles.symbolTileUltraDense,
          { backgroundColor: tileColor }
        ]}
      >
        <CachedImage uri={item.imageUrl} style={[styles.symbolImage, isDense && styles.symbolImageDense, isUltraDense && styles.symbolImageUltraDense]} resizeMode="contain" />
      </View>
      <Text style={[styles.symbolLabel, isDense && styles.symbolLabelDense]} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

function RoutineStepCard({
  step,
  stepNumber,
  completed,
  onToggle,
  onPreview,
  highContrast,
  uiScaleFactor
}: {
  step: RoutineStep;
  stepNumber: number;
  completed: boolean;
  onToggle: () => void;
  onPreview: () => void;
  highContrast: boolean;
  uiScaleFactor: number;
}) {
  const styles = moduleStyles;
  return (
    <Pressable
      onPress={onToggle}
      onLongPress={onPreview}
      delayLongPress={300}
      style={[
        styles.routineStepCard,
        completed && styles.routineStepCardDone,
        highContrast && styles.routineStepCardHighContrast
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${completed ? 'Desmarcar' : 'Marcar'} passo ${stepNumber}: ${step.label}. Segure para ouvir.`}
      accessibilityState={{ checked: completed }}
    >
      <View style={styles.routineStepImageWrap}>
        {step.imageUri ? (
          <Image source={{ uri: step.imageUri }} style={styles.routineStepImage} resizeMode="cover" />
        ) : (
          <View style={[styles.routineStepImage, styles.routineStepImagePlaceholder]}>
            <Text style={styles.routineStepImagePlaceholderNumber}>{stepNumber}</Text>
          </View>
        )}
        <View style={[styles.routineStepNumberBadge, completed && styles.routineStepNumberBadgeDone]}>
          <Text style={styles.routineStepNumberBadgeText}>{stepNumber}</Text>
        </View>
        {step.audioUri ? (
          <View style={styles.routineStepAudioBadge}>
            <Text style={styles.routineStepAudioBadgeText}>🔊</Text>
          </View>
        ) : null}
        {completed && (
          <View style={styles.routineStepDoneOverlay}>
            <Text style={styles.routineStepDoneCheck}>✓</Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.routineStepLabel,
          { fontSize: 14 * uiScaleFactor },
          completed && styles.routineStepLabelDone,
          highContrast && styles.textHighContrast
        ]}
        numberOfLines={2}
      >
        {step.label}
      </Text>
    </Pressable>
  );
}

function SceneViewer({
  scene,
  onClose,
  onHotspotPress
}: {
  scene: VisualScene;
  onClose: () => void;
  onHotspotPress: (hotspot: VisualSceneHotspot) => void;
}) {
  const styles = moduleStyles;
  const [photoSize, setPhotoSize] = useState<{ width: number; height: number } | null>(null);
  return (
    <Modal visible animationType="fade" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.sceneViewerContainer}>
        <View style={styles.sceneViewerHeader}>
          <Pressable
            onPress={onClose}
            style={styles.sceneViewerCloseButton}
            accessibilityRole="button"
            accessibilityLabel="Fechar cena"
          >
            <Text style={styles.sceneViewerCloseLabel}>Fechar</Text>
          </Pressable>
          <Text style={styles.sceneViewerTitle} numberOfLines={1}>{scene.name}</Text>
          <View style={styles.sceneViewerCloseButton} />
        </View>
        <View
          style={styles.sceneViewerImageWrap}
          onLayout={e => setPhotoSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        >
          <Image source={{ uri: scene.photoUri }} style={styles.sceneViewerImage} resizeMode="contain" />
          {photoSize && scene.hotspots.map(h => {
            const cx = h.x * photoSize.width;
            const cy = h.y * photoSize.height;
            const size = Math.max(48, h.radius * photoSize.width * 2);
            return (
              <Pressable
                key={`hs-${h.id}`}
                onPress={() => onHotspotPress(h)}
                style={[
                  styles.sceneViewerHotspot,
                  { left: cx - size / 2, top: cy - size / 2, width: size, height: size, borderRadius: size / 2 }
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Tocar para ouvir ${h.label}`}
              >
                <View style={styles.sceneViewerHotspotDot} />
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.sceneViewerHint}>Toque nos pontos para ouvir o nome do item.</Text>
      </SafeAreaView>
    </Modal>
  );
}

function SceneEditor({
  scene,
  onUpdateName,
  onAddHotspot,
  onUpdateHotspotLabel,
  onRemoveHotspot,
  onStartRecord,
  onStopRecord,
  recordingId,
  onCancel,
  onSave,
  isHighContrast
}: {
  scene: VisualScene;
  onUpdateName: (name: string) => void;
  onAddHotspot: (x: number, y: number) => void;
  onUpdateHotspotLabel: (id: string, label: string) => void;
  onRemoveHotspot: (id: string) => void;
  onStartRecord: (id: string) => void;
  onStopRecord: () => void;
  recordingId: string | null;
  onCancel: () => void;
  onSave: () => void;
  isHighContrast: boolean;
}) {
  const styles = moduleStyles;
  const theme = moduleTheme;
  const [photoSize, setPhotoSize] = useState<{ width: number; height: number } | null>(null);
  return (
    <Modal visible animationType="slide" transparent={false} onRequestClose={onCancel}>
      <SafeAreaView style={styles.sceneEditorContainer}>
        <View style={styles.sceneEditorHeader}>
          <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancelar edicao da cena">
            <Text style={styles.sceneEditorHeaderAction}>Cancelar</Text>
          </Pressable>
          <Text style={styles.sceneEditorHeaderTitle}>Editar cena</Text>
          <Pressable onPress={onSave} accessibilityRole="button" accessibilityLabel="Salvar cena">
            <Text style={[styles.sceneEditorHeaderAction, styles.sceneEditorHeaderActionPrimary]}>Salvar</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.sceneEditorContent}>
          <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>Nome da cena (ex: Cozinha):</Text>
          <TextInput
            value={scene.name}
            onChangeText={onUpdateName}
            placeholder="Cozinha, Quarto, Sala…"
            placeholderTextColor={theme.colors.textSoft}
            style={[styles.modalInput, isHighContrast && styles.inputHighContrast]}
            maxLength={30}
          />

          <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
            Toque na foto para marcar um item. Cada marcador precisa de um nome.
          </Text>

          <Pressable
            onPress={e => {
              if (!photoSize) return;
              const { locationX, locationY } = e.nativeEvent;
              onAddHotspot(locationX / photoSize.width, locationY / photoSize.height);
            }}
            style={styles.sceneEditorImageWrap}
            onLayout={ev => setPhotoSize({ width: ev.nativeEvent.layout.width, height: ev.nativeEvent.layout.height })}
            accessibilityRole="button"
            accessibilityLabel="Toque na foto para marcar um item"
          >
            <Image source={{ uri: scene.photoUri }} style={styles.sceneEditorImage} resizeMode="cover" />
            {photoSize && scene.hotspots.map((h, idx) => {
              const cx = h.x * photoSize.width;
              const cy = h.y * photoSize.height;
              const size = 36;
              return (
                <View
                  key={`mark-${h.id}`}
                  pointerEvents="none"
                  style={[
                    styles.sceneEditorMarker,
                    { left: cx - size / 2, top: cy - size / 2, width: size, height: size, borderRadius: size / 2 }
                  ]}
                >
                  <Text style={styles.sceneEditorMarkerNumber}>{idx + 1}</Text>
                </View>
              );
            })}
          </Pressable>

          <Text style={[styles.routinePickerSectionTitle, isHighContrast && styles.textHighContrast]}>
            Marcadores ({scene.hotspots.length})
          </Text>
          {scene.hotspots.length === 0 && (
            <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
              Nenhum marcador ainda. Toque na foto acima para adicionar.
            </Text>
          )}
          {scene.hotspots.map((h, idx) => {
            const isRecording = recordingId === h.id;
            return (
              <View
                key={`hs-edit-${h.id}`}
                style={[styles.sceneHotspotRow, isHighContrast && styles.phraseEditorRowHighContrast]}
              >
                <View style={styles.sceneHotspotRowNumber}>
                  <Text style={styles.sceneHotspotRowNumberText}>{idx + 1}</Text>
                </View>
                <View style={styles.sceneHotspotRowFields}>
                  <TextInput
                    value={h.label}
                    onChangeText={text => onUpdateHotspotLabel(h.id, text)}
                    placeholder="Nome do item (ex: prato)"
                    placeholderTextColor={theme.colors.textSoft}
                    style={[styles.modalInput, isHighContrast && styles.inputHighContrast]}
                    maxLength={30}
                  />
                  <View style={styles.sceneHotspotRowActions}>
                    <Pressable
                      onPress={() => (isRecording ? onStopRecord() : onStartRecord(h.id))}
                      style={[styles.audioButton, isRecording ? styles.audioButtonStop : styles.audioButtonRecord]}
                      accessibilityRole="button"
                      accessibilityLabel={isRecording ? 'Parar gravação' : 'Gravar voz para esse item'}
                    >
                      <Text style={styles.audioButtonText}>{isRecording ? '■ Parar' : (h.audioUri ? '🔊 Regravar' : '● Gravar')}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void onRemoveHotspot(h.id)}
                      style={[styles.phraseEditorButton, styles.phraseEditorButtonDanger]}
                      accessibilityRole="button"
                      accessibilityLabel={`Remover marcador ${idx + 1}`}
                    >
                      <Text style={[styles.phraseEditorButtonText, styles.phraseEditorButtonTextDanger]}>✕</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function AudioRecorderControls({
  isRecording,
  durationMillis,
  hasRecording,
  onStart,
  onStop,
  onPlay,
  onDiscard
}: {
  isRecording: boolean;
  durationMillis: number;
  hasRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onPlay: () => void;
  onDiscard: () => void;
}) {
  const styles = moduleStyles;
  const totalSeconds = Math.floor(Math.max(0, durationMillis) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timerLabel = `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
  return (
    <View style={styles.audioControlsRow}>
      {isRecording ? (
        <Pressable onPress={onStop} style={[styles.audioButton, styles.audioButtonStop]} accessibilityRole="button" accessibilityLabel="Parar gravacao">
          <Text style={styles.audioButtonText}>◼ Parar</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onStart} style={[styles.audioButton, styles.audioButtonRecord]} accessibilityRole="button" accessibilityLabel={hasRecording ? 'Regravar voz' : 'Iniciar gravacao'}>
          <Text style={styles.audioButtonText}>● {hasRecording ? 'Regravar' : 'Gravar'}</Text>
        </Pressable>
      )}
      {hasRecording && !isRecording && (
        <Pressable onPress={onPlay} style={[styles.audioButton, styles.audioButtonPlay]} accessibilityRole="button" accessibilityLabel="Reouvir gravacao">
          <Text style={styles.audioButtonText}>▶ Reouvir</Text>
        </Pressable>
      )}
      {hasRecording && !isRecording && (
        <Pressable onPress={onDiscard} style={[styles.audioButton, styles.audioButtonDiscard]} accessibilityRole="button" accessibilityLabel="Descartar gravacao">
          <Text style={[styles.audioButtonText, styles.audioButtonTextDiscard]}>✕</Text>
        </Pressable>
      )}
      <View style={styles.audioTimerBox}>
        <Text style={[styles.audioTimerText, isRecording && styles.audioTimerTextRecording]}>{timerLabel}</Text>
      </View>
    </View>
  );
}

function PhraseCard({
  text,
  tone,
  highContrast,
  uiScaleFactor,
  onPress,
  onDelete
}: {
  text: string;
  tone: 'saved' | 'history';
  highContrast: boolean;
  uiScaleFactor: number;
  onPress: () => void;
  onDelete?: () => void;
}) {
  const styles = moduleStyles;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.phraseCard,
        tone === 'history' && styles.phraseCardHistory,
        highContrast && styles.phraseCardHighContrast
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Falar frase ${text}`}
    >
      <Text
        style={[
          styles.phraseCardText,
          { fontSize: 16 * uiScaleFactor },
          highContrast && styles.phraseCardTextHighContrast
        ]}
      >
        {text}
      </Text>
      <View style={styles.phraseCardActions}>
        <Text style={[styles.phraseCardPlayIcon, highContrast && styles.phraseCardPlayIconHighContrast]}>▶</Text>
        {onDelete && (
          <Pressable
            onPress={onDelete}
            hitSlop={10}
            style={styles.phraseCardDeleteButton}
            accessibilityRole="button"
            accessibilityLabel={`Remover frase ${text}`}
          >
            <Text style={styles.phraseCardDeleteIcon}>✕</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

function CustomSymbolCard({
  item,
  onUse,
  onDelete,
  isAdmin
}: {
  item: CustomSymbol;
  onUse: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}) {
  const styles = moduleStyles;
  return (
    <Pressable style={styles.customCard} onPress={onUse}>
      <View style={styles.customGrid}>
        {item.symbols.slice(0, 4).map(symbol => (
          <CachedImage key={`${item.id}-${symbol.id}`} uri={symbol.imageUrl} style={styles.customImage} resizeMode="contain" />
        ))}
      </View>
      <Text style={styles.symbolLabel} numberOfLines={1}>
        {item.label}
      </Text>
      {isAdmin && (
        <Pressable onPress={onDelete} style={styles.deleteCustomButton}>
          <Text style={styles.deleteCustomButtonText}>Excluir</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  safeAreaHighContrast: {},
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 10
  },
  bootLoadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
    ...theme.shadows.sm
  },
  cardHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#334155'
  },
  textHighContrast: {
    color: '#f8fafc'
  },
  textMutedHighContrast: {
    color: '#cbd5e1'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuIcon: {
    fontSize: 22,
    color: theme.colors.primaryInk
  },
  adminBadge: {
    borderRadius: theme.radii.full,
    paddingHorizontal: 10,
    paddingVertical: 3
  },
  adminBadgeOn: {
    backgroundColor: theme.colors.primarySoft
  },
  adminBadgeOff: {
    backgroundColor: 'rgba(120, 120, 128, 0.16)'
  },
  adminBadgeText: {
    ...theme.typography.caption1,
    color: theme.colors.primaryInk,
    letterSpacing: 0.3
  },
  searchToggleButton: {
    width: 34,
    height: 34,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchToggleButtonActive: {
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary
  },
  searchToggleIcon: {
    fontSize: 16,
    color: theme.colors.primaryInk
  },
  menuItem: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10
  },
  menuItemText: {
    color: '#1e293b',
    fontWeight: '600'
  },
  searchRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: 4
  },
  searchInput: {
    ...theme.typography.callout,
    flex: 1,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radii.sm,
    borderWidth: 0,
    color: theme.colors.text,
    paddingHorizontal: 12,
    height: 36
  },
  inputHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#64748b',
    color: '#f8fafc'
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 36,
    minWidth: 78
  },
  searchClearButton: {
    width: 34,
    height: 34,
    borderRadius: theme.radii.full,
    borderWidth: 0,
    backgroundColor: theme.colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchClearButtonText: {
    color: theme.colors.textMuted,
    fontWeight: '700'
  },
  searchButtonText: {
    ...theme.typography.subheadline,
    color: '#FFFFFF'
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    paddingHorizontal: 12,
    marginBottom: 6
  },
  categoriesScroll: {
    flex: 1,
    minHeight: 46,
    maxHeight: 46
  },
  categoriesRow: {
    gap: theme.spacing.sm,
    paddingTop: 2,
    paddingBottom: 2,
    alignItems: 'center',
    paddingRight: 2,
    paddingLeft: 2
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.bgSoft,
    borderRadius: theme.radii.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minHeight: 36,
    justifyContent: 'center',
    alignSelf: 'flex-start'
  },
  categoryButtonIcon: {
    fontSize: 15
  },
  categoryButtonHighContrast: {
    backgroundColor: theme.colors.surface2
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary
  },
  categoryButtonText: {
    ...theme.typography.subheadline,
    color: theme.colors.text
  },
  categoryButtonTextActive: {
    color: '#FFFFFF'
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listCard: {
    flex: 1,
    backgroundColor: theme.colors.bgSoft,
    borderRadius: theme.radii.lg,
    borderWidth: 0,
    overflow: 'hidden'
  },
  grid: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 12
  },
  emptyText: {
    ...theme.typography.callout,
    textAlign: 'center',
    color: theme.colors.textMuted
  },
  emptyState: {
    paddingTop: 44,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  gridFiller: {
    flex: 1,
    margin: 6
  },
  symbolCard: {
    flex: 1,
    margin: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    ...theme.shadows.sm
  },
  symbolCardDense: {
    minHeight: 120,
    padding: 8
  },
  symbolCardUltraDense: {
    minHeight: 104,
    padding: 6
  },
  symbolTile: {
    width: 96,
    height: 96,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  symbolTileDense: {
    width: 60,
    height: 60,
    borderRadius: 14
  },
  symbolTileUltraDense: {
    width: 46,
    height: 46,
    borderRadius: 12
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm
  },
  favoriteButtonActive: {
    backgroundColor: theme.colors.surface
  },
  favoriteButtonText: {
    color: theme.colors.star,
    fontSize: 16
  },
  symbolImage: {
    width: 96,
    height: 96
  },
  symbolImageDense: {
    width: 60,
    height: 60
  },
  symbolImageUltraDense: {
    width: 46,
    height: 46
  },
  symbolLabel: {
    ...theme.typography.subheadline,
    marginTop: 8,
    color: theme.colors.text,
    width: '100%',
    textAlign: 'center'
  },
  symbolLabelDense: {
    fontSize: 12
  },
  customCard: {
    flex: 1 / 2,
    margin: 6,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    padding: 10,
    alignItems: 'center',
    gap: 8
  },
  customGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4
  },
  customImage: {
    width: 44,
    height: 44
  },
  deleteCustomButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  deleteCustomButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600'
  },
  composerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    ...theme.shadows.sm
  },
  phraseChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  phraseChipsScroll: {
    flex: 1
  },
  selectedList: {
    gap: 4,
    minHeight: 32,
    alignItems: 'center'
  },
  selectedImage: {
    width: 30,
    height: 30,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface
  },
  selectedTextChip: {
    minWidth: 40,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedTextChipHighContrast: {
    borderColor: '#facc15',
    backgroundColor: '#1e293b'
  },
  selectedTextChipText: {
    ...theme.typography.caption1,
    color: theme.colors.primaryInk,
    letterSpacing: 0.4
  },
  selectedTextChipTextHighContrast: {
    color: '#fde68a'
  },
  coreVocabRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm
  },
  coreVocabButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primarySoft,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center'
  },
  coreVocabButtonText: {
    ...theme.typography.caption1,
    color: theme.colors.primaryInk,
    letterSpacing: 0.3
  },
  coreVocabEditorList: {
    gap: 8,
    marginTop: 6
  },
  coreVocabEditorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#F6F7F3',
    borderWidth: 1,
    borderColor: '#E2E6D7'
  },
  coreVocabEditorRowHighContrast: {
    backgroundColor: '#0b1220',
    borderColor: '#facc15'
  },
  coreVocabEditorLabel: {
    flex: 1,
    color: '#0f172a',
    fontWeight: '700',
    letterSpacing: 0.5
  },
  coreVocabEditorButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  coreVocabEditorButtonDisabled: {
    opacity: 0.4
  },
  coreVocabEditorButtonDanger: {
    backgroundColor: '#FEE2E2'
  },
  coreVocabEditorButtonText: {
    color: '#1f2937',
    fontWeight: '700'
  },
  coreVocabEditorButtonTextDanger: {
    color: '#b91c1c'
  },
  coreVocabEditorAddRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 8
  },
  coreVocabEditorInput: {
    flex: 1,
    marginBottom: 0
  },
  phraseList: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    gap: 8
  },
  phraseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF5EF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7DCC6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8
  },
  phraseCardHistory: {
    backgroundColor: '#FEF3E7',
    borderColor: '#F0C997'
  },
  phraseCardHighContrast: {
    backgroundColor: '#0b1220',
    borderColor: '#facc15'
  },
  phraseCardText: {
    flex: 1,
    color: '#0f172a',
    fontWeight: '600'
  },
  phraseCardTextHighContrast: {
    color: '#facc15'
  },
  phraseCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 10
  },
  phraseCardPlayIcon: {
    color: '#2f855a',
    fontSize: 18,
    fontWeight: '700'
  },
  phraseCardPlayIconHighContrast: {
    color: '#facc15'
  },
  phraseCardDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  phraseCardDeleteIcon: {
    color: '#b91c1c',
    fontWeight: '800'
  },
  phraseEditorList: {
    gap: 8,
    marginTop: 8
  },
  phraseEditorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F6F7F3',
    borderWidth: 1,
    borderColor: '#E2E6D7'
  },
  phraseEditorRowHighContrast: {
    backgroundColor: '#0b1220',
    borderColor: '#facc15'
  },
  phraseEditorLabel: {
    flex: 1,
    color: '#0f172a',
    fontWeight: '600'
  },
  phraseEditorInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#0f172a'
  },
  phraseEditorButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  phraseEditorButtonDanger: {
    backgroundColor: '#FEE2E2'
  },
  phraseEditorButtonPrimary: {
    backgroundColor: '#5B8C7A'
  },
  phraseEditorButtonText: {
    color: '#1f2937',
    fontWeight: '700'
  },
  phraseEditorButtonTextDanger: {
    color: '#b91c1c'
  },
  phraseEditorButtonTextPrimary: {
    color: '#ffffff'
  },
  phraseEditorAddRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 8
  },
  phraseEditorAddInput: {
    flex: 1,
    marginBottom: 0
  },
  personalSymbolAddRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 8
  },
  personalSymbolAddButton: {
    flex: 1
  },
  personalSymbolAddButtonBusy: {
    opacity: 0.6
  },
  personalSymbolList: {
    gap: 8,
    marginTop: 8
  },
  personalSymbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F6F7F3',
    borderWidth: 1,
    borderColor: '#E2E6D7'
  },
  personalSymbolRowHighContrast: {
    backgroundColor: '#0b1220',
    borderColor: '#facc15'
  },
  personalSymbolThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#e5e7eb'
  },
  personalSymbolInfo: {
    flex: 1,
    gap: 2
  },
  personalSymbolLabel: {
    color: '#0f172a',
    fontWeight: '700'
  },
  personalSymbolCategory: {
    color: '#64748b',
    fontSize: 12
  },
  symbolDraftCard: {
    gap: 10
  },
  symbolDraftPreview: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    backgroundColor: '#e5e7eb'
  },
  symbolDraftCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  symbolDraftCategoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e2e8f0'
  },
  symbolDraftCategoryChipActive: {
    backgroundColor: '#5B8C7A'
  },
  symbolDraftCategoryChipText: {
    color: '#1f2937',
    fontWeight: '600'
  },
  symbolDraftCategoryChipTextActive: {
    color: '#ffffff'
  },
  audioBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  audioBadgeText: {
    fontSize: 12
  },
  audioControlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center'
  },
  audioButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  audioButtonRecord: {
    backgroundColor: '#ef4444'
  },
  audioButtonStop: {
    backgroundColor: '#0f172a'
  },
  audioButtonPlay: {
    backgroundColor: '#5B8C7A'
  },
  audioButtonDiscard: {
    backgroundColor: '#E2E8F0'
  },
  audioButtonText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  audioButtonTextDiscard: {
    color: '#0f172a'
  },
  audioTimerBox: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    minWidth: 60,
    alignItems: 'center'
  },
  audioTimerText: {
    color: '#0f172a',
    fontVariant: ['tabular-nums'],
    fontWeight: '700'
  },
  audioTimerTextRecording: {
    color: '#ef4444'
  },
  routineContainer: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 6
  },
  routineHeader: {
    paddingHorizontal: 6,
    paddingBottom: 8,
    gap: 2
  },
  routineHeaderTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700'
  },
  routineHeaderDate: {
    color: '#64748b',
    fontSize: 13
  },
  routineList: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 8
  },
  routineStepCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 8,
    marginBottom: 8
  },
  routineStepCardDone: {
    backgroundColor: '#E6F4EA',
    borderColor: '#5B8C7A'
  },
  routineStepCardHighContrast: {
    backgroundColor: '#0b1220',
    borderColor: '#facc15'
  },
  routineStepImageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0'
  },
  routineStepImage: {
    width: '100%',
    height: '100%'
  },
  routineStepImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CBD5E1'
  },
  routineStepImagePlaceholderNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: '#0f172a'
  },
  routineStepNumberBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  routineStepNumberBadgeDone: {
    backgroundColor: 'rgba(91, 140, 122, 0.95)'
  },
  routineStepNumberBadgeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800'
  },
  routineStepAudioBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  routineStepAudioBadgeText: {
    fontSize: 16
  },
  routineStepDoneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(91, 140, 122, 0.55)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  routineStepDoneCheck: {
    fontSize: 88,
    fontWeight: '800',
    color: '#ffffff'
  },
  routineStepLabel: {
    color: '#0f172a',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4
  },
  routineStepLabelDone: {
    color: '#475569'
  },
  routinePickerSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6
  },
  routinePickerSourceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  routinePickerSourceButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  routinePickerSourceButtonActive: {
    backgroundColor: '#E0EFFF',
    borderColor: '#007AFF'
  },
  routinePickerSourceIcon: {
    fontSize: 22
  },
  routinePickerSourceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a'
  },
  routineSymbolPicker: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 8
  },
  routineSymbolPickerHighContrast: {
    backgroundColor: '#0b1220'
  },
  routineSymbolPickerRow: {
    paddingHorizontal: 8,
    gap: 8
  },
  routineSymbolPickerItem: {
    width: 80,
    alignItems: 'center',
    gap: 4,
    position: 'relative'
  },
  routineSymbolPickerThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#E2E8F0'
  },
  routineSymbolPickerCaption: {
    fontSize: 11,
    color: '#0f172a',
    textAlign: 'center'
  },
  routineSymbolPickerAudioBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    color: '#ffffff',
    paddingHorizontal: 4,
    borderRadius: 8,
    overflow: 'hidden'
  },
  routineDraftCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
    marginBottom: 8
  },
  routineDraftPreview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#e5e7eb'
  },
  routineDraftActionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  routineDraftActionButton: {
    flex: 1
  },
  routineStepEditCard: {
    gap: 6,
    marginBottom: 6
  },
  routineDayChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingTop: 2
  },
  routineDayChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#E5E5EA',
    borderWidth: 1,
    borderColor: '#D1D1D6'
  },
  routineDayChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  routineDayChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3C3C43'
  },
  routineDayChipTextActive: {
    color: '#ffffff'
  },
  sceneTile: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative'
  },
  sceneTileImage: {
    width: '100%',
    height: '100%'
  },
  sceneTileOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.55)'
  },
  sceneTileLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  sceneTileMeta: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11
  },
  sceneListContainer: {
    gap: 8,
    marginTop: 8,
    marginBottom: 8
  },
  sceneListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F2F2F7'
  },
  sceneListThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#E2E8F0'
  },
  sceneListInfo: {
    flex: 1,
    gap: 2
  },
  sceneListName: {
    color: '#0f172a',
    fontWeight: '700'
  },
  sceneListMeta: {
    color: '#64748b',
    fontSize: 12
  },
  sceneViewerContainer: {
    flex: 1,
    backgroundColor: '#000000'
  },
  sceneViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.85)'
  },
  sceneViewerCloseButton: {
    width: 80
  },
  sceneViewerCloseLabel: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600'
  },
  sceneViewerTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center'
  },
  sceneViewerImageWrap: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center'
  },
  sceneViewerImage: {
    width: '100%',
    height: '100%'
  },
  sceneViewerHotspot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.18)',
    borderWidth: 2,
    borderColor: 'rgba(0, 122, 255, 0.55)'
  },
  sceneViewerHotspotDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 122, 255, 0.95)'
  },
  sceneViewerHint: {
    color: '#ffffff',
    textAlign: 'center',
    paddingVertical: 12,
    fontSize: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.85)'
  },
  sceneEditorContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7'
  },
  sceneEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  sceneEditorHeaderAction: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '500'
  },
  sceneEditorHeaderActionPrimary: {
    fontWeight: '700'
  },
  sceneEditorHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700'
  },
  sceneEditorContent: {
    padding: 14,
    gap: 10
  },
  sceneEditorImageWrap: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative'
  },
  sceneEditorImage: {
    width: '100%',
    height: '100%'
  },
  sceneEditorMarker: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 122, 255, 0.95)',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sceneEditorMarkerNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  sceneHotspotRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  sceneHotspotRowNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sceneHotspotRowNumberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  sceneHotspotRowFields: {
    flex: 1,
    gap: 8
  },
  sceneHotspotRowActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  phraseText: {
    ...theme.typography.callout,
    minHeight: 30,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: theme.colors.text
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch'
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32
  },
  iconActionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconGlyph: {
    fontSize: 22,
    lineHeight: 26
  },
  clearLink: {
    flexShrink: 0,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'center'
  },
  clearLinkText: {
    ...theme.typography.footnote,
    color: theme.colors.textMuted,
    textDecorationLine: 'underline'
  },
  generateButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.generate,
    borderRadius: theme.radii.full,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    gap: 8,
    ...theme.shadows.sm
  },
  generateGlyph: {
    fontSize: 18,
    lineHeight: 22,
    color: theme.colors.generateInk
  },
  generateButtonLabel: {
    ...theme.typography.headline,
    color: theme.colors.generateInk,
    letterSpacing: 0.2
  },
  generateButtonPressed: {
    backgroundColor: theme.colors.generateHover
  },
  generateButtonBusy: {
    opacity: 0.6
  },
  saveGroupButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.bgSoft,
    borderWidth: 0,
    borderRadius: theme.radii.full,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    gap: 8
  },
  saveGroupButtonLabel: {
    ...theme.typography.footnote,
    color: theme.colors.text,
    letterSpacing: 0.2
  },
  playButton: {
    flex: 1.9,
    flexDirection: 'row',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.full,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    gap: 10,
    ...theme.shadows.md
  },
  playGlyph: {
    fontSize: 20,
    lineHeight: 24,
    color: theme.colors.accentInk
  },
  playButtonLabel: {
    ...theme.typography.title3,
    color: theme.colors.accentInk,
    letterSpacing: 0.2
  },
  playButtonPressed: {
    backgroundColor: theme.colors.accentHover
  },
  actionPrimary: {
    backgroundColor: '#5B8C7A'
  },
  actionSecondary: {
    backgroundColor: '#7c3aed'
  },
  actionMuted: {
    backgroundColor: '#fee2e2'
  },
  actionNeutral: {
    backgroundColor: '#e2e8f0'
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 11,
    textAlign: 'center',
    includeFontPadding: false
  },
  actionMutedText: {
    color: '#b91c1c'
  },
  actionNeutralText: {
    color: '#334155'
  },
  settingsButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  settingsButtonText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 13
  },
  iosHint: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 12
  },
  configSheet: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 16
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  configSubheader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12
  },
  sheetScrollContent: {
    flexGrow: 1,
    flexShrink: 1
  },
  configHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2B2A28'
  },
  configHeaderSubtitle: {
    fontSize: 13,
    color: '#6B6A67',
    marginTop: 4
  },
  configCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFEAE0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  configCloseIcon: {
    fontSize: 16,
    color: '#2B2A28',
    fontWeight: '700'
  },
  iosToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    minHeight: 44
  },
  iosToggleLabel: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
    color: '#000000'
  },
  modalButtonDanger: {
    backgroundColor: '#F5E0DB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center'
  },
  modalButtonDangerText: {
    color: '#C06B5E',
    fontWeight: '800',
    fontSize: 15
  },
  modalCardHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1
  },
  configModalCard: {
    maxHeight: '90%'
  },
  configModalContent: {
    gap: 12
  },
  settingsCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(60, 60, 67, 0.6)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingTop: 4,
    paddingBottom: 6
  },
  modalHint: {
    color: '#6B6A67',
    fontSize: 13,
    lineHeight: 18
  },
  configTabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4
  },
  configSectionCard: {
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  configSectionCardHighContrast: {
    backgroundColor: '#111827',
    borderColor: '#334155'
  },
  // ============================================================================
  // Shell agrupado de Ajustes (Phase 24 — Salvia & Creme)
  // ============================================================================
  configHomeContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xl
  },
  sGroupBlock: {
    gap: theme.spacing.sm
  },
  sGroupTitle: {
    ...theme.typography.caption1,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: 6
  },
  sCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.sm
  },
  sRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14
  },
  sRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border
  },
  sIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sIconEmoji: {
    fontSize: 20
  },
  sLabel: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text
  },
  sLabelDanger: {
    color: theme.colors.danger
  },
  sChevron: {
    ...theme.typography.headline,
    color: theme.colors.textMuted,
    marginLeft: 4
  },
  sLockBadge: {
    ...theme.typography.caption1,
    color: theme.colors.textMuted,
    marginLeft: 4
  },
  // ============================================================================
  // Wrapper de detalhe (drill-down)
  // ============================================================================
  configDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm
  },
  configBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.sm
  },
  configBackText: {
    ...theme.typography.body,
    color: theme.colors.primary
  },
  configDetailBody: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md
  },
  // ============================================================================
  // Tokens de secao do drill-down (Phase 24-02 — Salvia & Creme)
  // ============================================================================
  drillSectionTitle: {
    ...theme.typography.caption1,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: 6,
    paddingTop: theme.spacing.sm
  },
  drillSectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.sm
  },
  drillFieldLabel: {
    ...theme.typography.subheadline,
    color: theme.colors.text
  },
  drillFieldHint: {
    ...theme.typography.footnote,
    color: theme.colors.textMuted
  },
  drillChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  drillToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs
  },
  drillPrimaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.full,
    alignItems: 'center'
  },
  drillPrimaryButtonText: {
    ...theme.typography.headline,
    color: '#FFFFFF'
  },
  drillSecondaryButton: {
    backgroundColor: theme.colors.bgSoft,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  drillSecondaryButtonText: {
    ...theme.typography.headline,
    color: theme.colors.text
  },
  drillDangerButton: {
    backgroundColor: theme.colors.dangerSoft,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.full,
    alignItems: 'center'
  },
  drillDangerButtonText: {
    ...theme.typography.headline,
    color: theme.colors.danger
  },
  // ============================================================================
  // Tokens de linha-de-item do drill-down (Phase 24-03 — Conteudo da crianca)
  // ============================================================================
  drillItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg
  },
  drillItemRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border
  },
  drillItemLabel: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text
  },
  drillItemSubLabel: {
    ...theme.typography.footnote,
    color: theme.colors.textMuted
  },
  drillIconButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft
  },
  drillIconButtonDanger: {
    backgroundColor: theme.colors.dangerSoft
  },
  drillIconButtonText: {
    ...theme.typography.body,
    color: theme.colors.primaryInk
  },
  drillIconButtonTextDanger: {
    color: theme.colors.danger
  },
  drillInlineInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md
  },
  drillAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md
  },
  drillEmptyHint: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg
  },
  drillListCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.sm
  },
  drillPasswordInput: {
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md
  },
  configTab: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  configTabHighContrast: {
    backgroundColor: '#1e293b',
    borderColor: '#475569'
  },
  configTabActive: {
    borderColor: '#5B8C7A',
    backgroundColor: '#D9E7E0'
  },
  configTabText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 12
  },
  configTabTextHighContrast: {
    color: '#e2e8f0'
  },
  configTabTextActive: {
    color: '#1d4ed8'
  },
  optionChip: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#E8E1D2',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  optionChipHighContrast: {
    backgroundColor: '#1e293b',
    borderColor: '#475569'
  },
  optionChipActive: {
    backgroundColor: '#5B8C7A',
    borderColor: '#5B8C7A'
  },
  optionChipText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 12
  },
  optionChipTextHighContrast: {
    color: '#e2e8f0'
  },
  optionChipTextActive: {
    color: '#ffffff'
  },
  modalInput: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E8E1D2',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    color: '#2B2A28'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8
  },
  modalButtonLight: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  modalButtonLightHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#475569'
  },
  modalButtonPrimary: {
    backgroundColor: '#5B8C7A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center'
  },
  modalButtonPrimaryText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3
  },
  settingLabel: {
    color: '#2B2A28',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 6
  },
  settingActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center'
  },
  toastSuccess: {
    backgroundColor: '#16a34a'
  },
  toastError: {
    backgroundColor: '#dc2626'
  },
  toastText: {
    color: '#ffffff',
    fontWeight: '700'
  }
  });
}

export default function App() {
  return (
    <SafeAreaProvider>
      <FalaApp />
    </SafeAreaProvider>
  );
}
