import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix del icono de marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Centra el mapa cuando cambian las coordenadas
function RecenterMap({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);
    return null;
}

// Escucha clicks en el mapa
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

const MapaUbicacion = ({ direccion, onUbicacionChange, latInicial, lngInicial, triggerBuscar }) => {
    const [position, setPosition] = useState(
        latInicial && lngInicial ? [latInicial, lngInicial] : [-12.0464, -77.0428]
    );
    const [buscando, setBuscando] = useState(false);

    // Buscar dirección (función reutilizable)
    const buscarDireccion = async () => {
        if (!direccion || direccion.trim() === "") return;
        setBuscando(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&limit=1`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const lat = Number.parseFloat(data[0].lat);
                const lng = Number.parseFloat(data[0].lon);
                setPosition([lat, lng]);
                onUbicacionChange({ lat, lng, direccionFormateada: data[0].display_name });
            } else {
                alert("No se encontró la dirección. Intenta con otra.");
            }
        } catch (error) {
            console.error("Error buscando dirección:", error);
            alert("Error al buscar la dirección.");
        } finally {
            setBuscando(false);
        }
    };

    // Se dispara cuando el padre incrementa triggerBuscar (botón check verde)
    useEffect(() => {
        if (triggerBuscar && triggerBuscar > 0) {
            buscarDireccion();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerBuscar]);

    // Click en el mapa: geocoding inverso
    const handleMapClick = async (lat, lng) => {
        setPosition([lat, lng]);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            const direccionFormateada = data.display_name || `${lat}, ${lng}`;
            onUbicacionChange({ lat, lng, direccionFormateada });
        } catch (error) {
            console.error("Error en geocoding inverso:", error);
            onUbicacionChange({ lat, lng, direccionFormateada: `${lat}, ${lng}` });
        }
    };

    return (
        <div>
            <button
                type="button"
                className="btn btn-sm btn-outline-primary mb-2 w-100"
                onClick={buscarDireccion}
                disabled={buscando || !direccion}
            >
                {buscando ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Buscando...
                    </>
                ) : (
                    <>
                        <i className="bi bi-search me-2"></i>
                        Buscar en el mapa
                    </>
                )}
            </button>

            <div style={{ height: "250px", borderRadius: "8px", overflow: "hidden" }}>
                <MapContainer
                    center={position}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <Marker position={position} />
                    <RecenterMap position={position} />
                    <MapClickHandler onMapClick={handleMapClick} />
                </MapContainer>
            </div>

            <small className="text-muted d-block mt-1">
                <i className="bi bi-info-circle me-1"></i>
                Click en el mapa para seleccionar la ubicación exacta
            </small>
        </div>
    );
};

export default MapaUbicacion;