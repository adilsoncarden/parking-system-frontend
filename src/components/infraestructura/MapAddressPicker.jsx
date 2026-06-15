import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Pin hecho con un icono de Bootstrap (evita el problema clásico del marcador
// roto de Leaflet con bundlers, y no requiere imágenes externas).
const PIN_ICON = L.divIcon({
    className: "map-pin",
    html: '<i class="bi bi-geo-alt-fill"></i>',
    iconSize: [30, 30],
    iconAnchor: [15, 28],
});

const DEFAULT_CENTER = [-12.0464, -77.0428]; // Lima, Perú

// Construye una dirección CORTA (calle + número, distrito, ciudad) a partir de los
// componentes de Nominatim, en vez del display_name largo con código postal y país.
// El profe pidió una dirección menos acertada y afinar con los clics del mapa.
const shortAddress = (a, fallback = "") => {
    if (!a) return fallback;
    const calle = [a.road, a.house_number].filter(Boolean).join(" ");
    const distrito = a.suburb || a.neighbourhood || a.quarter || a.city_district;
    const ciudad = a.city || a.town || a.village || a.county;
    const parts = [calle, distrito, ciudad].filter(Boolean);
    return parts.length ? parts.join(", ") : fallback;
};

const reverseGeocode = async (lat, lng) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`,
            { headers: { "Accept-Language": "es" } },
        );
        const data = await res.json();
        return shortAddress(data?.address, data?.display_name || "");
    } catch {
        return "";
    }
};

const ClickHandler = ({ onPick }) => {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const Recenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, 16);
    }, [center, map]);
    // Corrige el tamaño del mapa cuando se abre dentro de un modal.
    useEffect(() => {
        const t = setTimeout(() => map.invalidateSize(), 200);
        return () => clearTimeout(t);
    }, [map]);
    return null;
};

const MapAddressPicker = ({ onChange, disabled }) => {
    const [pos, setPos] = useState(null);
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);

    const pick = async (lat, lng) => {
        setPos([lat, lng]);
        const addr = await reverseGeocode(lat, lng);
        if (addr) onChange(addr, { lat, lng });
    };

    const search = async () => {
        if (!query.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`,
                { headers: { "Accept-Language": "es" } },
            );
            const data = await res.json();
            if (data?.[0]) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                setPos([lat, lng]);
                onChange(shortAddress(data[0].address, data[0].display_name), { lat, lng });
            }
        } catch {
            /* ignore */
        } finally {
            setSearching(false);
        }
    };

    return (
        <div>
            <div className="input-group input-group-sm mb-2">
                <span className="input-group-text">
                    <i className="bi bi-search" />
                </span>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar dirección en el mapa..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            search();
                        }
                    }}
                    disabled={disabled}
                />
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={search}
                    disabled={disabled || searching}
                >
                    {searching ? <span className="spinner-border spinner-border-sm" /> : "Buscar"}
                </button>
            </div>

            <div className="map-picker">
                <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: "230px", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <ClickHandler onPick={pick} />
                    {pos && <Marker position={pos} icon={PIN_ICON} />}
                    <Recenter center={pos} />
                </MapContainer>
            </div>
            <small className="text-muted">
                <i className="bi bi-info-circle me-1" />
                Busca o haz clic en el mapa para fijar la dirección exacta.
            </small>
        </div>
    );
};

export default MapAddressPicker;
