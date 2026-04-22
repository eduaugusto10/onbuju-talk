import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
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
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets
} from 'expo-audio';
import {
  CustomCategory,
  CustomSymbol,
  HistoryPhrase,
  PersonalSymbol,
  RoutineProgress,
  RoutineStep,
  SavedPhrase,
  SymbolItem
} from './types';
import { CHILD_GRID_COLUMNS, colors, shadows, spacing, typography } from './theme';
import { IOSBottomSheet } from './ui';
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

type ToastState = { message: string; type: 'success' | 'error' } | null;
type UiScale = 'compacto' | 'padrao' | 'confortavel';
type ContrastMode = 'padrao' | 'alto';
type ConfigSection = 'perfil' | 'acessibilidade' | 'voz' | 'seguranca' | 'vocabulario' | 'frases' | 'simbolos' | 'categorias' | 'rotina';
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
  contrastMode: 'contrast_mode',
  visualFeedback: 'visual_feedback',
  introSkipEnabled: 'intro_skip_enabled',
  gridColumns: 'grid_columns',
  coreVocabulary: 'core_vocabulary',
  savedPhrases: 'arasaac_saved_phrases',
  phraseHistory: 'arasaac_phrase_history',
  personalSymbols: 'arasaac_personal_symbols',
  customCategories: 'arasaac_custom_categories',
  routineSteps: 'arasaac_routine_steps',
  routineProgress: 'arasaac_routine_progress'
};

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
    const createdAt = typeof candidate.createdAt === 'string' && candidate.createdAt ? candidate.createdAt : new Date().toISOString();
    result.push({ id, label, imageUri, createdAt });
    if (result.length >= ROUTINE_STEPS_MAX) break;
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
  routine: 'Rotina'
};

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

