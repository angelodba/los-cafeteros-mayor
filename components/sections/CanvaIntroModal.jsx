import { useState, useEffect } from 'react';
import { X, Play, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';

export default function CanvaIntroModal({ isOpen, onClose, canvaUrl }) {
  const defaultCanvaUrl =
    canvaUrl ||
    'https://www.canva.com/design/DAGEXyV7h3A/view?embed';

  const [inputUrl, setInputUrl] = useState(defaultCanvaUrl);
  const [activeEmbedUrl, setActiveEmbedUrl] = useState(defaultCanvaUrl);
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyUrl = (e) => {
    e.preventDefault();
    let finalUrl = inputUrl.trim();
    if (!finalUrl.includes('embed')) {
      if (finalUrl.includes('/view')) {
        finalUrl = finalUrl.replace('/view', '/view?embed');
      } else {
        finalUrl += '?embed';
      }
    }
    setActiveEmbedUrl(finalUrl);
    setIsEditingUrl(false);
  };

  return (
    <div className="canva-modal-overlay">
      <div className="canva-modal-container">
        <div className="canva-modal-header">
          <div className="canva-header-title">
            <Sparkles size={20} color="var(--verde-lima)" />
            <div>
              <h3>Presentación Interactiva — LOS CAFETEROS</h3>
              <span className="canva-header-sub">Diseñado dinámicamente en Canva</span>
            </div>
          </div>

          <div className="canva-header-actions">
            <button
              className="btn-canva-edit-url"
              onClick={() => setIsEditingUrl(!isEditingUrl)}
              title="Cambiar URL del diseño de Canva"
            >
              <RefreshCw size={14} /> <span>{isEditingUrl ? 'Cancelar' : 'Cambiar Link Canva'}</span>
            </button>
            <button className="canva-modal-close" onClick={onClose} aria-label="Cerrar presentación">
              <X size={18} />
            </button>
          </div>
        </div>

        {isEditingUrl && (
          <form className="canva-url-form" onSubmit={handleApplyUrl}>
            <label>Pega el enlace de tu diseño publicado de Canva (Ver / Embed):</label>
            <div className="url-input-group">
              <input
                type="text"
                placeholder="https://www.canva.com/design/.../view?embed"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Cargar Canva
              </button>
            </div>
          </form>
        )}

        <div className="canva-embed-wrapper">
          <iframe
            src={activeEmbedUrl}
            title="Presentación Interactiva LOS CAFETEROS"
            allowFullScreen
            allow="fullscreen"
            loading="lazy"
            className="canva-iframe"
          ></iframe>
        </div>

        <div className="canva-modal-footer">
          <span className="canva-footer-text">
            💡 Puedes interactuar con la presentación, cambiar de diapositiva o reproducir el video.
          </span>
          <button className="btn btn-primary" onClick={onClose}>
            <Play size={16} /> <span>Ir al Catálogo de Productos</span>
          </button>
        </div>
      </div>
    </div>
  );
}
