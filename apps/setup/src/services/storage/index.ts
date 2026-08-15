import { LocalStorageRepository } from './local-storage-repository';
import type { StorageRepository } from './storage-repository';

export const storageRepository: StorageRepository = new LocalStorageRepository();
