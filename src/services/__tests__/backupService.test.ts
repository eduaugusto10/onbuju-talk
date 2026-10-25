import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Backup, createBackupFile, recoverInterruptedRestore, restoreBackup, validateBackup } from '../backupService';
import { STORAGE_KEYS } from '../../storageKeys';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///doc/', cacheDirectory: 'file:///cache/', EncodingType: { Base64: 'base64' },
  makeDirectoryAsync: jest.fn(async () => {}),
  writeAsStringAsync: jest.fn(async () => {}),
  readAsStringAsync: jest.fn(async () => 'YWJj'),
  getInfoAsync: jest.fn(async () => ({ exists: true, isDirectory: false, size: 3 })),
  deleteAsync: jest.fn(async () => {})
}));

function fixture(): Backup {
  return {
    format: 'fala-backup', version: 1, createdAt: new Date().toISOString(),
    data: Object.fromEntries(Object.values(STORAGE_KEYS).filter(key => key !== STORAGE_KEYS.adminPasswordHash).map(key => [key, null])),
    media: {}
  };
}

describe('backup portátil', () => {
  beforeEach(async () => { jest.clearAllMocks(); await AsyncStorage.clear(); });

  it('inclui mídia e preserva senha e chave fora do arquivo', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.personalSymbols, JSON.stringify([{ id: '1', label: 'Mãe', categoryId: null, imageUri: 'file:///doc/personal-symbols/mae.jpg', audioUri: 'file:///doc/personal-audio/mae.m4a' }]));
    await AsyncStorage.setItem(STORAGE_KEYS.adminPasswordHash, 'private');
    await AsyncStorage.setItem('ai_settings_v1', 'private-api');
    await createBackupFile();
    const raw = jest.mocked(FileSystem.writeAsStringAsync).mock.calls[0][1];
    const backup = validateBackup(raw);
    expect(Object.keys(backup.media)).toHaveLength(2);
    expect(raw).not.toContain('private');
    expect(raw).not.toContain('file:///doc');
    expect(backup.data[STORAGE_KEYS.personalSymbols]).toContain('fala-media:media-0');
  });

  it('restaura mídia em novos caminhos locais sem substituir a senha', async () => {
    const backup = fixture();
    backup.data[STORAGE_KEYS.personalSymbols] = JSON.stringify([{ id: '1', label: 'Mãe', categoryId: null, imageUri: 'fala-media:media-0' }]);
    backup.media['media-0'] = { extension: 'jpg', base64: 'YWJj' };
    await AsyncStorage.setItem(STORAGE_KEYS.adminPasswordHash, 'keep');
    await restoreBackup(backup);
    const symbols = JSON.parse((await AsyncStorage.getItem(STORAGE_KEYS.personalSymbols))!);
    expect(symbols[0].imageUri).toMatch(/^file:\/\/\/doc\/personal-symbols\/restore-.*\.jpg$/);
    expect(await AsyncStorage.getItem(STORAGE_KEYS.adminPasswordHash)).toBe('keep');
    expect(await AsyncStorage.getItem('fala_restore_journal_v1')).toBeNull();
  });

  it('rejeita versão desconhecida, caminhos maliciosos e objetos incompletos', () => {
    expect(() => validateBackup(JSON.stringify({ ...fixture(), version: 2 }))).toThrow();
    const backup = fixture();
    backup.media['../../outside'] = { extension: 'jpg', base64: 'YWJj' };
    expect(() => validateBackup(JSON.stringify(backup))).toThrow();
    backup.media = {};
    backup.data[STORAGE_KEYS.favorites] = JSON.stringify([{ id: '1' }]);
    expect(() => validateBackup(JSON.stringify(backup))).toThrow();
  });

  it('não altera dados se uma mídia referenciada não existe', async () => {
    const backup = fixture();
    backup.data[STORAGE_KEYS.personalSymbols] = JSON.stringify([{ id: '1', label: 'Mãe', categoryId: null, imageUri: 'fala-media:media-9' }]);
    await AsyncStorage.setItem(STORAGE_KEYS.personalSymbols, 'original');
    await expect(restoreBackup(backup)).rejects.toThrow('ausente');
    expect(await AsyncStorage.getItem(STORAGE_KEYS.personalSymbols)).toBe('original');
  });

  it('não exporta um backup incompleto se faltar um arquivo pessoal', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.personalSymbols, JSON.stringify([{ id: '1', label: 'Mãe', categoryId: null, imageUri: 'file:///doc/personal-symbols/missing.jpg' }]));
    jest.mocked(FileSystem.getInfoAsync).mockResolvedValueOnce({ exists: false, uri: 'file:///doc/missing.jpg', isDirectory: false });
    await expect(createBackupFile()).rejects.toThrow('não foi encontrada');
    expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled();
  });

  it('desfaz uma escrita parcial quando o armazenamento falha', async () => {
    const backup = fixture();
    backup.data[STORAGE_KEYS.gridColumns] = '4';
    await AsyncStorage.setItem(STORAGE_KEYS.gridColumns, '2');
    const original = jest.mocked(AsyncStorage.multiSet).getMockImplementation()!;
    jest.mocked(AsyncStorage.multiSet).mockImplementationOnce(original).mockImplementationOnce(async entries => {
      await AsyncStorage.setItem(entries[0][0], entries[0][1]);
      throw new Error('disk full');
    });
    await expect(restoreBackup(backup)).rejects.toThrow('disk full');
    expect(await AsyncStorage.getItem(STORAGE_KEYS.gridColumns)).toBe('2');
    expect(await AsyncStorage.getItem('fala_restore_journal_v1')).toBeNull();
  });

  it('recupera a configuração anterior após interrupção durante restauração', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.gridColumns, '4');
    await AsyncStorage.setItem('fala_restore_journal_v1', JSON.stringify([[STORAGE_KEYS.gridColumns, '2']]));
    await recoverInterruptedRestore();
    expect(await AsyncStorage.getItem(STORAGE_KEYS.gridColumns)).toBe('2');
    expect(await AsyncStorage.getItem('fala_restore_journal_v1')).toBeNull();
  });
});
