export interface SymbolItem {
  id: string;
  label: string;
  imageUrl: string;
  category: string;
  colorClass?: string;
}

export interface CustomSymbol {
  id: string;
  label: string;
  symbols: SymbolItem[];
  createdAt: string;
  phrase?: string;
}

export interface SavedPhrase {
  id: string;
  text: string;
  createdAt: string;
}

export interface HistoryPhrase {
  id: string;
  text: string;
  spokenAt: string;
}

export interface PersonalSymbol {
  id: string;
  label: string;
  categoryId: string | null;
  imageUri: string;
  audioUri?: string | null;
  createdAt: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface RoutineStep {
  id: string;
  label: string;
  imageUri?: string | null;
  createdAt: string;
}

export interface RoutineProgress {
  date: string;
  completedStepIds: string[];
}
