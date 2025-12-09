import axios from 'axios';
import CryptoJS from 'crypto-js';
import { LOCAL_STORAGE_KEYS, DEFAULT_PROMPTS, SHOPIFY_API_VERSION } from '../utils/constants';

class StorageService {
  constructor() {
    this.encryptionKey = this.getOrCreateKey();
    this.credentialsCache = null;
  }

  /**
   * Obtiene o crea clave de encriptación única
   */
  getOrCreateKey() {
    let key = localStorage.getItem(LOCAL_STORAGE_KEYS.ENCRYPTION_KEY);
    if (!key) {
      key = CryptoJS.lib.WordArray.random(256 / 8).toString();
      localStorage.setItem(LOCAL_STORAGE_KEYS.ENCRYPTION_KEY, key);
    }
    return key;
  }

  /**
   * Encripta datos sensibles
   */
  encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
  }

  /**
   * Desencripta datos
   */
  decrypt(encrypted) {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Error desencriptando datos:', error);
      return null;
    }
  }

  /**
   * Guarda credenciales (en archivo via backend + localStorage como backup)
   */
  async saveCredentials(credentials) {
    // Guardar en localStorage como backup
    const encrypted = this.encrypt(credentials);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CREDENTIALS, encrypted);

    // Intentar guardar en archivo via backend
    try {
      await axios.post('/api/credentials', { credentials });
      console.log('[Storage] Credentials saved to file');
    } catch (error) {
      console.warn('[Storage] Could not save to file, using localStorage only:', error.message);
    }

    // Actualizar cache
    this.credentialsCache = credentials;
  }

  /**
   * Guarda credenciales (versión síncrona para compatibilidad)
   */
  saveCredentialsSync(credentials) {
    const encrypted = this.encrypt(credentials);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CREDENTIALS, encrypted);
    this.credentialsCache = credentials;

    // Fire and forget - intentar guardar en archivo
    axios.post('/api/credentials', { credentials }).catch(() => {});
  }

  /**
   * Obtiene credenciales (intenta archivo primero, luego localStorage)
   */
  async loadCredentials() {
    // Intentar cargar desde archivo via backend
    try {
      const response = await axios.get('/api/credentials');
      if (response.data.success && response.data.credentials) {
        console.log('[Storage] Credentials loaded from file');
        this.credentialsCache = response.data.credentials;
        return response.data.credentials;
      }
    } catch (error) {
      console.warn('[Storage] Could not load from file:', error.message);
    }

    // Fallback a localStorage
    const encrypted = localStorage.getItem(LOCAL_STORAGE_KEYS.CREDENTIALS);
    if (encrypted) {
      const decrypted = this.decrypt(encrypted);
      if (decrypted) {
        console.log('[Storage] Credentials loaded from localStorage');
        this.credentialsCache = decrypted;
        return decrypted;
      }
    }

    // Devolver credenciales por defecto
    console.log('[Storage] Using default credentials');
    return this.getDefaultCredentials();
  }

  /**
   * Obtiene credenciales (versión síncrona - usa cache o localStorage)
   */
  getCredentials() {
    // Si hay cache, usarla
    if (this.credentialsCache) {
      return this.credentialsCache;
    }

    // Intentar localStorage
    const encrypted = localStorage.getItem(LOCAL_STORAGE_KEYS.CREDENTIALS);
    if (encrypted) {
      const decrypted = this.decrypt(encrypted);
      if (decrypted) {
        this.credentialsCache = decrypted;
        return decrypted;
      }
    }

    return this.getDefaultCredentials();
  }

  /**
   * Credenciales por defecto
   */
  getDefaultCredentials() {
    return {
      selectedAIModel: 'gemini',
      google: { apiKey: '', status: 'unconfigured' },
      nanoBanana: { apiKey: '', status: 'unconfigured' },
      shopify: {
        storeUrl: '',
        accessToken: '',
        apiVersion: SHOPIFY_API_VERSION,
        status: 'unconfigured'
      },
      gsc: {
        projectId: '',
        clientId: '',
        clientSecret: '',
        siteUrl: '',
        refreshToken: '',
        status: 'unconfigured'
      }
    };
  }

  /**
   * Guarda prompts
   */
  savePrompts(prompts) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
  }

  /**
   * Obtiene prompts
   */
  getPrompts() {
    const prompts = localStorage.getItem(LOCAL_STORAGE_KEYS.PROMPTS);
    return prompts ? JSON.parse(prompts) : DEFAULT_PROMPTS;
  }

  /**
   * Guarda grupos con todo su contenido generado
   */
  saveGroups(groups) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  }

  /**
   * Obtiene grupos
   */
  getGroups() {
    const groups = localStorage.getItem(LOCAL_STORAGE_KEYS.GROUPS);
    return groups ? JSON.parse(groups) : [];
  }

  /**
   * Actualiza un grupo específico
   */
  updateGroup(groupId, updates) {
    const groups = this.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);

    if (index !== -1) {
      groups[index] = { ...groups[index], ...updates };
      this.saveGroups(groups);
      return groups[index];
    }
    return null;
  }

  /**
   * Agrega una nueva versión a un grupo
   */
  addVersion(groupId, content) {
    const groups = this.getGroups();
    const group = groups.find((g) => g.id === groupId);

    if (group) {
      if (!group.generated) group.generated = {};
      if (!group.generated.versions) group.generated.versions = [];

      const versionNumber = group.generated.versions.length + 1;
      group.generated.versions.push({
        version: versionNumber,
        timestamp: new Date().toISOString(),
        content: { ...content }
      });

      // Actualizar contenido actual
      group.generated = {
        ...group.generated,
        ...content,
        currentVersion: versionNumber
      };

      this.saveGroups(groups);
      return group;
    }
    return null;
  }

  /**
   * Obtiene una versión específica
   */
  getVersion(groupId, versionNumber) {
    const groups = this.getGroups();
    const group = groups.find((g) => g.id === groupId);

    if (group && group.generated && group.generated.versions) {
      return group.generated.versions.find((v) => v.version === versionNumber);
    }
    return null;
  }

  /**
   * Restaura una versión anterior
   */
  restoreVersion(groupId, versionNumber) {
    const version = this.getVersion(groupId, versionNumber);
    if (version) {
      return this.updateGroup(groupId, {
        generated: {
          ...version.content,
          currentVersion: versionNumber
        }
      });
    }
    return null;
  }

  /**
   * Elimina un grupo
   */
  deleteGroup(groupId) {
    const groups = this.getGroups();
    const filtered = groups.filter((g) => g.id !== groupId);
    this.saveGroups(filtered);
    return filtered;
  }

  /**
   * Agrega un nuevo grupo
   */
  addGroup(group) {
    const groups = this.getGroups();
    groups.push(group);
    this.saveGroups(groups);
    return groups;
  }

  /**
   * Limpia todos los datos (útil para desarrollo)
   */
  clearAll() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CREDENTIALS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PROMPTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.GROUPS);
    this.credentialsCache = null;
  }

  /**
   * Exporta todos los datos (backup)
   */
  exportData() {
    return {
      credentials: this.getCredentials(),
      prompts: this.getPrompts(),
      groups: this.getGroups(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Importa datos (restore)
   */
  importData(data) {
    if (data.credentials) this.saveCredentialsSync(data.credentials);
    if (data.prompts) this.savePrompts(data.prompts);
    if (data.groups) this.saveGroups(data.groups);
  }
}

export default new StorageService();
