import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { validateKeywordGroupStructure } from '../../utils/validation';
import { DocumentArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const KeywordImporter = () => {
  const { importGroups, groups } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [importedFile, setImportedFile] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const handleFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);

        if (!Array.isArray(json)) {
          throw new Error('El archivo debe contener un array de grupos');
        }

        if (!validateKeywordGroupStructure(json)) {
          throw new Error('Estructura de JSON inválida');
        }

        const totalGroups = json.length;
        const totalKeywords = json.reduce((sum, g) => sum + (g.children?.length || 0), 0);
        const totalVolume = json.reduce(
          (sum, g) =>
            sum + (g.children?.reduce((s, c) => s + (c.volume || 0), 0) || 0),
          0
        );

        setStats({ totalGroups, totalKeywords, totalVolume });
        setImportedFile({ name: file.name, data: json });
        setError(null);
      } catch (err) {
        setError(err.message);
        setImportedFile(null);
        setStats(null);
      }
    };

    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      handleFile(file);
    } else {
      setError('Solo se permiten archivos JSON');
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleImport = (mode = 'replace') => {
    if (!importedFile) return;

    importGroups(importedFile.data, mode);
    alert(`Grupos importados exitosamente (${mode === 'replace' ? 'reemplazado' : 'fusionado'})`);
    setImportedFile(null);
    setStats(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📂 Importar Keywords</h2>
        <p className="text-gray-600">
          Carga un archivo JSON con la estructura de grupos de keywords
        </p>
      </div>

      {/* Zona de Drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-colors
          ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <DocumentArrowUpIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Arrastra tu archivo JSON aquí
        </p>
        <p className="text-sm text-gray-500 mb-4">o</p>
        <label className="inline-block">
          <input
            type="file"
            accept=".json"
            onChange={handleFileInput}
            className="hidden"
          />
          <Button variant="primary">📁 Seleccionar archivo</Button>
        </label>
        <p className="text-xs text-gray-500 mt-4">Formatos aceptados: .json</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <p className="text-error-700 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Archivo Importado */}
      {importedFile && stats && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-6">
          <div className="flex items-start">
            <CheckCircleIcon className="w-6 h-6 text-success-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-success-900 mb-2">
                ✅ {importedFile.name} cargado correctamente
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-success-700">Grupos:</span>{' '}
                  <span className="font-medium text-success-900">{stats.totalGroups}</span>
                </div>
                <div>
                  <span className="text-success-700">Keywords:</span>{' '}
                  <span className="font-medium text-success-900">{stats.totalKeywords}</span>
                </div>
                <div>
                  <span className="text-success-700">Volumen Total:</span>{' '}
                  <span className="font-medium text-success-900">{stats.totalVolume}</span>
                </div>
              </div>

              <div className="mt-4 space-x-3">
                <Button variant="primary" onClick={() => handleImport('replace')}>
                  Importar (Reemplazar)
                </Button>
                {groups.length > 0 && (
                  <Button variant="outline" onClick={() => handleImport('merge')}>
                    Importar (Fusionar)
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info sobre grupos existentes */}
      {groups.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-primary-700">
            💡 <span className="font-medium">Tienes {groups.length} grupos</span> actualmente
            cargados. Al importar puedes:
          </p>
          <ul className="mt-2 text-sm text-primary-600 list-disc list-inside">
            <li>
              <strong>Reemplazar:</strong> Elimina todos los grupos actuales y carga los nuevos
            </li>
            <li>
              <strong>Fusionar:</strong> Agrega los nuevos grupos sin eliminar los existentes
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default KeywordImporter;
