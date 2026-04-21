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
