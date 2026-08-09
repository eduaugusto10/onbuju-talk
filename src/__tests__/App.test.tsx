import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import App from '../App';

jest.mock('expo-speech', () => ({
  stop: jest.fn(),
  speak: jest.fn()
}));

jest.mock('../services/imageCacheService', () => ({
  getCachedImageUri: jest.fn(async (uri: string) => uri),
  warmImageCache: jest.fn(async () => undefined),
  getImageCacheMetrics: jest.fn(() => ({ cacheHit: 0, cacheMiss: 0 }))
}));

jest.mock('../services/arasaacService', () => ({
  arasaacService: {
    getBestSymbols: jest.fn(async () => [
      {
        id: '1',
        label: 'agua',
        imageUrl: 'https://example.com/agua.png',
        category: 'General'
      }
    ]),
    getCategories: jest.fn(async () => ['Alimentacao']),
    getSymbolsByCategory: jest.fn(async () => []),
    searchSymbols: jest.fn(async () => [])
  }
}));

jest.mock('../services/aiService', () => ({
  generateNormalizedPhrase: jest.fn(async () => ({
    text: 'eu quero agua',
    degraded: true,
    message: 'IA indisponivel no momento.'
  })),
  saveAiApiKey: jest.fn(async () => undefined)
}));

jest.mock('../services/personalSymbolsService', () => ({
  savePersonalSymbolImage: jest.fn(async (uri: string) => `file:///doc-dir/personal-symbols/copy-${uri.split('/').pop()}`),
  deletePersonalSymbolImage: jest.fn(async () => undefined)
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  launchCameraAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///tmp/fake-camera.jpg' }] })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///tmp/fake-gallery.jpg' }] })),
  MediaTypeOptions: { Images: 'Images', Videos: 'Videos' }
}));

jest.mock('../services/personalAudioService', () => ({
  savePersonalAudioFile: jest.fn(async (uri: string) => `file:///doc-dir/personal-audio/copy-${uri.split('/').pop()}`),
  deletePersonalAudioFile: jest.fn(async () => undefined)
}));

jest.mock('expo-audio', () => {
  const player = { play: jest.fn(), pause: jest.fn(), remove: jest.fn() };
  return {
    createAudioPlayer: jest.fn(() => player),
    setAudioModeAsync: jest.fn(async () => undefined),
    requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
    useAudioRecorder: jest.fn(() => ({
      uri: 'file:///tmp/fake-recording.m4a',
      prepareToRecordAsync: jest.fn(async () => undefined),
      record: jest.fn(),
      stop: jest.fn(async () => undefined)
    })),
    useAudioRecorderState: jest.fn(() => ({ isRecording: false, durationMillis: 0 })),
    RecordingPresets: { HIGH_QUALITY: {}, LOW_QUALITY: {} },
    __playerMock: player
  };
});

