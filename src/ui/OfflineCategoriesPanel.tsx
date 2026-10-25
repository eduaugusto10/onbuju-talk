import React, { useEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { arasaacService } from '../services/arasaacService';
import { downloadCategory, listOfflineCategories, OfflineCategory, removeOfflineCategory } from '../services/categoryDownloadService';
import { IOSButton } from './IOSButton';

export function OfflineCategoriesPanel({ categories }: { categories: string[] }) {
  const [packs, setPacks] = useState<OfflineCategory[]>([]);
  const [active, setActive] = useState('');
  const [progress, setProgress] = useState('');
  const [message, setMessage] = useState('');
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    void listOfflineCategories().then(value => { if (mounted.current) setPacks(value); }).catch(() => setMessage('Não foi possível ler os downloads.'));
    return () => { mounted.current = false; controller.current?.abort(); };
  }, []);
  const download = async (category: string) => {
    if (controller.current) return;
    const abort = new AbortController();
    controller.current = abort;
    setActive(category); setProgress('Carregando categoria…'); setMessage('');
    try {
      await downloadCategory(category, () => arasaacService.getSymbolsByCategory(category, 'pt', true),
        (ready, total) => { if (mounted.current) setProgress(`${ready} de ${total} imagens prontas`); }, abort.signal);
      if (mounted.current) setMessage(`${category} disponível sem internet.`);
    } catch (error) {
      if (mounted.current) setMessage(error instanceof Error ? error.message : 'Não foi possível baixar.');
    } finally {
      if (mounted.current) {
        setPacks(await listOfflineCategories().catch(() => []));
        setActive(''); setProgress('');
      }
      controller.current = null;
    }
  };
  const remove = (category: string) => Alert.alert('Remover download?',
    `As imagens de ${category} precisarão de internet novamente. Os símbolos essenciais continuam disponíveis.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => {
        void removeOfflineCategory(category).then(() => listOfflineCategories()).then(setPacks)
          .catch(() => setMessage('Não foi possível remover o download.'));
      } }
    ]);
  const names = Array.from(new Set([...categories, ...packs.map(pack => pack.category)]));
  return <View style={{ gap: 16 }}>
    <Text>Baixe todos os símbolos exibidos em uma categoria para usar sem internet. Os downloads ocupam espaço neste aparelho e ficam salvos até você removê-los.</Text>
    <Text>Prefira Wi-Fi. Mantenha esta tela aberta durante o download; se sair, poderá continuar depois.</Text>
    {!!message && <Text accessibilityLiveRegion="polite">{message}</Text>}
    {names.map(category => {
      const pack = packs.find(item => item.category === category);
      const complete = pack && pack.ready === pack.symbols.length;
      return <View key={category} style={{ padding: 16, borderRadius: 16, backgroundColor: '#fff', gap: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>{category}</Text>
        <Text>{pack ? `${complete ? 'Disponível offline' : 'Download incompleto'} · ${pack.ready}/${pack.symbols.length} imagens · ${(pack.bytes / 1024 / 1024).toFixed(1)} MB` : 'Ainda não baixada'}</Text>
        {active === category ? <>
          <Text accessibilityLiveRegion="polite">{progress}</Text>
          <IOSButton label="Pausar download" onPress={() => controller.current?.abort()} />
        </> : <>
          {!complete && <IOSButton label={pack ? 'Continuar download' : 'Baixar categoria'} accessibilityLabel={`Baixar categoria ${category}`} disabled={!!active} onPress={() => void download(category)} />}
          {!!pack && <IOSButton label="Remover download" accessibilityLabel={`Remover download de ${category}`} variant="plain" destructive disabled={!!active} onPress={() => remove(category)} />}
        </>}
      </View>;
    })}
    {!names.length && <Text>Conecte-se à internet para carregar as categorias.</Text>}
  </View>;
}
