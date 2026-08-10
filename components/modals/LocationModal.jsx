import { useEffect } from 'react';
import { MapPin, Building2, Truck, Check, ExternalLink, X } from 'lucide-react';

export default function LocationModal({ isOpen, onClose }) {
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

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="modal-header">
          <div className="modal-icon-badge">
            <MapPin size={22} />
          </div>
          <div>
            <h3>Ubicación y Cobertura de Despacho</h3>
            <p>Feria de Hortalizas LOS CAFETEROS — Caracas, Venezuela</p>
          </div>
        </div>
        <div className="modal-body">
          <div className="location-details-grid">
            <div className="location-info-card">
              <h4><Building2 size={16} /> Punto Principal de Venta</h4>
              <p><strong>Dirección:</strong> Av. Principal de La Urbina, en el estacionamiento de la parroquia Corpus Christi, Caracas.</p>
              <p><strong>Horarios:</strong> Lunes, Martes y Miércoles de 6:00 AM a 7:30 PM.</p>
              <p><strong>Teléfono:</strong> +58 (424) 708-7749</p>
            </div>
            <div className="location-info-card">
              <h4><Truck size={16} /> Zonas de Despacho en Caracas</h4>
              <ul className="zones-list">
                <li><Check size={14} /> Municipio Chacao (Las Mercedes, Altamira, El Bosque, La Castellana)</li>
                <li><Check size={14} /> Municipio Baruta (Colinas de Bello Monte, Valle Arriba, Santa Fe)</li>
                <li><Check size={14} /> Municipio El Hatillo (La Lagunita, Los Naranjos)</li>
                <li><Check size={14} /> Municipio Libertador (El Recreo, Montalbán, Paraíso, Centro)</li>
                <li><Check size={14} /> Municipio Sucre (Los Dos Caminos, Sebucán, La Urbina)</li>
              </ul>
            </div>
          </div>
          <div className="map-container-frame">
            <iframe
              id="google-maps-iframe"
              src="https://maps.google.com/maps?q=Feria+de+Hortalizas+LOS+CAFETEROS+Caracas&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="260"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        <div className="modal-footer">
          <a
            href="https://maps.app.goo.gl/JGqm7WzSMJofa2Ah6"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <ExternalLink size={16} /> Abrir en Google Maps
          </a>
          <button className="btn btn-primary" onClick={onClose}>Entendido</button>
        </div>
      </div>
    </div>
  );
}