export default function App() {
  const hasPrimedExtendedCache = useRef(false);
  const searchInputRef = useRef<TextInput>(null);
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
  const [contrastMode, setContrastMode] = useState<ContrastMode>('padrao');
  const [visualFeedbackEnabled, setVisualFeedbackEnabled] = useState(true);
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
  const [newRoutineLabel, setNewRoutineLabel] = useState('');
  const audioPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 200);
  const [isBootHydrating, setIsBootHydrating] = useState(true);
  const [showIntroScreen, setShowIntroScreen] = useState(false);
  const [skipIntroNextOpen, setSkipIntroNextOpen] = useState(false);
  const [isStartingApp, setIsStartingApp] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configSection, setConfigSection] = useState<ConfigSection>('perfil');
  const [adminPassword, setAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [aiApiKeyInput, setAiApiKeyInput] = useState(DEFAULT_AI_API_KEY);
  const [adminPasswordHash, setAdminPasswordHash] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const needsAdminSetup = !adminPasswordHash;
  const uiScaleFactor = uiScale === 'compacto' ? 0.92 : uiScale === 'confortavel' ? 1.08 : 1;
  const isHighContrast = contrastMode === 'alto';
  const effectiveGridColumns: GridColumns = isAdmin ? gridColumns : (CHILD_GRID_COLUMNS as GridColumns);
  const androidTopInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

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
    setConfigSection('perfil');
  }, []);

  const openConfigModal = useCallback(() => {
    resetConfigFields();
    setConfigSection('seguranca');
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
          savedContrastMode,
          savedVisualFeedback,
          savedIntroSkipEnabled,
          savedGridColumns,
          savedCoreVocabulary,
          savedPhrasesRaw,
          savedPhraseHistory,
          savedPersonalSymbols,
          savedCustomCategories,
          savedRoutineSteps,
          savedRoutineProgress
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.favorites),
          AsyncStorage.getItem(STORAGE_KEYS.customSymbols),
          AsyncStorage.getItem(STORAGE_KEYS.rate),
          AsyncStorage.getItem(STORAGE_KEYS.pitch),
          AsyncStorage.getItem(STORAGE_KEYS.adminPasswordHash),
          AsyncStorage.getItem(STORAGE_KEYS.uiScale),
          AsyncStorage.getItem(STORAGE_KEYS.contrastMode),
          AsyncStorage.getItem(STORAGE_KEYS.visualFeedback),
          AsyncStorage.getItem(STORAGE_KEYS.introSkipEnabled),
          AsyncStorage.getItem(STORAGE_KEYS.gridColumns),
          AsyncStorage.getItem(STORAGE_KEYS.coreVocabulary),
          AsyncStorage.getItem(STORAGE_KEYS.savedPhrases),
          AsyncStorage.getItem(STORAGE_KEYS.phraseHistory),
          AsyncStorage.getItem(STORAGE_KEYS.personalSymbols),
          AsyncStorage.getItem(STORAGE_KEYS.customCategories),
          AsyncStorage.getItem(STORAGE_KEYS.routineSteps),
          AsyncStorage.getItem(STORAGE_KEYS.routineProgress)
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
        if (savedContrastMode === 'padrao' || savedContrastMode === 'alto') {
          setContrastMode(savedContrastMode);
        }
        if (savedVisualFeedback) {
          setVisualFeedbackEnabled(savedVisualFeedback === '1');
        }
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

        const introShouldBeSkipped = savedIntroSkipEnabled === '1';
        setSkipIntroNextOpen(introShouldBeSkipped);
        setShowIntroScreen(!introShouldBeSkipped);
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
    void AsyncStorage.setItem(STORAGE_KEYS.contrastMode, contrastMode);
  }, [contrastMode]);

  useEffect(() => {
    void AsyncStorage.setItem(STORAGE_KEYS.visualFeedback, visualFeedbackEnabled ? '1' : '0');
  }, [visualFeedbackEnabled]);

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
        setIsSymbolDraftOpen(true);
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

  const addRoutineStep = useCallback(() => {
    const label = newRoutineLabel.trim();
    if (!label) {
      showToast('Digite o passo da rotina.', 'error');
      return;
    }
    if (routineSteps.length >= ROUTINE_STEPS_MAX) {
      showToast(`Maximo de ${ROUTINE_STEPS_MAX} passos na rotina.`, 'error');
      return;
    }
    if (routineSteps.some(item => item.label.toLowerCase() === label.toLowerCase())) {
      showToast('Esse passo ja esta na rotina.', 'error');
      return;
    }
    const personal = personalSymbols.find(ps => ps.label.toLowerCase() === label.toLowerCase());
    const favorite = favorites.find(fav => fav.label.toLowerCase() === label.toLowerCase());
    const known = symbols.find(sym => sym.label.toLowerCase() === label.toLowerCase());
    const imageUri = personal?.imageUri ?? favorite?.imageUrl ?? known?.imageUrl ?? null;
    const entry: RoutineStep = {
      id: `step-${Date.now()}`,
      label,
      imageUri,
      createdAt: new Date().toISOString()
    };
    setRoutineSteps(prev => [...prev, entry]);
    setNewRoutineLabel('');
  }, [favorites, newRoutineLabel, personalSymbols, routineSteps, showToast, symbols]);

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
    setRoutineProgress(prev => {
      const today = getTodayIso();
      const base = prev.date === today ? prev : { date: today, completedStepIds: [] };
      const already = base.completedStepIds.includes(id);
      const nextIds = already
        ? base.completedStepIds.filter(sid => sid !== id)
        : [...base.completedStepIds, id];
      return { date: today, completedStepIds: nextIds };
    });
  }, []);

  const resetTodayRoutineProgress = useCallback(() => {
    setRoutineProgress({ date: getTodayIso(), completedStepIds: [] });
    showToast('Progresso do dia zerado.', 'success');
  }, [showToast]);

  const clearSymbols = useCallback(() => {
    setSelectedSymbols([]);
    setNormalizedPhrase('');
  }, []);

  const handlePlay = useCallback(() => {
    if (isPlaying) return;
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
    if (Platform.OS === 'ios') {
      showToast('No iPhone, desative o modo silencioso para ouvir.', 'error');
    }
  }, [isPlaying, normalizedPhrase, pitch, rate, recordPhraseHistory, selectedSymbols, showToast]);

  const handleGenerate = useCallback(async () => {
    if (selectedSymbols.length === 0) return;
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

  const handleStartFromIntro = useCallback(async () => {
    if (isStartingApp) return;
    setIsStartingApp(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.introSkipEnabled, skipIntroNextOpen ? '1' : '0');
      setShowIntroScreen(false);
    } finally {
      setIsStartingApp(false);
    }
  }, [isStartingApp, skipIntroNextOpen]);

  if (isBootHydrating) {
    return (
      <SafeAreaView style={[styles.safeArea, isHighContrast && styles.safeAreaHighContrast]}>
        <View style={styles.bootLoadingState}>
          <ActivityIndicator size="large" color="#5B8C7A" />
        </View>
      </SafeAreaView>
    );
  }

  if (showIntroScreen) {
    return (
      <SafeAreaView style={[styles.safeArea, isHighContrast && styles.safeAreaHighContrast]}>
        <View style={[styles.introContainer, { paddingHorizontal: 14 * uiScaleFactor }]}>
          <View style={[styles.introCard, isHighContrast && styles.cardHighContrast]}>
            <Text style={[styles.introTitle, isHighContrast && styles.textHighContrast]}>ONBUJU TALK</Text>
            <Text style={[styles.introSubtitle, isHighContrast && styles.textMutedHighContrast]}>
              Comunicação assistiva para montar frases com rapidez.
            </Text>

            <Pressable
              style={[styles.introToggleRow, isHighContrast && styles.introToggleRowHighContrast]}
              onPress={() => setSkipIntroNextOpen(prev => !prev)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: skipIntroNextOpen }}
            >
              <View style={[styles.introCheckbox, isHighContrast && styles.introCheckboxHighContrast, skipIntroNextOpen && styles.introCheckboxActive]}>
                {skipIntroNextOpen ? <Text style={styles.introCheckboxIcon}>✓</Text> : null}
              </View>
              <Text style={[styles.introToggleText, isHighContrast && styles.textHighContrast]}>Nao mostrar novamente</Text>
            </Pressable>

            <Pressable
              style={[styles.introStartButton, isStartingApp && styles.introStartButtonDisabled]}
              onPress={() => void handleStartFromIntro()}
              disabled={isStartingApp}
              accessibilityRole="button"
            >
              <Text style={styles.introStartButtonText}>{isStartingApp ? 'Abrindo...' : 'Comecar'}</Text>
            </Pressable>
          </View>
        </View>

        {toast && (
          <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isHighContrast && styles.safeAreaHighContrast]}>
      <View style={[styles.container, { paddingHorizontal: 12 * uiScaleFactor, paddingTop: androidTopInset + 10 }]}>
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
            <View style={styles.headerTextBlock}>
              <Text style={[styles.title, { fontSize: 17 * uiScaleFactor }, isHighContrast && styles.textHighContrast]}>ONBUJU TALK</Text>
              <Text style={[styles.headerTagline, isHighContrast && styles.textMutedHighContrast]}>Comunicação assistiva</Text>
            </View>
            <View style={styles.headerActions}>
              {isAdmin && (
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
              )}
              {isAdmin && (
                <View style={[styles.adminBadge, styles.adminBadgeOn]}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>
          </View>
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
            <CategoryButton
              label={CATEGORIES.savedPhrases}
              active={activeCategory === CATEGORIES.savedPhrases}
              highContrast={isHighContrast}
              onPress={() => void handleCategoryClick(CATEGORIES.savedPhrases)}
            />
            <CategoryButton
              label={CATEGORIES.history}
              active={activeCategory === CATEGORIES.history}
              highContrast={isHighContrast}
              onPress={() => void handleCategoryClick(CATEGORIES.history)}
            />
            <CategoryButton
              label={CATEGORIES.routine}
              active={activeCategory === CATEGORIES.routine}
              highContrast={isHighContrast}
              onPress={() => void handleCategoryClick(CATEGORIES.routine)}
            />
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
              <ActivityIndicator size="large" color="#5B8C7A" />
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
                data={routineSteps}
                keyExtractor={item => item.id}
                key="routine-steps"
                contentContainerStyle={styles.routineList}
                renderItem={({ item }) => (
                  <RoutineStepCard
                    step={item}
                    completed={routineProgress.completedStepIds.includes(item.id)}
                    onToggle={() => toggleRoutineStep(item.id)}
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
          ) : customCategories.some(c => c.id === activeCategory) ? (
            <FlatList
              data={personalSymbols.filter(ps => ps.categoryId === activeCategory)}
              keyExtractor={item => item.id}
              key={`personal-${activeCategory}-${effectiveGridColumns}`}
              numColumns={effectiveGridColumns}
              accessibilityLabel={`Grade de simbolos pessoais ${effectiveGridColumns} colunas`}
              contentContainerStyle={styles.grid}
              renderItem={({ item }) => {
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
              data={symbolsToRender}
              keyExtractor={item => item.id}
              key={`symbols-${effectiveGridColumns}`}
              numColumns={effectiveGridColumns}
              accessibilityLabel={`Grade de simbolos ${effectiveGridColumns} colunas`}
              contentContainerStyle={styles.grid}
              renderItem={({ item }) => (
                <SymbolCard
                  item={item}
                  columns={effectiveGridColumns}
                  favorite={isFavorite(item)}
                  onPress={() => addSymbol(item)}
                  onFavoritePress={() => toggleFavorite(item)}
                  isAdmin={isAdmin}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, isHighContrast && styles.textMutedHighContrast]}>Nenhum símbolo encontrado.</Text>
                </View>
              }
            />
          )}
        </View>

        {coreVocabulary.length > 0 && (
          <View
            style={[styles.coreVocabBar, isHighContrast && styles.coreVocabBarHighContrast]}
            accessibilityLabel="Vocabulario essencial"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.coreVocabRow}
            >
              {coreVocabulary.map(word => (
                <Pressable
                  key={`core-word-${word}`}
                  onPress={() => addCoreWord(word)}
                  style={[styles.coreVocabButton, isHighContrast && styles.coreVocabButtonHighContrast]}
                  accessibilityRole="button"
                  accessibilityLabel={`Adicionar palavra ${word}`}
                >
                  <Text
                    style={[
                      styles.coreVocabButtonText,
                      { fontSize: 14 * uiScaleFactor },
                      isHighContrast && styles.coreVocabButtonTextHighContrast
                    ]}
                  >
                    {word.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.composerCard, isHighContrast && styles.cardHighContrast]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedList}>
            {selectedSymbols.length === 0 && visualFeedbackEnabled ? (
              <Text style={styles.emptyChipHint}>Selecione símbolos para montar a frase.</Text>
            ) : (
              selectedSymbols.map((symbol, index) => (
                <Pressable
                  key={`${symbol.id}-${index}`}
                  onLongPress={() => {
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
              ))
            )}
          </ScrollView>

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
            <Pressable onPress={clearSymbols} style={styles.clearButton} accessibilityRole="button" accessibilityLabel="Deletar seleção">
              <Text style={styles.iconGlyph}>🗑</Text>
              <Text style={styles.clearButtonLabel}>Deletar</Text>
            </Pressable>
            <Pressable
              onPress={() => void handleGenerate()}
              style={[styles.generateButton, isGenerating && styles.generateButtonBusy]}
              accessibilityRole="button"
              accessibilityLabel="Gerar frase com IA"
              disabled={isGenerating}
            >
              <Text style={styles.iconGlyph}>{isGenerating ? '…' : '✨'}</Text>
              <Text style={styles.generateButtonLabel}>Gerar</Text>
            </Pressable>
            {isAdmin && (
              <Pressable onPress={saveCustomSymbol} style={styles.saveGroupButton} accessibilityRole="button" accessibilityLabel="Salvar grupo">
                <Text style={styles.iconGlyph}>💾</Text>
                <Text style={styles.saveGroupButtonLabel}>Salvar</Text>
              </Pressable>
            )}
            <Pressable onPress={handlePlay} style={styles.playButton} accessibilityRole="button" accessibilityLabel="Ouvir a frase">
              <Text style={styles.iconGlyph}>{isPlaying ? '🔊' : '▶'}</Text>
              <Text style={styles.playButtonLabel}>Ouvir</Text>
            </Pressable>
          </View>
        </View>
      </View>

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
        visible={isSymbolDraftOpen}
        onRequestClose={cancelPendingSymbol}
        title="Novo simbolo"
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
            placeholderTextColor={colors.tertiaryLabel}
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
        title="Ajustes"
        leftAction={{
          label: 'Fechar',
          onPress: () => {
            setIsConfigModalOpen(false);
            resetConfigFields();
          }
        }}
      >
        <View style={[styles.configSheet, isHighContrast && styles.modalCardHighContrast]}>
            <View style={styles.configSubheader}>
              <Text style={[styles.configHeaderSubtitle, isHighContrast && styles.textMutedHighContrast]}>
                {isAdmin ? 'Você está no modo cuidador.' : 'Área protegida por senha.'}
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.configModalContent}
            >
            <View style={styles.configNav}>
              <ConfigNavItem
                label="Cuidador"
                icon="🔐"
                active={configSection === 'seguranca'}
                onPress={() => setConfigSection('seguranca')}
              />
              <ConfigNavItem
                label="Voz"
                icon="🔊"
                active={configSection === 'voz'}
                onPress={() => setConfigSection('voz')}
              />
              <ConfigNavItem
                label="Acessibilidade"
                icon="👁"
                active={configSection === 'acessibilidade'}
                onPress={() => setConfigSection('acessibilidade')}
              />
              <ConfigNavItem
                label="Perfil"
                icon="⚙"
                active={configSection === 'perfil'}
                onPress={() => setConfigSection('perfil')}
              />
              <ConfigNavItem
                label="Vocabulario"
                icon="🗣"
                active={configSection === 'vocabulario'}
                onPress={() => setConfigSection('vocabulario')}
              />
              <ConfigNavItem
                label="Frases"
                icon="💬"
                active={configSection === 'frases'}
                onPress={() => setConfigSection('frases')}
              />
              <ConfigNavItem
                label="Simbolos"
                icon="📷"
                active={configSection === 'simbolos'}
                onPress={() => setConfigSection('simbolos')}
              />
              <ConfigNavItem
                label="Categorias"
                icon="🗂"
                active={configSection === 'categorias'}
                onPress={() => setConfigSection('categorias')}
              />
              <ConfigNavItem
                label="Rotina"
                icon="📅"
                active={configSection === 'rotina'}
                onPress={() => setConfigSection('rotina')}
              />
            </View>

            {configSection === 'vocabulario' && (
              <View style={[styles.configSectionCard, isHighContrast && styles.configSectionCardHighContrast]}>
                <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Vocabulario core</Text>
                <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                  Palavras essenciais que aparecem sempre na mesma posicao para reforcar o motor planning.
                </Text>
                {!isAdmin ? (
                  <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                    Entre como cuidador em "Cuidador" para editar o vocabulario core.
                  </Text>
                ) : (
                  <>
                    <View style={styles.coreVocabEditorList}>
                      {coreVocabulary.map((word, index) => (
                        <View
                          key={`core-edit-${word}`}
                          style={[styles.coreVocabEditorRow, isHighContrast && styles.coreVocabEditorRowHighContrast]}
                        >
                          <Text
                            style={[styles.coreVocabEditorLabel, isHighContrast && styles.textHighContrast]}
                            numberOfLines={1}
                          >
                            {word.toUpperCase()}
                          </Text>
                          <Pressable
                            onPress={() => moveCoreVocabularyWord(word, -1)}
                            disabled={index === 0}
                            style={[styles.coreVocabEditorButton, index === 0 && styles.coreVocabEditorButtonDisabled]}
                            accessibilityRole="button"
                            accessibilityLabel={`Mover ${word} para cima`}
                          >
                            <Text style={styles.coreVocabEditorButtonText}>↑</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => moveCoreVocabularyWord(word, 1)}
                            disabled={index === coreVocabulary.length - 1}
                            style={[
                              styles.coreVocabEditorButton,
                              index === coreVocabulary.length - 1 && styles.coreVocabEditorButtonDisabled
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel={`Mover ${word} para baixo`}
                          >
                            <Text style={styles.coreVocabEditorButtonText}>↓</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => removeCoreVocabularyWord(word)}
                            style={[styles.coreVocabEditorButton, styles.coreVocabEditorButtonDanger]}
                            accessibilityRole="button"
                            accessibilityLabel={`Remover ${word}`}
                          >
                            <Text style={[styles.coreVocabEditorButtonText, styles.coreVocabEditorButtonTextDanger]}>✕</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>

                    <View style={styles.coreVocabEditorAddRow}>
                      <TextInput
                        value={newCoreWord}
                        onChangeText={setNewCoreWord}
                        placeholder="Nova palavra (ex: agua)"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={[styles.modalInput, styles.coreVocabEditorInput, isHighContrast && styles.inputHighContrast]}
                        onSubmitEditing={addCoreVocabularyWord}
                      />
                      <Pressable
                        onPress={addCoreVocabularyWord}
                        style={styles.modalButtonPrimary}
                        accessibilityRole="button"
                        accessibilityLabel="Adicionar palavra ao core"
                      >
                        <Text style={styles.modalButtonPrimaryText}>Adicionar</Text>
                      </Pressable>
                    </View>

                    <Pressable
                      onPress={resetCoreVocabulary}
                      style={styles.modalButtonLight}
                      accessibilityRole="button"
                      accessibilityLabel="Restaurar vocabulario core padrao"
                    >
                      <Text>Restaurar padrao</Text>
                    </Pressable>

                    <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                      Maximo de {CORE_VOCABULARY_MAX} palavras. Palavras duplicadas sao ignoradas.
                    </Text>
                  </>
                )}
              </View>
            )}

            {configSection === 'frases' && (
              <View style={[styles.configSectionCard, isHighContrast && styles.configSectionCardHighContrast]}>
                <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Frases prontas</Text>
                <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                  Frases que o cuidador pre-monta para uso em um toque pela crianca.
                </Text>
                {!isAdmin ? (
                  <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                    Entre como cuidador em "Cuidador" para editar as frases prontas.
                  </Text>
                ) : (
                  <>
                    <View style={styles.phraseEditorList}>
                      {savedPhrases.length === 0 && (
                        <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                          Nenhuma frase salva ainda. Adicione abaixo.
                        </Text>
                      )}
                      {savedPhrases.map(phrase => {
                        const isEditing = editingPhraseId === phrase.id;
                        return (
                          <View
                            key={`phrase-edit-${phrase.id}`}
                            style={[styles.phraseEditorRow, isHighContrast && styles.phraseEditorRowHighContrast]}
                          >
                            {isEditing ? (
                              <TextInput
                                value={editingPhraseText}
                                onChangeText={setEditingPhraseText}
                                style={[styles.phraseEditorInput, isHighContrast && styles.inputHighContrast]}
                                placeholder="Editar frase"
                                placeholderTextColor="#94a3b8"
                                autoFocus
                                onSubmitEditing={commitEditingPhrase}
                              />
                            ) : (
                              <Text
                                style={[styles.phraseEditorLabel, isHighContrast && styles.textHighContrast]}
                                numberOfLines={2}
                              >
                                {phrase.text}
                              </Text>
                            )}
                            {isEditing ? (
                              <>
                                <Pressable
                                  onPress={commitEditingPhrase}
                                  style={[styles.phraseEditorButton, styles.phraseEditorButtonPrimary]}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Salvar edicao da frase ${phrase.text}`}
                                >
                                  <Text style={[styles.phraseEditorButtonText, styles.phraseEditorButtonTextPrimary]}>OK</Text>
                                </Pressable>
                                <Pressable
                                  onPress={cancelEditingPhrase}
                                  style={styles.phraseEditorButton}
                                  accessibilityRole="button"
                                  accessibilityLabel="Cancelar edicao da frase"
                                >
                                  <Text style={styles.phraseEditorButtonText}>✕</Text>
                                </Pressable>
                              </>
                            ) : (
                              <>
                                <Pressable
                                  onPress={() => startEditingPhrase(phrase)}
                                  style={styles.phraseEditorButton}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Editar frase ${phrase.text}`}
                                >
                                  <Text style={styles.phraseEditorButtonText}>✎</Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => removeSavedPhrase(phrase.id)}
                                  style={[styles.phraseEditorButton, styles.phraseEditorButtonDanger]}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Remover frase ${phrase.text}`}
                                >
                                  <Text style={[styles.phraseEditorButtonText, styles.phraseEditorButtonTextDanger]}>✕</Text>
                                </Pressable>
                              </>
                            )}
                          </View>
                        );
                      })}
                    </View>

                    <View style={styles.phraseEditorAddRow}>
                      <TextInput
                        value={newPhraseInput}
                        onChangeText={setNewPhraseInput}
                        placeholder="Nova frase (ex: quero agua)"
                        placeholderTextColor="#94a3b8"
                        style={[styles.modalInput, styles.phraseEditorAddInput, isHighContrast && styles.inputHighContrast]}
                        onSubmitEditing={addSavedPhrase}
                      />
                      <Pressable
                        onPress={addSavedPhrase}
                        style={styles.modalButtonPrimary}
                        accessibilityRole="button"
                        accessibilityLabel="Adicionar nova frase pronta"
                      >
                        <Text style={styles.modalButtonPrimaryText}>Adicionar</Text>
                      </Pressable>
                    </View>

                    <Pressable
                      onPress={clearPhraseHistory}
                      style={styles.modalButtonLight}
                      accessibilityRole="button"
                      accessibilityLabel="Limpar historico de frases"
                    >
                      <Text>Limpar historico ({phraseHistory.length})</Text>
                    </Pressable>

                    <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                      Maximo de {SAVED_PHRASES_MAX} frases. Historico guarda as ultimas {PHRASE_HISTORY_MAX} frases faladas.
                    </Text>
                  </>
                )}
              </View>
            )}

            {configSection === 'simbolos' && (
              <View style={[styles.configSectionCard, isHighContrast && styles.configSectionCardHighContrast]}>
                <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Simbolos pessoais</Text>
                <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                  Adicione fotos familiares como simbolos. Escolha da camera ou da galeria.
                </Text>
                {!isAdmin ? (
                  <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                    Entre como cuidador em "Cuidador" para adicionar simbolos pessoais.
                  </Text>
                ) : (
                  <>
                    <View style={styles.personalSymbolAddRow}>
                      <Pressable
                        onPress={() => void pickFromCamera()}
                        disabled={pickerBusy}
                        style={[styles.modalButtonPrimary, styles.personalSymbolAddButton, pickerBusy && styles.personalSymbolAddButtonBusy]}
                        accessibilityRole="button"
                        accessibilityLabel="Tirar foto para novo simbolo"
                      >
                        <Text style={styles.modalButtonPrimaryText}>📷 Tirar foto</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => void pickFromGallery()}
                        disabled={pickerBusy}
                        style={[styles.modalButtonPrimary, styles.personalSymbolAddButton, pickerBusy && styles.personalSymbolAddButtonBusy]}
                        accessibilityRole="button"
                        accessibilityLabel="Escolher imagem da galeria"
                      >
                        <Text style={styles.modalButtonPrimaryText}>🖼 Galeria</Text>
                      </Pressable>
                    </View>

                    <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                      Maximo de {PERSONAL_SYMBOLS_MAX} simbolos pessoais.
                    </Text>

                    <View style={styles.personalSymbolList}>
                      {personalSymbols.length === 0 && (
                        <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                          Nenhum simbolo pessoal ainda.
                        </Text>
                      )}
                      {personalSymbols.map(symbol => {
                        const category = customCategories.find(c => c.id === symbol.categoryId);
                        const hasAudio = !!symbol.audioUri;
                        return (
                          <View
                            key={`personal-row-${symbol.id}`}
                            style={[styles.personalSymbolRow, isHighContrast && styles.personalSymbolRowHighContrast]}
                          >
                            <Image source={{ uri: symbol.imageUri }} style={styles.personalSymbolThumb} resizeMode="cover" />
                            <View style={styles.personalSymbolInfo}>
                              <Text
                                style={[styles.personalSymbolLabel, isHighContrast && styles.textHighContrast]}
                                numberOfLines={1}
                              >
                                {symbol.label}
                                {hasAudio ? ' 🔊' : ''}
                              </Text>
                              <Text style={[styles.personalSymbolCategory, isHighContrast && styles.textMutedHighContrast]} numberOfLines={1}>
                                {category ? category.name : 'Sem categoria'}
                              </Text>
                            </View>
                            <Pressable
                              onPress={() => void openAudioRecorderFor(symbol.id)}
                              style={styles.phraseEditorButton}
                              accessibilityRole="button"
                              accessibilityLabel={hasAudio ? `Regravar voz do simbolo ${symbol.label}` : `Gravar voz para ${symbol.label}`}
                            >
                              <Text style={styles.phraseEditorButtonText}>🎙</Text>
                            </Pressable>
                            {hasAudio && (
                              <Pressable
                                onPress={() => void clearSymbolAudio(symbol.id)}
                                style={styles.phraseEditorButton}
                                accessibilityRole="button"
                                accessibilityLabel={`Remover voz do simbolo ${symbol.label}`}
                              >
                                <Text style={styles.phraseEditorButtonText}>🔇</Text>
                              </Pressable>
                            )}
                            <Pressable
                              onPress={() => void removePersonalSymbol(symbol.id)}
                              style={[styles.phraseEditorButton, styles.phraseEditorButtonDanger]}
                              accessibilityRole="button"
                              accessibilityLabel={`Remover simbolo ${symbol.label}`}
                            >
                              <Text style={[styles.phraseEditorButtonText, styles.phraseEditorButtonTextDanger]}>✕</Text>
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  </>
                )}
              </View>
            )}

            {configSection === 'categorias' && (
              <View style={[styles.configSectionCard, isHighContrast && styles.configSectionCardHighContrast]}>
                <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Categorias customizadas</Text>
                <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                  Organize seus simbolos pessoais em categorias proprias.
                </Text>
                {!isAdmin ? (
                  <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                    Entre como cuidador em "Cuidador" para gerenciar categorias.
                  </Text>
                ) : (
                  <>
                    <View style={styles.phraseEditorList}>
                      {customCategories.length === 0 && (
                        <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                          Nenhuma categoria customizada ainda.
                        </Text>
                      )}
                      {customCategories.map(cat => {
                        const count = personalSymbols.filter(ps => ps.categoryId === cat.id).length;
                        const isEditing = editingCategoryId === cat.id;
                        return (
                          <View
                            key={`cat-edit-${cat.id}`}
                            style={[styles.phraseEditorRow, isHighContrast && styles.phraseEditorRowHighContrast]}
                          >
                            {isEditing ? (
                              <TextInput
                                value={editingCategoryName}
                                onChangeText={setEditingCategoryName}
                                style={[styles.phraseEditorInput, isHighContrast && styles.inputHighContrast]}
                                autoFocus
                                onSubmitEditing={commitEditCategory}
                                placeholder="Nome da categoria"
                                placeholderTextColor="#94a3b8"
                              />
                            ) : (
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.phraseEditorLabel, isHighContrast && styles.textHighContrast]} numberOfLines={1}>
                                  {cat.name}
                                </Text>
                                <Text style={[styles.personalSymbolCategory, isHighContrast && styles.textMutedHighContrast]}>
                                  {count} simbolo{count === 1 ? '' : 's'}
                                </Text>
                              </View>
                            )}
                            {isEditing ? (
                              <>
                                <Pressable
                                  onPress={commitEditCategory}
                                  style={[styles.phraseEditorButton, styles.phraseEditorButtonPrimary]}
                                  accessibilityRole="button"
                                  accessibilityLabel="Salvar categoria"
                                >
                                  <Text style={[styles.phraseEditorButtonText, styles.phraseEditorButtonTextPrimary]}>OK</Text>
                                </Pressable>
                                <Pressable
                                  onPress={cancelEditCategory}
                                  style={styles.phraseEditorButton}
                                  accessibilityRole="button"
                                  accessibilityLabel="Cancelar edicao"
                                >
                                  <Text style={styles.phraseEditorButtonText}>✕</Text>
                                </Pressable>
                              </>
                            ) : (
                              <>
                                <Pressable
                                  onPress={() => startEditCategory(cat)}
                                  style={styles.phraseEditorButton}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Renomear ${cat.name}`}
                                >
                                  <Text style={styles.phraseEditorButtonText}>✎</Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => removeCustomCategory(cat.id)}
                                  style={[styles.phraseEditorButton, styles.phraseEditorButtonDanger]}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Remover ${cat.name}`}
                                >
                                  <Text style={[styles.phraseEditorButtonText, styles.phraseEditorButtonTextDanger]}>✕</Text>
                                </Pressable>
                              </>
                            )}
                          </View>
                        );
                      })}
                    </View>

                    <View style={styles.phraseEditorAddRow}>
                      <TextInput
                        value={newCustomCategoryName}
                        onChangeText={setNewCustomCategoryName}
                        placeholder="Nova categoria (ex: Casa)"
                        placeholderTextColor="#94a3b8"
                        style={[styles.modalInput, styles.phraseEditorAddInput, isHighContrast && styles.inputHighContrast]}
                        onSubmitEditing={addCustomCategory}
                      />
                      <Pressable
                        onPress={addCustomCategory}
                        style={styles.modalButtonPrimary}
                        accessibilityRole="button"
                        accessibilityLabel="Adicionar categoria"
                      >
                        <Text style={styles.modalButtonPrimaryText}>Adicionar</Text>
                      </Pressable>
                    </View>

                    <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                      Remover uma categoria nao apaga os simbolos — eles ficam como "Sem categoria".
                    </Text>
                  </>
                )}
              </View>
            )}

            {configSection === 'rotina' && (
              <View style={[styles.configSectionCard, isHighContrast && styles.configSectionCardHighContrast]}>
                <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Rotina do dia</Text>
                <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                  Monte a sequencia de passos do dia. Use rotulos curtos; se bater com um simbolo existente, a imagem aparece automaticamente.
                </Text>
                {!isAdmin ? (
                  <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                    Entre como cuidador em "Cuidador" para editar a rotina.
                  </Text>
                ) : (
                  <>
                    <View style={styles.phraseEditorList}>
                      {routineSteps.length === 0 && (
                        <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                          Nenhum passo na rotina ainda.
                        </Text>
                      )}
                      {routineSteps.map((step, index) => (
                        <View
                          key={`routine-edit-${step.id}`}
                          style={[styles.phraseEditorRow, isHighContrast && styles.phraseEditorRowHighContrast]}
                        >
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
                      ))}
                    </View>

                    <View style={styles.phraseEditorAddRow}>
                      <TextInput
                        value={newRoutineLabel}
                        onChangeText={setNewRoutineLabel}
                        placeholder="Novo passo (ex: escovar dentes)"
                        placeholderTextColor="#94a3b8"
                        style={[styles.modalInput, styles.phraseEditorAddInput, isHighContrast && styles.inputHighContrast]}
                        onSubmitEditing={addRoutineStep}
                      />
                      <Pressable
                        onPress={addRoutineStep}
                        style={styles.modalButtonPrimary}
                        accessibilityRole="button"
                        accessibilityLabel="Adicionar passo a rotina"
                      >
                        <Text style={styles.modalButtonPrimaryText}>Adicionar</Text>
                      </Pressable>
                    </View>

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
                  </>
                )}
              </View>
            )}

            {configSection === 'perfil' && (
              <View style={[styles.configSectionCard, isHighContrast && styles.configSectionCardHighContrast]}>
                <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Perfil de uso</Text>
                <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>Ajuste densidade visual conforme preferencia do usuário.</Text>
                <Text style={[styles.settingLabel, isHighContrast && styles.textHighContrast]}>Escala da interface</Text>
                <View style={styles.settingActions}>
                  <OptionChip label="Compacto" active={uiScale === 'compacto'} highContrast={isHighContrast} onPress={() => setUiScale('compacto')} />
                  <OptionChip label="Padrão" active={uiScale === 'padrao'} highContrast={isHighContrast} onPress={() => setUiScale('padrao')} />
                  <OptionChip label="Confortável" active={uiScale === 'confortavel'} highContrast={isHighContrast} onPress={() => setUiScale('confortavel')} />
                </View>
                <Text style={[styles.settingLabel, isHighContrast && styles.textHighContrast]}>Imagens por linha</Text>
                <View style={styles.settingActions}>
                  {GRID_COLUMNS_OPTIONS.map(option => (
                    <OptionChip
                      key={`grid-col-${option}`}
                      label={`${option} col`}
                      active={gridColumns === option}
                      highContrast={isHighContrast}
                      onPress={() => setGridColumns(option)}
                    />
                  ))}
                </View>
                <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>As mudanças são aplicadas e salvas automaticamente.</Text>
              </View>
            )}

            {configSection === 'acessibilidade' && (
              <View style={[styles.configSectionCard, isHighContrast && styles.configSectionCardHighContrast]}>
                <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Acessibilidade</Text>
                <Text style={[styles.settingLabel, isHighContrast && styles.textHighContrast]}>Contraste</Text>
                <View style={styles.settingActions}>
                  <OptionChip label="Padrão" active={contrastMode === 'padrao'} highContrast={isHighContrast} onPress={() => setContrastMode('padrao')} />
                  <OptionChip label="Alto" active={contrastMode === 'alto'} highContrast={isHighContrast} onPress={() => setContrastMode('alto')} />
                </View>
                <Text style={[styles.settingLabel, isHighContrast && styles.textHighContrast]}>Feedback visual</Text>
                <View style={styles.settingActions}>
                  <OptionChip label="Ativado" active={visualFeedbackEnabled} highContrast={isHighContrast} onPress={() => setVisualFeedbackEnabled(true)} />
                  <OptionChip label="Reduzido" active={!visualFeedbackEnabled} highContrast={isHighContrast} onPress={() => setVisualFeedbackEnabled(false)} />
                </View>
                <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>No modo reduzido, textos auxiliares e dicas visuais são minimizados.</Text>
              </View>
            )}

            {configSection === 'voz' && (
              <View style={[styles.configSectionCard, isHighContrast && styles.configSectionCardHighContrast]}>
                <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Voz</Text>
                <Text style={[styles.settingLabel, isHighContrast && styles.textHighContrast]}>Velocidade: {rate.toFixed(1)}</Text>
                <View style={styles.settingActions}>
                  <OptionChip label="0.8" active={rate === 0.8} highContrast={isHighContrast} onPress={() => setRate(0.8)} />
                  <OptionChip label="1.0" active={rate === 1} highContrast={isHighContrast} onPress={() => setRate(1)} />
                  <OptionChip label="1.2" active={rate === 1.2} highContrast={isHighContrast} onPress={() => setRate(1.2)} />
                </View>
                <Text style={[styles.settingLabel, isHighContrast && styles.textHighContrast]}>Tom: {pitch.toFixed(1)}</Text>
                <View style={styles.settingActions}>
                  <OptionChip label="0.8" active={pitch === 0.8} highContrast={isHighContrast} onPress={() => setPitch(0.8)} />
                  <OptionChip label="1.0" active={pitch === 1} highContrast={isHighContrast} onPress={() => setPitch(1)} />
                  <OptionChip label="1.2" active={pitch === 1.2} highContrast={isHighContrast} onPress={() => setPitch(1.2)} />
                </View>
                <Pressable
                  style={styles.modalButtonPrimary}
                  onPress={() =>
                    Speech.speak('Olá, esta é a voz do aplicativo.', {
                      language: 'pt-BR',
                      rate,
                      pitch
                    })
                  }
                >
                  <Text style={styles.modalButtonPrimaryText}>Testar voz</Text>
                </Pressable>
              </View>
            )}

            {configSection === 'seguranca' && (
              <View style={[styles.configSectionCard, isHighContrast && styles.configSectionCardHighContrast]}>
                {needsAdminSetup ? (
                  <>
                    <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Criar senha do cuidador</Text>
                    <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                      Defina uma senha para proteger configurações e personalizar a experiência da criança.
                    </Text>
                    <TextInput
                      value={newAdminPassword}
                      onChangeText={setNewAdminPassword}
                      placeholder="Nova senha"
                      secureTextEntry
                      style={[styles.modalInput, isHighContrast && styles.inputHighContrast]}
                      placeholderTextColor="#94a3b8"
                      autoFocus
                    />
                    <TextInput
                      value={confirmAdminPassword}
                      onChangeText={setConfirmAdminPassword}
                      placeholder="Confirmar senha"
                      secureTextEntry
                      style={[styles.modalInput, isHighContrast && styles.inputHighContrast]}
                      placeholderTextColor="#94a3b8"
                    />
                    <Pressable style={styles.modalButtonPrimary} onPress={() => void handleSaveAdminPassword()}>
                      <Text style={styles.modalButtonPrimaryText}>Criar senha e entrar</Text>
                    </Pressable>
                  </>
                ) : !isAdmin ? (
                  <>
                    <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Entrar como cuidador</Text>
                    <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                      Informe a senha para gerenciar favoritos, grupos e configurações avançadas.
                    </Text>
                    <TextInput
                      value={adminPassword}
                      onChangeText={setAdminPassword}
                      placeholder="Senha do cuidador"
                      secureTextEntry
                      style={[styles.modalInput, isHighContrast && styles.inputHighContrast]}
                      placeholderTextColor="#94a3b8"
                      autoFocus
                    />
                    <Pressable style={styles.modalButtonPrimary} onPress={handleAdminLogin}>
                      <Text style={styles.modalButtonPrimaryText}>Entrar</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Você está como cuidador</Text>
                    <Pressable
                      style={styles.modalButtonDanger}
                      onPress={() => {
                        handleAdminLogout();
                        setIsConfigModalOpen(false);
                        resetConfigFields();
                      }}
                    >
                      <Text style={styles.modalButtonDangerText}>Sair do modo cuidador</Text>
                    </Pressable>

                    <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Alterar senha</Text>
                    <TextInput
                      value={adminPassword}
                      onChangeText={setAdminPassword}
                      placeholder="Senha atual"
                      secureTextEntry
                      style={[styles.modalInput, isHighContrast && styles.inputHighContrast]}
                      placeholderTextColor="#94a3b8"
                    />
                    <TextInput
                      value={newAdminPassword}
                      onChangeText={setNewAdminPassword}
                      placeholder="Nova senha"
                      secureTextEntry
                      style={[styles.modalInput, isHighContrast && styles.inputHighContrast]}
                      placeholderTextColor="#94a3b8"
                    />
                    <TextInput
                      value={confirmAdminPassword}
                      onChangeText={setConfirmAdminPassword}
                      placeholder="Confirmar nova senha"
                      secureTextEntry
                      style={[styles.modalInput, isHighContrast && styles.inputHighContrast]}
                      placeholderTextColor="#94a3b8"
                    />
                    <Pressable style={styles.modalButtonPrimary} onPress={() => void handleUpdateAdminPassword()}>
                      <Text style={styles.modalButtonPrimaryText}>Atualizar senha</Text>
                    </Pressable>

                    <Text style={[styles.modalSectionTitle, isHighContrast && styles.textHighContrast]}>Chave da IA</Text>
                    <Text style={[styles.modalHint, isHighContrast && styles.textMutedHighContrast]}>
                      A chave do `.env` é usada por padrão. Você pode substituir por outra aqui.
                    </Text>
                    <TextInput
                      value={aiApiKeyInput}
                      onChangeText={setAiApiKeyInput}
                      placeholder="EXPO_PUBLIC_GOOGLE_AI_API_KEY"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={[styles.modalInput, isHighContrast && styles.inputHighContrast]}
                      placeholderTextColor="#94a3b8"
                    />
                    <Pressable style={styles.modalButtonPrimary} onPress={() => void handleSaveAiKey()}>
                      <Text style={styles.modalButtonPrimaryText}>Salvar chave da IA</Text>
                    </Pressable>
                  </>
                )}
              </View>
            )}
            </ScrollView>
        </View>
      </IOSBottomSheet>

      {toast && (
        <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

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
  return (
    <Pressable onPress={onPress} style={[styles.categoryButton, highContrast && styles.categoryButtonHighContrast, active && styles.categoryButtonActive]}>
      <Text numberOfLines={1} style={[styles.categoryButtonText, active && styles.categoryButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ConfigTab({ label, active, onPress, highContrast = false }: { label: string; active: boolean; onPress: () => void; highContrast?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.configTab, highContrast && styles.configTabHighContrast, active && styles.configTabActive]}>
      <Text style={[styles.configTabText, highContrast && styles.configTabTextHighContrast, active && styles.configTabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ConfigNavItem({
  label,
  icon,
  active,
  onPress
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.configNavItem, active && styles.configNavItemActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={styles.configNavIcon}>{icon}</Text>
      <Text style={[styles.configNavItemText, active && styles.configNavItemTextActive]}>{label}</Text>
    </Pressable>
  );
}

function OptionChip({ label, active, onPress, highContrast = false }: { label: string; active: boolean; onPress: () => void; highContrast?: boolean }) {
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
  const isDense = columns >= 4;
  const isUltraDense = columns >= 5;
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
      <CachedImage uri={item.imageUrl} style={[styles.symbolImage, isDense && styles.symbolImageDense, isUltraDense && styles.symbolImageUltraDense]} resizeMode="contain" />
      <Text style={[styles.symbolLabel, isDense && styles.symbolLabelDense]} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

function RoutineStepCard({
  step,
  completed,
  onToggle,
  highContrast,
  uiScaleFactor
}: {
  step: RoutineStep;
  completed: boolean;
  onToggle: () => void;
  highContrast: boolean;
  uiScaleFactor: number;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.routineStepCard,
        completed && styles.routineStepCardDone,
        highContrast && styles.routineStepCardHighContrast
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${completed ? 'Desmarcar' : 'Marcar'} passo ${step.label}`}
      accessibilityState={{ checked: completed }}
    >
      {step.imageUri ? (
        <Image source={{ uri: step.imageUri }} style={styles.routineStepThumb} resizeMode="cover" />
      ) : (
        <View style={[styles.routineStepThumb, styles.routineStepThumbTextOnly]}>
          <Text style={styles.routineStepThumbLetter}>{step.label.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <Text
        style={[
          styles.routineStepLabel,
          { fontSize: 18 * uiScaleFactor },
          completed && styles.routineStepLabelDone,
          highContrast && styles.textHighContrast
        ]}
        numberOfLines={2}
      >
        {step.label}
      </Text>
      <View style={[styles.routineStepCheck, completed && styles.routineStepCheckDone]}>
        <Text style={[styles.routineStepCheckIcon, completed && styles.routineStepCheckIconDone]}>
          {completed ? '✓' : ''}
        </Text>
      </View>
    </Pressable>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F4ED'
  },
  safeAreaHighContrast: {
    backgroundColor: '#020617'
  },
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
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  introCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8E1D2',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 14
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a'
  },
  introSubtitle: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20
  },
  introToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  introToggleRowHighContrast: {
    borderColor: '#475569',
    backgroundColor: '#111827'
  },
  introCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#94a3b8',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  introCheckboxHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#64748b'
  },
  introCheckboxActive: {
    backgroundColor: '#5B8C7A',
    borderColor: '#5B8C7A'
  },
  introCheckboxIcon: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  introToggleText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    flexShrink: 1
  },
  introStartButton: {
    borderRadius: 12,
    backgroundColor: '#5B8C7A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12
  },
  introStartButtonDisabled: {
    opacity: 0.7
  },
  introStartButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15
  },
  headerCard: {
    backgroundColor: colors.systemBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs
  },
  cardHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#334155'
  },
  title: {
    fontSize: typography.title2.fontSize,
    lineHeight: typography.title2.lineHeight,
    fontWeight: typography.title2.fontWeight,
    color: colors.label
  },
  headerTagline: {
    fontSize: typography.caption2.fontSize,
    lineHeight: typography.caption2.lineHeight,
    color: colors.secondaryLabel,
    marginTop: 1,
    fontWeight: '500'
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2
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
  headerTextBlock: {
    flex: 1
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFEAE0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuIcon: {
    fontSize: 22,
    color: '#3F6656'
  },
  adminBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3
  },
  adminBadgeOn: {
    backgroundColor: colors.fill
  },
  adminBadgeOff: {
    backgroundColor: colors.secondaryFill
  },
  adminBadgeText: {
    color: colors.systemBlue,
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.3
  },
  searchToggleButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchToggleButtonActive: {
    backgroundColor: '#D9E7E0',
    borderWidth: 1,
    borderColor: '#5B8C7A'
  },
  searchToggleIcon: {
    fontSize: 16
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
    flex: 1,
    backgroundColor: colors.systemGray6,
    borderRadius: 10,
    borderWidth: 0,
    color: colors.label,
    paddingHorizontal: 12,
    height: 36
  },
  inputHighContrast: {
    backgroundColor: '#0f172a',
    borderColor: '#64748b',
    color: '#f8fafc'
  },
  searchButton: {
    backgroundColor: colors.systemBlue,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 36,
    minWidth: 78
  },
  searchClearButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 0,
    backgroundColor: colors.systemGray4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchClearButtonText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    paddingHorizontal: 12,
    marginBottom: 6
  },
  categoriesScroll: {
    minHeight: 46,
    maxHeight: 46
  },
  categoriesRow: {
    gap: 8,
    paddingTop: 2,
    paddingBottom: 2,
    alignItems: 'center',
    paddingRight: 2,
    paddingLeft: 2
  },
  categoryButton: {
    backgroundColor: colors.secondaryFill,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minHeight: 32,
    justifyContent: 'center',
    alignSelf: 'flex-start'
  },
  categoryButtonHighContrast: {
    backgroundColor: '#1e293b'
  },
  categoryButtonActive: {
    backgroundColor: colors.systemBlue
  },
  categoryButtonText: {
    color: colors.label,
    fontWeight: '500',
    fontSize: 14
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listCard: {
    flex: 1,
    backgroundColor: colors.secondarySystemBackground,
    borderRadius: 16,
    borderWidth: 0,
    overflow: 'hidden'
  },
  grid: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 12
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b'
  },
  emptyState: {
    paddingTop: 44,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  symbolCard: {
    flex: 1,
    margin: 6,
    backgroundColor: colors.systemBackground,
    borderRadius: 14,
    borderWidth: 0,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    ...shadows.sm
  },
  symbolCardDense: {
    minHeight: 120,
    padding: 8
  },
  symbolCardUltraDense: {
    minHeight: 104,
    padding: 6
  },
  favoriteButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.systemBackground,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm
  },
  favoriteButtonActive: {
    backgroundColor: colors.systemBackground
  },
  favoriteButtonText: {
    color: colors.warning,
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
    marginTop: 8,
    fontWeight: '700',
    color: '#2B2A28',
    fontSize: 16,
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
    backgroundColor: colors.secondarySystemGroupedBackground,
    borderRadius: 16,
    borderWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    ...shadows.sm
  },
  selectedList: {
    gap: 4,
    minHeight: 32,
    alignItems: 'center'
  },
  emptyChipHint: {
    color: '#64748b',
    fontSize: 12
  },
  selectedImage: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#ffffff'
  },
  selectedTextChip: {
    minWidth: 40,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#5B8C7A',
    backgroundColor: '#E9F2EE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedTextChipHighContrast: {
    borderColor: '#facc15',
    backgroundColor: '#1e293b'
  },
  selectedTextChipText: {
    color: '#1e3a34',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  selectedTextChipTextHighContrast: {
    color: '#fde68a'
  },
  coreVocabBar: {
    backgroundColor: colors.secondaryFill,
    borderRadius: 14,
    borderWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  coreVocabBarHighContrast: {
    backgroundColor: '#0b1220',
    borderColor: '#facc15'
  },
  coreVocabRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  coreVocabButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.systemBlue,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center'
  },
  coreVocabButtonHighContrast: {
    backgroundColor: '#facc15'
  },
  coreVocabButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.3
  },
  coreVocabButtonTextHighContrast: {
    color: '#020617'
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
    backgroundColor: 'rgba(91, 140, 122, 0.9)',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 6,
    minHeight: 72
  },
  routineStepCardDone: {
    backgroundColor: '#E6F4EA',
    borderColor: '#5B8C7A'
  },
  routineStepCardHighContrast: {
    backgroundColor: '#0b1220',
    borderColor: '#facc15'
  },
  routineStepThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E2E8F0'
  },
  routineStepThumbTextOnly: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  routineStepThumbLetter: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a'
  },
  routineStepLabel: {
    flex: 1,
    color: '#0f172a',
    fontWeight: '700'
  },
  routineStepLabelDone: {
    color: '#475569',
    textDecorationLine: 'line-through'
  },
  routineStepCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  routineStepCheckDone: {
    backgroundColor: '#5B8C7A',
    borderColor: '#5B8C7A'
  },
  routineStepCheckIcon: {
    color: '#cbd5e1',
    fontSize: 18,
    fontWeight: '800'
  },
  routineStepCheckIconDone: {
    color: '#ffffff'
  },
  phraseText: {
    minHeight: 30,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: '#0f172a',
    fontWeight: '600'
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
  clearButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    gap: 2
  },
  clearButtonLabel: {
    color: colors.destructive,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2
  },
  generateButton: {
    flex: 1,
    backgroundColor: colors.systemBlue,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    gap: 2
  },
  generateButtonLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2
  },
  generateButtonBusy: {
    opacity: 0.6
  },
  saveGroupButton: {
    flex: 1,
    backgroundColor: colors.fill,
    borderWidth: 0,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    gap: 2
  },
  saveGroupButtonLabel: {
    color: colors.systemBlue,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2
  },
  playButton: {
    flex: 1,
    backgroundColor: colors.systemBlue,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    gap: 2
  },
  playButtonLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md
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
  configNav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  configNavItem: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E8E1D2',
    backgroundColor: '#FFFFFF'
  },
  configNavItemActive: {
    backgroundColor: '#D9E7E0',
    borderColor: '#5B8C7A'
  },
  configNavIcon: {
    fontSize: 18
  },
  configNavItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B2A28'
  },
  configNavItemTextActive: {
    color: '#3F6656'
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
    fontSize: 16,
    fontWeight: '800',
    color: '#2B2A28',
    marginTop: 4
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
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E8E1D2',
    backgroundColor: '#FBF9F3',
    padding: 18,
    gap: 12
  },
  configSectionCardHighContrast: {
    backgroundColor: '#111827',
    borderColor: '#334155'
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
