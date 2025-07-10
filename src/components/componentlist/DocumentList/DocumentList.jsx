import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTrashAlt, FaUpload, FaFileAlt, FaDownload, FaInfoCircle } from 'react-icons/fa';
import './DocumentList.css';

const DocumentList = ({
  documents,
  onChange,
  mode = 'edit', // 'edit', 'view', 'list'
  containerHeight = '400px',
  labels = {
    upload: 'Subir documentos',
    eliminar: 'Eliminar',
    nombrePlaceholder: 'Nombre del documento',
  },
  onSelect,
  onPreview,
  tiposDocumento = [],
  documentosInmueble = [],
  documentosPropietario = [],
  onChangeInmueble,
  onChangePropietario,
  allowedFileTypes = null, // optional array of allowed file extensions (e.g. ['pdf', 'doc', 'docx'])
  toastRef = null, // optional ref to toast container for showing error messages
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('inmueble'); // 'inmueble' | 'propietario'
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const itemsRef = useRef([]);

    // Determinar si estamos en el modo especial
  const isDocumentosConTipos = mode === 'documentos-con-tipos';
  
    // Documentos activos según la pestaña seleccionada
  const activeDocuments = isDocumentosConTipos 
    ? (activeTab === 'inmueble' ? documentosInmueble : documentosPropietario)
    : documents;

  const activeOnChange = isDocumentosConTipos
    ? (activeTab === 'inmueble' ? onChangeInmueble : onChangePropietario)
    : onChange;

  // Filtrar tipos de documento por pestaña activa
  const filteredTiposDocumento = tiposDocumento.filter(tipo => 
    activeTab === 'inmueble' ? tipo.aplicaInmueble : tipo.aplicaPropietario
  );
  
  const handleRemove = (index) => {
    const newDocuments = activeDocuments.filter((_, i) => i !== index);
    activeOnChange(newDocuments);
    
    // Ajustar índices seleccionados
    if (selectedIndex === index) {
      setSelectedIndex(null);
    } else if (selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    }
    
    // Mover foco si es necesario
    if (focusedIndex === index) {
      const newFocusedIndex = Math.min(index, activeDocuments.length - 2);
      setFocusedIndex(newFocusedIndex >= 0 ? newFocusedIndex : null);
      setTimeout(() => {
        if (itemsRef.current[newFocusedIndex]) {
          itemsRef.current[newFocusedIndex].focus();
        }
      }, 0);
    }
  };  

  const handleNameChange = (index, nombre) => {
    const newDocuments = activeDocuments.map((doc, i) =>
      i === index ? { ...doc, nombre } : doc
    );
    activeOnChange(newDocuments);
  };
  const handleTipoChange = (index, tipoId) => {
    const newDocuments = activeDocuments.map((doc, i) =>
      i === index ? { ...doc, tipoId } : doc
    );
    activeOnChange(newDocuments);
  };

  const onFilesAdded = (files) => {
    const filesArray = Array.from(files);
    let validFiles = [];
    let invalidFiles = [];

    if (allowedFileTypes && allowedFileTypes.length > 0) {
      filesArray.forEach(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        if (allowedFileTypes.includes(ext)) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file.name);
        }
      });
    } else {
      validFiles = filesArray;
    }

    if (invalidFiles.length > 0 && toastRef && toastRef.current) {
      toastRef.current.addToast(
        `Archivos no permitidos: ${invalidFiles.join(', ')}. Solo se permiten: ${allowedFileTypes.join(', ')}`,
        'error',
        5000
      );
    }

    if (validFiles.length === 0) {
      return;
    }

    const newFiles = validFiles.map(file => ({
      file,
      nombre: file.name,
      tipoId: filteredTiposDocumento.length === 1 ? filteredTiposDocumento[0].id : null,
    }));

    activeOnChange([...activeDocuments, ...newFiles]);

    // Enfocar el último elemento añadido
    setTimeout(() => {
      const newIndex = activeDocuments.length + newFiles.length - 1;
      if (itemsRef.current[newIndex]) {
        itemsRef.current[newIndex].focus();
        setFocusedIndex(newIndex);
      }
    }, 0);
  };

  const handleFileInputChange = (e) => {
    onFilesAdded(e.target.files);
    e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleSelect = (index) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    
    setSelectedIndex(index);
    setFocusedIndex(index);
    if (onSelect) {
      onSelect(index, documents[index]);
    }
  };

  const handleKeyDown = (e, index) => {
    if (!activeDocuments || !activeDocuments.length) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          const newIndex = index - 1;
          setFocusedIndex(newIndex);
          itemsRef.current[newIndex]?.focus();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (index < activeDocuments.length - 1) {
          const newIndex = index + 1;
          setFocusedIndex(newIndex);
          itemsRef.current[newIndex]?.focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        itemsRef.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(activeDocuments.length - 1);
        itemsRef.current[activeDocuments.length - 1]?.focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleSelect(index);
        break;
      case 'Delete':
        if (mode === 'edit') {
          e.preventDefault();
          handleRemove(index);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setSelectedIndex(null);
    setFocusedIndex(null);
  }, [documents]);

  const renderPreview = () => {
    if (selectedIndex === null || !activeDocuments[selectedIndex]) {
      return <div className="document-preview-empty">Seleccione un documento para previsualizar</div>;
    }

    const doc = activeDocuments[selectedIndex];
    let file = doc.file;

    if (onPreview) {
      onPreview(selectedIndex, doc);
    }

    // If no file but preview exists, create a dummy file object with inferred type
    if (!file && doc.preview) {
      // Infer file type from preview URL extension or doc.nombre extension
      const inferFileType = () => {
        const url = doc.preview || '';
        const name = doc.nombre || '';
        const ext = (url.split('.').pop() || name.split('.').pop() || '').toLowerCase();
        switch (ext) {
          case 'pdf':
            return 'application/pdf';
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
          case 'bmp':
          case 'webp':
            return 'image/' + ext;
          case 'doc':
          case 'docx':
            return 'application/msword';
          case 'xls':
          case 'xlsx':
            return 'application/vnd.ms-excel';
          case 'txt':
            return 'text/plain';
          default:
            return 'application/octet-stream';
        }
      };
      file = { type: inferFileType() };
    }

    if (!file) {
      return (
        <div className="document-preview-other" style={{ height: '100%' }}>
          <FaFileAlt size={64} />
          <p>{doc.nombre || doc.nombre_archivo}</p>
        </div>
      );
    }

    if (doc.preview) {
      return renderPreviewContent(doc.preview, doc, file);
    }

    if (!previewUrlRef.current && file instanceof File) {
      previewUrlRef.current = URL.createObjectURL(file);
    }

    return renderPreviewContent(previewUrlRef.current, doc, file);
  };

  const renderDocumentItem = (doc, index) => {
    const isSelected = selectedIndex === index;
    const isFocused = focusedIndex === index;
    
    return (
      <div
        key={index}
        className={`document-item ${isSelected ? 'selected' : ''}`}
        role="option"
        aria-selected={isSelected}
        tabIndex={isFocused ? 0 : -1}
        ref={el => itemsRef.current[index] = el}
        onClick={() => handleSelect(index)}
        onKeyDown={(e) => handleKeyDown(e, index)}
        onFocus={() => setFocusedIndex(index)}
        title={doc.file ? doc.file.name : doc.nombre_archivo}
      >
        {isDocumentosConTipos && (
          <select
            value={doc.tipoId || ''}
            onChange={(e) => handleTipoChange(index, e.target.value ? parseInt(e.target.value) : null)}
            onClick={(e) => e.stopPropagation()}
            className="document-type-select"
          >
            <option value="">Seleccionar tipo...</option>
            {filteredTiposDocumento.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre} {tipo.requerido ? '*' : ''}
              </option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder={labels.nombrePlaceholder}
          value={doc.nombre || ''}
          onChange={(e) => handleNameChange(index, e.target.value)}
          aria-label={`Nombre del documento ${index + 1}`}
          onClick={(e) => e.stopPropagation()}
          className="document-name-input"
        />

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
          aria-label={`${labels.eliminar} documento ${index + 1}`}
          className="remove-button"
        >
          <FaTrashAlt />
        </button>

        {isDocumentosConTipos && doc.tipoId && (
          <span className="required-badge">
            {filteredTiposDocumento.find(t => t.id === doc.tipoId)?.requerido && (
              <FaInfoCircle title="Documento requerido" />
            )}
          </span>
        )}
      </div>
    );
  };

  const renderTabs = () => (
    <div className="document-tabs">
      <button
        type="button"
        className={activeTab === 'inmueble' ? 'active' : ''}
        onClick={() => setActiveTab('inmueble')}
      >
        📄 Inmueble
      </button>
      <button
        type="button"
        className={activeTab === 'propietario' ? 'active' : ''}
        onClick={() => setActiveTab('propietario')}
      >
        👤 Propietario
      </button>
    </div>
  );


  const renderPreviewContent = (url, doc, file) => {
    if (file.type === 'application/pdf') {
      return (
        <iframe
          src={url}
          title={doc.nombre || file.name || 'Documento PDF'}
          className="document-preview-iframe"
          style={{ height: '100%' }}
          aria-label={`Vista previa de ${doc.nombre || file.name || 'documento PDF'}`}
        />
      );
    }

    if (file.type.startsWith('image/')) {
      return (
        <div className="document-preview-other" style={{ height: '100%' }}>
          <img
            src={url}
            alt={doc.nombre || file.name || 'Imagen'}
            className="document-preview-image"
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          />
        </div>
      );
    }

    return (
      <div className="document-preview-other" style={{ height: '100%' }}>
        <FaFileAlt size={64} />
        <p>{doc.nombre || file.name || 'Documento'}</p>
        <a
          href={url}
          download={doc.nombre || file.name}
          className="document-download-button"
          aria-label={`Descargar ${doc.nombre || file.name || 'documento'}`}
        >
          <FaDownload /> Descargar
        </a>
      </div>
    );
  };

  if (mode === 'list') {
    return (
      <div 
        className="document-list-listmode" 
        role="listbox" 
        aria-multiselectable="false"
        style={{ maxHeight: containerHeight, minHeight: containerHeight, width: '100%' }}
      >
        {documents.map((doc, index) => {
          const file = doc.file;
          const url = file ? (doc.preview || URL.createObjectURL(file)) : '#';
          return (
            <div
              key={index}
              className={`document-item-display ${selectedIndex === index ? 'selected' : ''}`}
              role="option"
              aria-selected={selectedIndex === index}
              tabIndex={focusedIndex === index ? 0 : -1}
              ref={el => itemsRef.current[index] = el}
              onClick={() => handleSelect(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
              title={doc.nombre || doc.nombre_archivo || (file && file.name)}
            >
              <a 
                href={url} 
                download={doc.nombre || (file && file.name)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="document-name-link"
                aria-label={`Descargar ${doc.nombre || (file && file.name) || 'documento'}`}
              >
                {doc.nombre || doc.nombre_archivo || (file && file.name)}
                <FaDownload className="document-download-icon" />
              </a>
            </div>
          );
        })}
      </div>
    );
  }

  if (mode === 'view') {
    return (
      <div 
        className="document-list-display" 
        style={{ 
          maxHeight: containerHeight, 
          minHeight: containerHeight, 
          height: containerHeight, 
          display: 'flex',
          width: '100%'
        }}
      >
        <div 
          className="document-list" 
          role="listbox"
          aria-multiselectable="false"
          style={{ 
            maxHeight: containerHeight, 
            minHeight: containerHeight, 
            height: containerHeight, 
            overflowY: 'auto' 
          }}
        >
          {documents.map((doc, index) => (
            <div
              key={index}
              className={`document-item-display ${selectedIndex === index ? 'selected' : ''}`}
              role="option"
              aria-selected={selectedIndex === index}
              tabIndex={focusedIndex === index ? 0 : -1}
              ref={el => itemsRef.current[index] = el}
              onClick={() => handleSelect(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
              title={doc.nombre || doc.nombre_archivo || (doc.file && doc.file.name)}
            >
              <span className="document-name">
                {doc.nombre || doc.nombre_archivo || (doc.file && doc.file.name)}
              </span>
              <a
                href={doc.file ? (doc.preview || URL.createObjectURL(doc.file)) : '#'}
                download={doc.nombre || (doc.file && doc.file.name)}
                onClick={(e) => e.stopPropagation()}
                className="document-download-button"
                aria-label={`Descargar ${doc.nombre || (doc.file && doc.file.name) || 'documento'}`}
              >
                <FaDownload />
              </a>
            </div>
          ))}
        </div>
        <div 
          className="document-preview-container" 
          style={{ 
            maxHeight: containerHeight, 
            minHeight: containerHeight, 
            height: containerHeight, 
            flexShrink: 0, 
            flexGrow: 1 
          }}
        >
          {renderPreview()}
        </div>
      </div>
    );
  }

  return (
    <>
      {mode === 'documentos-con-tipos' ? (
      <div className={`document-list-container ${dragOver ? 'drag-over' : ''}`} style={{ width: '100%', display: 'block' }}>
          {renderTabs()}
          <div 
            className="document-list-edit-container"
            style={{ 
              maxHeight: containerHeight, 
              minHeight: containerHeight, 
              height: containerHeight 
            }}
          >
            <div
              className="document-list"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="listbox"
              aria-multiselectable="false"
            >
              {activeDocuments.map((doc, index) => renderDocumentItem(doc, index))}
              <div 
                className="document-upload-area" 
                onClick={() => fileInputRef.current?.click()}
                tabIndex={0}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                aria-label={labels.upload}
              >
                <FaUpload size={32} />
                <span>{labels.upload}</span>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                />
              </div>
            </div>
            <div className="document-preview-container">
              {renderPreview()}
            </div>
          </div>
        </div>
      ) : (
        <div 
          className={`document-list-edit-container ${dragOver ? 'drag-over' : ''}`} 
          style={{ 
            maxHeight: containerHeight, 
            minHeight: containerHeight, 
            height: containerHeight, 
            display: 'flex',
            width: '100%'
          }}
        >
          <div
            className="document-list"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="listbox"
            aria-multiselectable="false"
            style={{ 
              maxHeight: containerHeight, 
              minHeight: containerHeight, 
              height: containerHeight, 
              overflowY: 'auto' 
            }}
          >
            {documents.map((doc, index) => (
              <div
                key={index}
                className={`document-item ${selectedIndex === index ? 'selected' : ''}`}
                role="option"
                aria-selected={selectedIndex === index}
                tabIndex={focusedIndex === index ? 0 : -1}
                ref={el => itemsRef.current[index] = el}
                onClick={() => handleSelect(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setFocusedIndex(index)}
                title={doc.file ? doc.file.name : doc.nombre_archivo}
              >
                <span className="document-filename">
                  {doc.file ? doc.file.name : doc.nombre_archivo}
                </span>
                <input
                  type="text"
                  placeholder={labels.nombrePlaceholder}
                  value={doc.nombre || ''}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  aria-label={`Nombre del documento ${index + 1}`}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                  aria-label={`${labels.eliminar} documento ${index + 1}`}
                  className="remove-button"
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))}
            <div
              className="document-upload-area"
              onClick={() => fileInputRef.current?.click()}
              tabIndex={0}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              aria-label={labels.upload}
            >
              <FaUpload size={32} />
              <span>{labels.upload}</span>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
            </div>
          </div>
          <div 
            className="document-preview-container" 
            style={{ 
              maxHeight: containerHeight, 
              minHeight: containerHeight, 
              height: containerHeight, 
              flexShrink: 0, 
              flexGrow: 1 
            }}
          >
            {renderPreview()}
          </div>
        </div>
      )}
    </>
  );
};

DocumentList.propTypes = {
  // Props originales (requeridas para modos antiguos)
  documents: (props, propName, componentName) => {
    if (props.mode !== 'documentos-con-tipos' && !props[propName]) {
      return new Error(`Prop '${propName}' is required in mode '${props.mode}'`);
    }
  },
  onChange: (props, propName, componentName) => {
    if (props.mode !== 'documentos-con-tipos' && !props[propName]) {
      return new Error(`Prop '${propName}' is required in mode '${props.mode}'`);
    }
  },
  
  // Nuevas props (opcionales excepto en modo documentos-con-tipos)
  tiposDocumento: (props, propName, componentName) => {
    if (props.mode === 'documentos-con-tipos' && !props[propName]) {
      return new Error(`Prop '${propName}' is required in mode 'documentos-con-tipos'`);
    }
  },
  documentosInmueble: PropTypes.array,
  documentosPropietario: PropTypes.array,
  onChangeInmueble: PropTypes.func,
  onChangePropietario: PropTypes.func,
  
  // Props comunes
  mode: PropTypes.oneOf(['edit', 'view', 'list', 'documentos-con-tipos']),
  labels: PropTypes.shape({
    upload: PropTypes.string,
    eliminar: PropTypes.string,
    nombrePlaceholder: PropTypes.string,
  }),
  onSelect: PropTypes.func,
  onPreview: PropTypes.func,
};

export default DocumentList;