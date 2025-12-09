import { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storageService';
import { STATUS } from '../utils/constants';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [credentials, setCredentials] = useState(null);
  const [prompts, setPrompts] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('🔄 [AppContext] Cargando datos...');
    setIsLoading(true);
    try {
      // Cargar credenciales desde archivo (async) o localStorage (fallback)
      const creds = await storageService.loadCredentials();
      const prpts = storageService.getPrompts();
      const grps = storageService.getGroups();

      console.log('📦 [AppContext] Credenciales cargadas:', {
        hasGoogle: !!creds?.google,
        googleKey: creds?.google?.apiKey ? `${creds.google.apiKey.substring(0, 8)}...` : 'NO KEY',
        selectedModel: creds?.selectedAIModel
      });

      setCredentials(creds);
      setPrompts(prpts);
      setGroups(grps);
    } catch (error) {
      console.error('❌ [AppContext] Error cargando datos:', error);
      // Usar valores por defecto en caso de error
      setCredentials(storageService.getDefaultCredentials());
      setPrompts(storageService.getPrompts());
      setGroups([]);
    } finally {
      setIsLoading(false);
      console.log('✅ [AppContext] Datos cargados');
    }
  };

  // Guardar credenciales
  const saveCredentials = async (newCredentials) => {
    console.log('💾 [AppContext] Guardando credenciales:', {
      hasGoogle: !!newCredentials?.google,
      googleKey: newCredentials?.google?.apiKey ? `${newCredentials.google.apiKey.substring(0, 8)}...` : 'NO KEY'
    });
    await storageService.saveCredentials(newCredentials);
    setCredentials(newCredentials);
    console.log('✅ [AppContext] Credenciales guardadas y estado actualizado');
  };

  // Guardar prompts
  const savePrompts = (newPrompts) => {
    storageService.savePrompts(newPrompts);
    setPrompts(newPrompts);
  };

  // Guardar grupos
  const saveGroups = (newGroups) => {
    storageService.saveGroups(newGroups);
    setGroups(newGroups);
  };

  // Actualizar un grupo específico
  const updateGroup = (groupId, updates) => {
    const updated = storageService.updateGroup(groupId, updates);
    if (updated) {
      setGroups(storageService.getGroups());
      if (selectedGroup && selectedGroup.id === groupId) {
        setSelectedGroup(updated);
      }
    }
    return updated;
  };

  // Agregar versión a un grupo
  const addVersion = (groupId, content) => {
    const updated = storageService.addVersion(groupId, content);
    if (updated) {
      setGroups(storageService.getGroups());
      if (selectedGroup && selectedGroup.id === groupId) {
        setSelectedGroup(updated);
      }
    }
    return updated;
  };

  // Agregar nuevo grupo
  const addGroup = (group) => {
    const newGroups = storageService.addGroup(group);
    setGroups(newGroups);
    return newGroups;
  };

  // Eliminar grupo
  const deleteGroup = (groupId) => {
    const newGroups = storageService.deleteGroup(groupId);
    setGroups(newGroups);
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(null);
    }
    return newGroups;
  };

  // Importar grupos desde JSON
  const importGroups = (newGroups, mode = 'replace') => {
    let finalGroups;

    if (mode === 'replace') {
      finalGroups = newGroups;
    } else if (mode === 'merge') {
      const existingIds = groups.map((g) => g.id);
      const filtered = newGroups.filter((g) => !existingIds.includes(g.id));
      finalGroups = [...groups, ...filtered];
    }

    storageService.saveGroups(finalGroups);
    setGroups(finalGroups);
    return finalGroups;
  };

  // Actualizar status de un grupo
  const updateGroupStatus = (groupId, status) => {
    return updateGroup(groupId, {
      generated: {
        ...(groups.find((g) => g.id === groupId)?.generated || {}),
        status
      }
    });
  };

  // Obtener estadísticas
  const getStats = () => {
    // Función recursiva para contar keywords y volumen
    const countRecursive = (items) => {
      let keywordCount = 0;
      let totalVolume = 0;

      items.forEach((item) => {
        if (item.isGroup) {
          // Es un subgrupo, contar recursivamente
          const subStats = countRecursive(item.children || []);
          keywordCount += subStats.keywordCount;
          totalVolume += subStats.totalVolume;
        } else {
          // Es un keyword individual
          keywordCount++;
          totalVolume += item.volume || 0;
        }
      });

      return { keywordCount, totalVolume };
    };

    const totalGroups = groups.length;
    let totalKeywords = 0;
    let totalVolume = 0;

    groups.forEach((group) => {
      const stats = countRecursive(group.children || []);
      totalKeywords += stats.keywordCount;
      totalVolume += stats.totalVolume;
    });

    const byStatus = {
      [STATUS.NOT_GENERATED]: groups.filter(
        (g) => !g.generated || g.generated.status === STATUS.NOT_GENERATED
      ).length,
      [STATUS.GENERATING]: groups.filter(
        (g) => g.generated?.status === STATUS.GENERATING
      ).length,
      [STATUS.GENERATED]: groups.filter(
        (g) => g.generated?.status === STATUS.GENERATED
      ).length,
      [STATUS.IN_SHOPIFY]: groups.filter(
        (g) => g.generated?.status === STATUS.IN_SHOPIFY
      ).length,
      [STATUS.ERROR]: groups.filter(
        (g) => g.generated?.status === STATUS.ERROR
      ).length
    };

    const byType = {
      product: groups.filter((g) => g.type === 'product').length,
      collection: groups.filter((g) => g.type === 'collection').length,
      untagged: groups.filter((g) => !g.type).length
    };

    return {
      totalGroups,
      totalKeywords,
      totalVolume,
      byStatus,
      byType
    };
  };

  const value = {
    // State
    credentials,
    prompts,
    groups,
    selectedGroup,
    isLoading,

    // Actions
    saveCredentials,
    savePrompts,
    saveGroups,
    updateGroup,
    addVersion,
    addGroup,
    deleteGroup,
    importGroups,
    updateGroupStatus,
    setSelectedGroup,
    loadData,

    // Utils
    getStats
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
