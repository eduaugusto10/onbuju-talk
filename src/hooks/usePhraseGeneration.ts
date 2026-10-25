import { useCallback, useEffect, useRef, useState } from 'react';
import { generateNormalizedPhrase } from '../services/aiService';

export function usePhraseGeneration(onResult: (text: string) => void, onError: (message: string) => void) {
  const revision = useRef(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const invalidate = useCallback(() => {
    revision.current += 1;
    setIsGenerating(false);
  }, []);
  useEffect(() => () => { revision.current += 1; }, []);
  const generate = useCallback(async (labels: string[]) => {
    if (!labels.length) return;
    const request = ++revision.current;
    setIsGenerating(true);
    try {
      const result = await generateNormalizedPhrase(labels);
      if (request !== revision.current) return;
      onResult(result.text.toUpperCase());
      if (result.degraded && result.message) onError(result.message);
    } catch {
      if (request !== revision.current) return;
      onResult(labels.join(' ').toUpperCase());
      onError('Não foi possível gerar a frase. Usando as palavras selecionadas.');
    } finally {
      if (request === revision.current) setIsGenerating(false);
    }
  }, [onResult, onError]);
  return { generate, invalidate, isGenerating };
}