describe('App', () => {
  const asyncStorageMock = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    asyncStorageMock.getItem.mockImplementation(async () => null);
    asyncStorageMock.setItem.mockImplementation(async () => undefined);
  });

  it('segue fluxo de gerar frase', async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByText('Tudo')).toBeTruthy());
    fireEvent.press(screen.getByText('Tudo'));
    const symbol = await screen.findByText('agua');
    fireEvent.press(symbol);
    fireEvent.press(screen.getByLabelText('Gerar frase com IA'));

    await waitFor(() => {
      expect(screen.getByText('IA indisponivel no momento.')).toBeTruthy();
      expect(screen.getByDisplayValue('EU QUERO AGUA')).toBeTruthy();
    });
  });

  it('abre configuracao e navega para secao de acessibilidade', async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByText('Tudo')).toBeTruthy());
    fireEvent.press(screen.getByLabelText('Abrir configurações do cuidador'));
    fireEvent.press(await screen.findByText('Acessibilidade'));

    await waitFor(() => {
      expect(screen.getByText('Feedback visual ao tocar')).toBeTruthy();
      expect(screen.getByText('Sálvia & Creme')).toBeTruthy();
    });
  });

  it('permite ajustar imagens por linha e persiste a preferencia', async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByText('Tudo')).toBeTruthy());
    fireEvent.press(screen.getByLabelText('Abrir configurações do cuidador'));
    fireEvent.press(await screen.findByText('Aparência'));
    fireEvent.press(await screen.findByText('4 col'));

    await waitFor(() => {
      expect(screen.getByLabelText('Grade de simbolos 4 colunas')).toBeTruthy();
      expect(asyncStorageMock.setItem).toHaveBeenCalledWith('grid_columns', '4');
    });
  });

  it('restaura densidade de grid salva no boot', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'grid_columns') return '5';
      return null;
    });
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText('Grade de simbolos 5 colunas')).toBeTruthy();
    });
  });

  it('mostra vocabulario core padrao apos iniciar', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'section_visibility') return JSON.stringify({ frases: true, historico: true, rotina: true, cenas: true });
      return null;
    });
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText('Adicionar palavra quero')).toBeTruthy();
      expect(screen.getByLabelText('Adicionar palavra ajuda')).toBeTruthy();
      expect(screen.getByLabelText('Adicionar palavra mae')).toBeTruthy();
    });
  });

  it('adiciona palavra do core a selecao e persiste vocabulario', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'section_visibility') return JSON.stringify({ frases: true, historico: true, rotina: true, cenas: true });
      return null;
    });
    render(<App />);

    const queroButton = await screen.findByLabelText('Adicionar palavra quero');
    fireEvent.press(queroButton);

    await waitFor(() => {
      expect(asyncStorageMock.setItem).toHaveBeenCalledWith(
        'core_vocabulary',
        expect.stringContaining('quero')
      );
    });
  });

  it('restaura vocabulario core salvo no boot', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'core_vocabulary') return JSON.stringify(['agua', 'banheiro']);
      return null;
    });
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText('Adicionar palavra agua')).toBeTruthy();
      expect(screen.getByLabelText('Adicionar palavra banheiro')).toBeTruthy();
      expect(screen.queryByLabelText('Adicionar palavra quero')).toBeNull();
    });
  });

  it('mostra frases prontas padrao na categoria Frases', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'section_visibility') return JSON.stringify({ frases: true, historico: true, rotina: true, cenas: true });
      return null;
    });
    render(<App />);

    await waitFor(() => expect(screen.getByText('Tudo')).toBeTruthy());
    fireEvent.press(screen.getByText('Frases'));

    await waitFor(() => {
      expect(screen.getByLabelText('Falar frase quero banheiro')).toBeTruthy();
      expect(screen.getByLabelText('Falar frase me ajuda')).toBeTruthy();
    });
  });

  it('falar frase pronta registra no historico e persiste', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'section_visibility') return JSON.stringify({ frases: true, historico: true, rotina: true, cenas: true });
      return null;
    });
    render(<App />);

    await waitFor(() => expect(screen.getByText('Frases')).toBeTruthy());
    fireEvent.press(screen.getByText('Frases'));

    const phraseBtn = await screen.findByLabelText('Falar frase quero banheiro');
    await act(async () => {
      fireEvent.press(phraseBtn);
    });

    await waitFor(() => {
      expect(asyncStorageMock.setItem).toHaveBeenCalledWith(
        'arasaac_phrase_history',
        expect.stringContaining('quero banheiro')
      );
    });

    fireEvent.press(screen.getByText('Historico'));
    await waitFor(() => {
      expect(screen.getByLabelText('Falar frase quero banheiro')).toBeTruthy();
    });
  });

  it('restaura historico de frases salvo no boot', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'section_visibility') return JSON.stringify({ frases: true, historico: true, rotina: true, cenas: true });
      if (key === 'arasaac_phrase_history')
        return JSON.stringify([
          { id: 'h-1', text: 'bom dia', spokenAt: new Date().toISOString() }
        ]);
      return null;
    });
    render(<App />);

    await waitFor(() => expect(screen.getByText('Historico')).toBeTruthy());
    fireEvent.press(screen.getByText('Historico'));

    await waitFor(() => {
      expect(screen.getByLabelText('Falar frase bom dia')).toBeTruthy();
    });
  });

  it('restaura simbolos pessoais salvos no boot e mostra na categoria custom', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'arasaac_custom_categories')
        return JSON.stringify([{ id: 'cat-1', name: 'Casa', createdAt: new Date().toISOString() }]);
      if (key === 'arasaac_personal_symbols')
        return JSON.stringify([
          {
            id: 'personal-1',
            label: 'vovo',
            categoryId: 'cat-1',
            imageUri: 'file:///doc-dir/personal-symbols/vovo.jpg',
            createdAt: new Date().toISOString()
          }
        ]);
      return null;
    });
    render(<App />);

    await waitFor(() => expect(screen.getByText('Casa')).toBeTruthy());
    fireEvent.press(screen.getByText('Casa'));

    await waitFor(() => {
      expect(screen.getByText('vovo')).toBeTruthy();
    });
  });

  it('simbolos pessoais sem categoria nao aparecem em categorias custom', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'arasaac_custom_categories')
        return JSON.stringify([{ id: 'cat-3', name: 'Familia', createdAt: new Date().toISOString() }]);
      if (key === 'arasaac_personal_symbols')
        return JSON.stringify([
          {
            id: 'p-orphan',
            label: 'sem-cat',
            categoryId: null,
            imageUri: 'file:///doc-dir/personal-symbols/o.jpg',
            createdAt: new Date().toISOString()
          }
        ]);
      return null;
    });
    render(<App />);

    await waitFor(() => expect(screen.getByText('Familia')).toBeTruthy());
    fireEvent.press(screen.getByText('Familia'));

    await waitFor(() => {
      expect(screen.getByText('Nenhum simbolo nesta categoria.')).toBeTruthy();
      expect(screen.queryByText('sem-cat')).toBeNull();
    });
  });

  it('hydrata e persiste categorias customizadas', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'arasaac_custom_categories')
        return JSON.stringify([{ id: 'cat-4', name: 'Escola', createdAt: new Date().toISOString() }]);
      return null;
    });
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Escola')).toBeTruthy();
      expect(
        asyncStorageMock.setItem.mock.calls.some(
          ([key, value]) => key === 'arasaac_custom_categories' && (value as string).includes('Escola')
        )
      ).toBe(true);
    });
  });

  it('preserva audioUri ao hidratar simbolos pessoais', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'arasaac_custom_categories')
        return JSON.stringify([{ id: 'cat-voz', name: 'Familia', createdAt: new Date().toISOString() }]);
      if (key === 'arasaac_personal_symbols')
        return JSON.stringify([
          {
            id: 'p-voz',
            label: 'mamae',
            categoryId: 'cat-voz',
            imageUri: 'file:///doc-dir/personal-symbols/mamae.jpg',
            audioUri: 'file:///doc-dir/personal-audio/mamae.m4a',
            createdAt: new Date().toISOString()
          }
        ]);
      return null;
    });
    render(<App />);

    await waitFor(() => {
      expect(
        asyncStorageMock.setItem.mock.calls.some(
          ([key, value]) =>
            key === 'arasaac_personal_symbols' && (value as string).includes('personal-audio')
        )
      ).toBe(true);
    });
  });

  it('long press em simbolo com audio aciona createAudioPlayer', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'arasaac_custom_categories')
        return JSON.stringify([{ id: 'cat-lp', name: 'Casa', createdAt: new Date().toISOString() }]);
      if (key === 'arasaac_personal_symbols')
        return JSON.stringify([
          {
            id: 'p-lp',
            label: 'papai',
            categoryId: 'cat-lp',
            imageUri: 'file:///doc-dir/personal-symbols/p.jpg',
            audioUri: 'file:///doc-dir/personal-audio/p.m4a',
            createdAt: new Date().toISOString()
          }
        ]);
      return null;
    });
    const expoAudioMock = jest.requireMock('expo-audio');
    expoAudioMock.createAudioPlayer.mockClear();

    render(<App />);

    await waitFor(() => expect(screen.getByText('Casa')).toBeTruthy());
    fireEvent.press(screen.getByText('Casa'));

    const card = await screen.findByText('papai');
    fireEvent(card, 'longPress');

    await waitFor(() => {
      expect(expoAudioMock.createAudioPlayer).toHaveBeenCalledWith('file:///doc-dir/personal-audio/p.m4a');
    });
  });

  it('mostra rotina do dia com passos e progresso hidratado', async () => {
    const today = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    })();
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'section_visibility') return JSON.stringify({ frases: true, historico: true, rotina: true, cenas: true });
      if (key === 'arasaac_routine_steps')
        return JSON.stringify([
          { id: 'step-a', label: 'Acordar', createdAt: new Date().toISOString() },
          { id: 'step-b', label: 'Escovar dentes', createdAt: new Date().toISOString() }
        ]);
      if (key === 'arasaac_routine_progress')
        return JSON.stringify({ date: today, completedStepIds: ['step-a'] });
      return null;
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText('Rotina')).toBeTruthy());
    fireEvent.press(screen.getByText('Rotina'));

    await waitFor(() => {
      expect(screen.getByText('Acordar')).toBeTruthy();
      expect(screen.getByText('Escovar dentes')).toBeTruthy();
      expect(screen.getByLabelText('Desmarcar passo 1: Acordar. Segure para ouvir.')).toBeTruthy();
      expect(screen.getByLabelText('Marcar passo 2: Escovar dentes. Segure para ouvir.')).toBeTruthy();
    });
  });

  it('tap em passo da rotina marca como concluido e persiste', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'section_visibility') return JSON.stringify({ frases: true, historico: true, rotina: true, cenas: true });
      if (key === 'arasaac_routine_steps')
        return JSON.stringify([{ id: 'step-x', label: 'Tomar cafe', createdAt: new Date().toISOString() }]);
      return null;
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText('Rotina')).toBeTruthy());
    fireEvent.press(screen.getByText('Rotina'));

    const stepBtn = await screen.findByLabelText('Marcar passo 1: Tomar cafe. Segure para ouvir.');
    fireEvent.press(stepBtn);

    await waitFor(() => {
      expect(
        asyncStorageMock.setItem.mock.calls.some(
          ([key, value]) => key === 'arasaac_routine_progress' && (value as string).includes('step-x')
        )
      ).toBe(true);
    });
  });

  it('progresso de rotina de dia antigo e resetado no boot', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'section_visibility') return JSON.stringify({ frases: true, historico: true, rotina: true, cenas: true });
      if (key === 'arasaac_routine_steps')
        return JSON.stringify([{ id: 'step-old', label: 'Passo antigo', createdAt: new Date().toISOString() }]);
      if (key === 'arasaac_routine_progress')
        return JSON.stringify({ date: '2020-01-01', completedStepIds: ['step-old'] });
      return null;
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText('Rotina')).toBeTruthy());
    fireEvent.press(screen.getByText('Rotina'));

    await waitFor(() => {
      expect(screen.getByLabelText('Marcar passo 1: Passo antigo. Segure para ouvir.')).toBeTruthy();
      expect(screen.queryByLabelText('Desmarcar passo 1: Passo antigo. Segure para ouvir.')).toBeNull();
    });
  });
});
