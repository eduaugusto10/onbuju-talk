import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
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

describe('App', () => {
  const asyncStorageMock = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    asyncStorageMock.getItem.mockImplementation(async () => null);
    asyncStorageMock.setItem.mockImplementation(async () => undefined);
  });

  it('mostra intro no primeiro acesso e segue fluxo de gerar frase', async () => {
    render(<App />);

    expect(await screen.findByText('Comecar')).toBeTruthy();
    fireEvent.press(screen.getByText('Comecar'));
    await waitFor(() => expect(screen.getByText('Tudo')).toBeTruthy());
    fireEvent.press(screen.getByText('Tudo'));
    const symbol = await screen.findByText('agua');
    fireEvent.press(symbol);
    fireEvent.press(screen.getByText('Gerar'));

    await waitFor(() => {
      expect(screen.getByText('IA indisponivel no momento.')).toBeTruthy();
      expect(screen.getByDisplayValue('eu quero agua')).toBeTruthy();
    });
  });

  it('abre configuracao e navega para secao de acessibilidade', async () => {
    render(<App />);

    fireEvent.press(await screen.findByText('Comecar'));
    await waitFor(() => expect(screen.getByText('Tudo')).toBeTruthy());
    fireEvent.press(screen.getByText('☰'));
    fireEvent.press(screen.getByText('Configuração'));
    fireEvent.press(screen.getByText('Acessibilidade'));

    await waitFor(() => {
      expect(screen.getByText('Feedback visual')).toBeTruthy();
      expect(screen.getByText('Contraste')).toBeTruthy();
    });
  });

  it('permite ajustar imagens por linha e persiste a preferencia', async () => {
    render(<App />);

    fireEvent.press(await screen.findByText('Comecar'));
    await waitFor(() => expect(screen.getByText('Tudo')).toBeTruthy());
    fireEvent.press(screen.getByText('☰'));
    fireEvent.press(screen.getByText('Configuração'));
    fireEvent.press(screen.getByText('4 col'));

    await waitFor(() => {
      expect(screen.getByLabelText('Grade de simbolos 4 colunas')).toBeTruthy();
      expect(asyncStorageMock.setItem).toHaveBeenCalledWith('grid_columns', '4');
    });
  });

  it('abre direto na home quando preferencia de pular intro estiver ativa', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => (key === 'intro_skip_enabled' ? '1' : null));
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Tudo')).toBeTruthy();
      expect(screen.queryByText('Comecar')).toBeNull();
    });
  });

  it('restaura densidade de grid salva no boot', async () => {
    asyncStorageMock.getItem.mockImplementation(async key => {
      if (key === 'intro_skip_enabled') return '1';
      if (key === 'grid_columns') return '5';
      return null;
    });
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText('Grade de simbolos 5 colunas')).toBeTruthy();
    });
  });

  it('persiste opcao de nao mostrar novamente ao iniciar app', async () => {
    render(<App />);

    fireEvent.press(await screen.findByText('Nao mostrar novamente'));
    fireEvent.press(screen.getByText('Comecar'));

    await waitFor(() => {
      expect(asyncStorageMock.setItem).toHaveBeenCalledWith('intro_skip_enabled', '1');
      expect(screen.getByText('Tudo')).toBeTruthy();
    });
  });
});
