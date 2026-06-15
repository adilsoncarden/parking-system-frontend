import { useState, useMemo } from "react";
import { useParking } from "../context/ParkingContext";
import CameraPanel from "./CameraPanel";

const PUERTAS = ["Entrada Principal", "Entrada Secundaria"];

export default function VehicleEntry() {
  const [plate, setPlate] = useState("");
  const [puerta, setPuerta] = useState(PUERTAS[0]);
  const [showModal, setShowModal] = useState(false);

  const { vehicles, accessLog, grantAccess, registerExit, getFirstAvailableSpace } = useParking();

  const plateU = plate.trim().toUpperCase();

  // Ficha del vehículo: se busca en los vehículos ya cargados (sin llamadas extra a la API).
  const ficha = useMemo(
    () => (plateU ? vehicles.find((v) => v.placa === plateU) || null : null),
    [vehicles, plateU],
  );
  const noRegistrada = !!plateU && !ficha;

  // ¿Ya está adentro? (estancia activa = sin hora de salida)
  const estanciaActiva = useMemo(
    () => accessLog.find((l) => l.placa === plateU && !l.horaSalida),
    [accessLog, plateU],
  );
  const yaAdentro = !!estanciaActiva;

  const esResidente = ficha ? ficha.tipoOcupanteRaw !== "VISITANTE" : false;

  const previewSpace = useMemo(() => {
    const space = getFirstAvailableSpace();
    return space?.code || space?.id || null;
  }, [getFirstAvailableSpace, ficha]);

  const handleGrantAccess = () => {
    grantAccess(plate, `Puerta: ${puerta}`);
    setShowModal(false);
  };

  return (
    <section className="flex-1 flex flex-col gap-6">
      {/* Cámara + selección de puerta */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-900">videocam</span>
            Control de Acceso
          </h3>
          <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Activo
          </span>
        </div>

        {/* Cámara grande de lectura de placas */}
        <CameraPanel onDetected={(p) => setPlate(p.toUpperCase())} />

        {/* Selector de puerta (2 entradas) */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-500 mb-1">Puerta de ingreso</label>
          <div className="grid grid-cols-2 gap-2">
            {PUERTAS.map((p) => (
              <button
                key={p}
                onClick={() => setPuerta(p)}
                disabled={yaAdentro}
                className={`py-2 px-3 rounded text-sm font-bold border transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                  puerta === p
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="material-symbols-outlined text-base">videocam</span>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Placa (escanear o escribir)</label>
            <input
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm font-semibold text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none uppercase tracking-widest"
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="ABC-123"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              La cámara la rellena; igual puedes escribir o corregir a mano.
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tipo de Ocupante</label>
            <div className="flex border border-slate-300 rounded overflow-hidden">
              <div className={`flex-1 py-2 text-sm font-bold text-center ${esResidente && ficha ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600"}`}>Residente</div>
              <div className={`flex-1 py-2 text-sm font-bold text-center ${!esResidente && ficha ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600"}`}>Visitante</div>
            </div>
          </div>
        </div>
      </div>

      {/* Validación + ficha */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        {ficha ? (
          <>
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${esResidente ? "bg-green-100" : "bg-blue-100"}`}>
                <span className={`material-symbols-outlined text-2xl ${esResidente ? "text-green-600" : "text-blue-600"}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {esResidente ? "check_circle" : "info"}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">{ficha.usuarioNombre}</h4>
                <p className="text-sm text-slate-500">{ficha.marca} {ficha.modelo} {ficha.color} · {ficha.tipoOcupanteRaw}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
              <FichaItem label="Condominio" value={ficha.condominioNombre} />
              <FichaItem label="Torre" value={ficha.torreNombre} />
              <FichaItem label="Piso" value={ficha.pisoNumero} />
              <FichaItem label="Depto" value={ficha.unidad} />
            </div>
          </>
        ) : noRegistrada ? (
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-amber-500 text-2xl">block</span>
            <p className="text-sm text-slate-600">
              Matrícula <strong>{plate}</strong> no registrada. Regístrala primero en <strong>Directorio de Residentes</strong> para concederle acceso.
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400 mb-4">Escanea o escribe una placa registrada para ver su información.</p>
        )}

        {/* Aviso si ya está adentro */}
        {yaAdentro && (
          <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 text-sm text-amber-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">directions_car</span>
            Este vehículo ya está adentro (ingresó {estanciaActiva.horaEntrada}). Registra su salida.
          </div>
        )}

        {/* Espacio asignado (solo al entrar) */}
        {ficha && !yaAdentro && (
          <div className={`border rounded p-4 mb-6 flex justify-between items-center ${previewSpace ? "bg-slate-100 border-slate-200" : "bg-red-50 border-red-200"}`}>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Espacio Asignado</label>
              {previewSpace ? (
                <div className="text-slate-800 text-xl font-mono font-bold">{previewSpace}</div>
              ) : (
                <div className="text-red-500 text-sm font-semibold">Sin espacios disponibles</div>
              )}
            </div>
            <span className={`material-symbols-outlined text-4xl ${previewSpace ? "text-slate-400" : "text-red-300"}`}>
              {previewSpace ? "directions_car" : "no_crash"}
            </span>
          </div>
        )}

        {/* Botón: salida si está adentro, entrada si registrada */}
        {yaAdentro ? (
          <button
            onClick={() => registerExit(plate)}
            className="w-full bg-red-600 text-white py-3 px-4 rounded font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Registrar Salida y Abrir Puerta
          </button>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            disabled={!ficha}
            className="w-full bg-slate-900 text-white py-3 px-4 rounded font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            Conceder Acceso y Abrir Puerta
          </button>
        )}
      </div>

      {/* Confirmación de entrada */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmar Acceso</h3>
              <p className="text-slate-600 mb-2">
                ¿Conceder acceso a la placa <strong className="text-slate-800">{plate}</strong> por <strong>{puerta}</strong>?
              </p>
              {ficha && (
                <p className="text-sm text-slate-400 mb-6">
                  {ficha.usuarioNombre} · {ficha.condominioNombre} · Torre {ficha.torreNombre} · Depto {ficha.unidad}
                </p>
              )}
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
                <button onClick={handleGrantAccess} className="px-4 py-2 rounded font-bold bg-slate-900 text-white hover:bg-slate-800">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FichaItem({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2">
      <div className="text-[10px] font-bold uppercase text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-800 truncate">{value ?? "—"}</div>
    </div>
  );
}
