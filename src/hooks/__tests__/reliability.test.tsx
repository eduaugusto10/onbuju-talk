import { act, renderHook } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePersistedValue } from '../usePersistedValue';
import { flushPersistence } from '../../services/persistenceService';
import { usePhraseGeneration } from '../usePhraseGeneration';
import { generateNormalizedPhrase, PhraseResult } from '../../services/aiService';

jest.mock('../../services/aiService', () => ({ generateNormalizedPhrase: jest.fn() }));

describe('persistência e geração concorrente', () => {
  beforeEach(() => jest.clearAllMocks());

  it('não grava valores iniciais antes da hidratação e salva o valor restaurado', async () => {
    const onError = jest.fn();
    const { rerender } = renderHook<void, { value: string; ready: boolean }>(({ value, ready }) => usePersistedValue('favorites', value, ready, onError), {
      initialProps: { value: '[]', ready: false }
    });
    await flushPersistence();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    rerender({ value: '["agua"]', ready: true });
    await flushPersistence();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('favorites', '["agua"]');
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('favorites', '[]');
  });

  it('mantém a ordem quando uma gravação antiga é lenta', async () => {
    let release!: () => void;
    jest.mocked(AsyncStorage.setItem).mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
    const onError = jest.fn();
    const { rerender } = renderHook<void, { value: string }>(({ value }) => usePersistedValue('phrase', value, true, onError), { initialProps: { value: 'antigo' } });
    await act(async () => {});
    rerender({ value: 'novo' });
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    release();
    await flushPersistence();
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith('phrase', 'novo');
  });

  it('ignora uma resposta da IA depois que a frase foi editada ou limpa', async () => {
    let resolve!: (result: PhraseResult) => void;
    jest.mocked(generateNormalizedPhrase).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    const onResult = jest.fn();
    const onError = jest.fn();
    const { result } = renderHook(() => usePhraseGeneration(onResult, onError));
    let request!: Promise<void>;
    act(() => { request = result.current.generate(['quero', 'água']); });
    act(() => result.current.invalidate());
    await act(async () => { resolve({ text: 'Quero água', degraded: false }); await request; });
    expect(onResult).not.toHaveBeenCalled();
    expect(result.current.isGenerating).toBe(false);
  });

  it('uma resposta antiga não substitui uma geração mais recente', async () => {
    let first!: (result: PhraseResult) => void;
    jest.mocked(generateNormalizedPhrase)
      .mockImplementationOnce(() => new Promise(done => { first = done; }))
      .mockResolvedValueOnce({ text: 'Não quero', degraded: false });
    const onResult = jest.fn();
    const { result } = renderHook(() => usePhraseGeneration(onResult, jest.fn()));
    let request!: Promise<void>;
    act(() => { request = result.current.generate(['quero']); });
    await act(async () => { await result.current.generate(['não', 'quero']); });
    await act(async () => { first({ text: 'Quero', degraded: false }); await request; });
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith('NÃO QUERO');
  });
});
