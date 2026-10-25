import AsyncStorage from '@react-native-async-storage/async-storage';

let pending: Promise<void> = Promise.resolve();
let suspended = false;
const failedKeys = new Set<string>();

export function persistValue(key: string, value: string, onError: () => void) {
  if (suspended) return;
  pending = pending.then(async () => {
    try {
      await AsyncStorage.setItem(key, value);
      failedKeys.delete(key);
    } catch {
      failedKeys.add(key);
      onError();
    }
  });
}

export async function flushPersistence() {
  await pending;
  if (failedKeys.size) throw new Error('Há alterações que não puderam ser salvas. Tente salvar novamente antes de criar ou restaurar um backup.');
}

export async function withPersistencePaused<T>(action: () => Promise<T>) {
  if (suspended) throw new Error('Uma restauração já está em andamento.');
  suspended = true;
  try {
    await flushPersistence();
    return await action();
  } finally { suspended = false; }
}
