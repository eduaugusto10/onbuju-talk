import { Image } from 'react-native';
import type { SymbolItem } from '../types';
import catalog from '../../assets/offline/catalog.json';

export const OFFLINE_SYMBOLS: SymbolItem[] = catalog;
const assets: Record<string, number> = {
  "https://static.arasaac.org/pictograms/6632/6632_300.png": require('../../assets/offline/6632.png'),
  "https://static.arasaac.org/pictograms/5441/5441_300.png": require('../../assets/offline/5441.png'),
  "https://static.arasaac.org/pictograms/6456/6456_300.png": require('../../assets/offline/6456.png'),
  "https://static.arasaac.org/pictograms/6061/6061_300.png": require('../../assets/offline/6061.png'),
  "https://static.arasaac.org/pictograms/12252/12252_300.png": require('../../assets/offline/12252.png'),
  "https://static.arasaac.org/pictograms/5921/5921_300.png": require('../../assets/offline/5921.png'),
  "https://static.arasaac.org/pictograms/6964/6964_300.png": require('../../assets/offline/6964.png'),
  "https://static.arasaac.org/pictograms/32446/32446_300.png": require('../../assets/offline/32446.png'),
  "https://static.arasaac.org/pictograms/2458/2458_300.png": require('../../assets/offline/2458.png'),
  "https://static.arasaac.org/pictograms/2497/2497_300.png": require('../../assets/offline/2497.png'),
  "https://static.arasaac.org/pictograms/23392/23392_300.png": require('../../assets/offline/23392.png'),
  "https://static.arasaac.org/pictograms/6479/6479_300.png": require('../../assets/offline/6479.png'),
  "https://static.arasaac.org/pictograms/5526/5526_300.png": require('../../assets/offline/5526.png'),
  "https://static.arasaac.org/pictograms/5584/5584_300.png": require('../../assets/offline/5584.png'),
  "https://static.arasaac.org/pictograms/3220/3220_300.png": require('../../assets/offline/3220.png'),
  "https://static.arasaac.org/pictograms/7196/7196_300.png": require('../../assets/offline/7196.png'),
};

export function bundledImageUri(uri: string): string | undefined {
  const asset = assets[uri];
  return asset ? Image.resolveAssetSource(asset)?.uri : undefined;
}
