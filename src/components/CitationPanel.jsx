import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { extractMetadata, generateCitation, exportCitations } from '../utils/citationGenerator';
import './CitationPanel.css';

const CitationPanel = ({ currentProject, activeTab, isVisible, onClose }) => {
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCitation, setEditingCitation] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('APA');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: new Date().getFullYear(),
    publisher: '',
    url: ''
  });

  useEffect(() => {
    if (isVisible && currentProject) {
      loadCitations();
    }
  }, [isVisible, currentProject]);

  const loadCitations = async () => {
    if (!currentProject) return;
    
    setLoading(true);
    try {
      const allCitations = await window.electronAPI.database.getCitations(currentProject.id);
      setCitations(allCitations);
    } catch (error) {
      console.error('Error loading citations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromCurrentPage = () => {
    if (activeTab) {
      const metadata = extractMetadata(activeTab.url, activeTab.title);
      setFormData({
        title: metadata.title,
        author: '',
        year: metadata.year,
        publisher: metadata.domain,
        url: metadata.url
      });
      setShowCreateModal(true);
    }
  };

  const handleCreateCitation = async () => {
    if (!currentProject || !formData.title || !formData.url) return;
    
    try {
      const metadata = {
        ...formData,
        accessDate: new Date().toISOString().split('T')[0]
      };
      
      const citationText = generateCitation(metadata, selectedFormat, formData);
      
      await window.electronAPI.database.createCitation(
        currentProject.id,
        null,
        citationText,
        selectedFormat,
        JSON.stringify(metadata)
      );
      
      setFormData({ title: '', author: '', year: new Date().getFullYear(), publisher: '', url: '' });
      setShowCreateModal(false);
      loadCitations();
    } catch (error) {
      console.error('Error creating citation:', error);
    }
  };

  const handleEditCitation = async () => {
    if (!editingCitation) return;
    
    try {
      const metadata = JSON.parse(editingCitation.metadata);
      const updatedMetadata = { ...metadata, ...formData };
      const citationText = generateCitation(updatedMetadata, selectedFormat, formData);
      
      await window.electronAPI.database.updateCitation(
        editingCitation.id,
        citationText,
        selectedFormat,
        JSON.stringify(updatedMetadata)
      );
      
      setEditingCitation(null);
      setFormData({ title: '', author: '', year: new Date().getFullYear(), publisher: '', url: '' });
      setShowEditModal(false);
      loadCitations();
    } catch (error) {
      console.error('Error updating citation:', error);
    }
  };

  const openEditModal = (citation) => {
    const metadata = JSON.parse(citation.metadata);
    setEditingCitation(citation);
    setFormData({
      title: metadata.title || '',
      author: metadata.author || '',
      year: metadata.year || new Date().getFullYear(),
      publisher: metadata.publisher || '',
      url: metadata.url || ''
    });
    setSelectedFormat(citation.format);
    setShowEditModal(true);
  };

  const handleDeleteCitation = async (citationId) => {
    if (window.confirm('Are you sure you want to delete this citation?')) {
      try {
        await window.electronAPI.database.deleteCitation(citationId);
        loadCitations();
      } catch (error) {
        console.error('Error deleting citation:', error);
      }
    }
  };

  const handleCopyCitation = (citation) => {
    navigator.clipboard.writeText(citation.citation_text);
  };

  const handleExport = (format) => {
    const exported = exportCitations(citations, format);
    const blob = new Blob([exported], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citations.${format === 'bibtex' ? 'bib' : format === 'ris' ? 'ris' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerateCitation = async (citation, newFormat) => {
    try {
      const metadata = JSON.parse(citation.metadata);
      const newCitationText = generateCitation(metadata, newFormat);
      
      await window.electronAPI.database.updateCitation(
        citation.id,
        newCitationText,
        newFormat,
        citation.metadata
      );
      
      loadCitations();
    } catch (error) {
      console.error('Error regenerating citation:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="citation-panel">
      <div className="citation-panel-header">
        <h3>Citations</h3>
        <div className="header-actions">
          <button 
            className="action-btn"
            onClick={handleCreateFromCurrentPage}
            disabled={!activeTab}
            title="Cite current page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button className="action-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {citations.length > 0 && (
        <div className="citation-actions">
          <button className="export-btn" onClick={() => handleExport('text')}>
            Export as Text
          </button>
          <button className="export-btn" onClick={() => handleExport('bibtex')}>
            Export as BibTeX
          </button>
          <button className="export-btn" onClick={() => handleExport('ris')}>
            Export as RIS
          </button>
        </div>
      )}

      <div className="citation-content">
        {loading ? (
          <div className="citation-loading">
            <div className="loading-spinner"></div>
            <p>Loading citations...</p>
          </div>
        ) : citations.length === 0 ? (
          <div className="citation-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <h4>No citations yet</h4>
            <p>Click the + button to cite the current page or create a custom citation.</p>
          </div>
        ) : (
          <div className="citation-list">
            {citations.map(citation => (
              <div key={citation.id} className="citation-item">
                <div className="citation-format-badge">{citation.format}</div>
                <div className="citation-text">{citation.citation_text}</div>
                <div className="citation-actions-row">
                  <select
                    className="format-selector"
                    value={citation.format}
                    onChange={(e) => handleRegenerateCitation(citation, e.target.value)}
                  >
                    <option value="APA">APA</option>
                    <option value="MLA">MLA</option>
                    <option value="Chicago">Chicago</option>
                    <option value="IEEE">IEEE</option>
                  </select>
                  <button 
                    className="citation-action-btn"
                    onClick={() => handleCopyCitation(citation)}
                    title="Copy citation"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                  <button 
                    className="citation-action-btn"
                    onClick={() => openEditModal(citation)}
                    title="Edit citation"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button 
                    className="citation-action-btn delete-btn"
                    onClick={() => handleDeleteCitation(citation.id)}
                    title="Delete citation"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ title: '', author: '', year: new Date().getFullYear(), publisher: '', url: '' });
        }}
        title="Create Citation"
        size="medium"
      >
        <div className="citation-form">
          <div className="form-group">
            <label>Citation Format</label>
            <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}>
              <option value="APA">APA</option>
              <option value="MLA">MLA</option>
              <option value="Chicago">Chicago</option>
              <option value="IEEE">IEEE</option>
            </select>
          </div>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Article or page title"
            />
          </div>
          <div className="form-group">
            <label>Author(s)</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Last, F. M."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Publisher/Website</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="Website name"
              />
            </div>
          </div>
          <div className="form-group">
            <label>URL *</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="form-actions">
            <button 
              className="btn-secondary"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({ title: '', author: '', year: new Date().getFullYear(), publisher: '', url: '' });
              }}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={handleCreateCitation}
              disabled={!formData.title || !formData.url}
            >
              Create Citation
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCitation(null);
          setFormData({ title: '', author: '', year: new Date().getFullYear(), publisher: '', url: '' });
        }}
        title="Edit Citation"
        size="medium"
      >
        <div className="citation-form">
          <div className="form-group">
            <label>Citation Format</label>
            <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}>
              <option value="APA">APA</option>
              <option value="MLA">MLA</option>
              <option value="Chicago">Chicago</option>
              <option value="IEEE">IEEE</option>
            </select>
          </div>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Author(s)</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Publisher/Website</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>URL *</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button 
              className="btn-secondary"
              onClick={() => {
                setShowEditModal(false);
                setEditingCitation(null);
                setFormData({ title: '', author: '', year: new Date().getFullYear(), publisher: '', url: '' });
              }}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={handleEditCitation}
              disabled={!formData.title || !formData.url}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CitationPanel;
