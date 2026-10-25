import React, { useRef, useState } from 'react';
import { Alert, ActivityIndicator, Modal, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { BACKUP_MAX_BYTES, createBackupFile, restoreBackup, validateBackup } from '../services/backupService';
import { IOSButton } from './IOSButton';

export function BackupPanel({ onRestored }: { onRestored: () => void }) {
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const [message, setMessage] = useState('');
  const run = async (action: () => Promise<void>) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setMessage('');
    try { await action(); } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível concluir o backup.');
    } finally { running.current = false; setBusy(false); }
  };
  const exportBackup = () => run(async () => {
    if (!(await Sharing.isAvailableAsync())) throw new Error('Compartilhamento de arquivos indisponível neste aparelho.');
    const uri = await createBackupFile();
    try {
      await Sharing.shareAsync(uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Salvar backup do Fala' });
      setMessage('Escolha um destino no compartilhamento para guardar sua cópia.');
    } finally { await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {}); }
  });
  const importBackup = () => run(async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', 'application/octet-stream'], copyToCacheDirectory: true });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists || info.isDirectory || info.size > BACKUP_MAX_BYTES) throw new Error('Arquivo ausente ou maior que 64 MB.');
      const backup = validateBackup(await FileSystem.readAsStringAsync(uri));
      const confirmed = await new Promise<boolean>(resolve => Alert.alert(
        'Restaurar backup?',
        'Isso substitui as configurações, os símbolos, as frases, as rotinas e as cenas atuais. Exporte uma cópia antes se quiser preservá-los. A senha do cuidador e a chave da IA serão mantidas.',
        [{ text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Restaurar', style: 'destructive', onPress: () => resolve(true) }],
        { cancelable: true, onDismiss: () => resolve(false) }
      ));
      if (!confirmed) return;
      await restoreBackup(backup);
      onRestored();
    } finally {
      if (FileSystem.cacheDirectory && uri.startsWith(FileSystem.cacheDirectory)) await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
    }
  });
  return <View style={{ gap: 16 }}>
    <Text>Guarde uma cópia das configurações, símbolos, fotos e gravações para recuperar seus dados ou trocar de aparelho.</Text>
    <Text>O arquivo contém suas fotos e áudios, sem criptografia. Salve-o em um local de confiança. Senha e chave da IA não são incluídas. Limite: 40 MB de mídias.</Text>
    <IOSButton label="Exportar backup" disabled={busy} onPress={() => void exportBackup()} />
    <IOSButton label="Importar backup" disabled={busy} onPress={() => void importBackup()} />
    <Modal visible={busy} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{ padding: 24, borderRadius: 16, backgroundColor: '#fff' }}>
          <ActivityIndicator accessibilityLabel="Processando backup" />
          <Text>Aguarde a conclusão ou cancele na janela do sistema.</Text>
        </View>
      </View>
    </Modal>
    {!!message && <Text accessibilityLiveRegion="polite">{message}</Text>}
  </View>;
}
