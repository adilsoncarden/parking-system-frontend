import React, { useState } from 'react';

// --- DATOS INICIALES HARDCODEADOS ---
const INITIAL_USERS = [
  { id: 1, nombre: 'Admin Sistema', email: 'admin@condo.com', rol: 'Administrador', unidad: 'N/A', estado: true },
  { id: 2, nombre: 'Juan Pérez', email: 'juan.perez@email.com', rol: 'Vigilante', unidad: 'Portería', estado: true },
  { id: 3, nombre: 'María García', email: 'm.garcia@gmail.com', rol: 'Residente', unidad: 'T1-101', estado: true },
  { id: 4, nombre: 'Carlos Vigil', email: 'carlos@seguridad.com', rol: 'Vigilante', unidad: 'Portería', estado: false },
  { id: 5, nombre: 'Ana López', email: 'ana.l@outlook.com', rol: 'Residente', unidad: 'T2-504', estado: true },
];

const ROLES_PERMISSIONS = {
  'Administrador': ['Acceso total', 'Gestión de usuarios', 'Configuración de tarifas', 'Reportes financieros', 'Gestión de torres'],
  'Vigilante': ['Registro de ingresos/salidas', 'Consulta de residentes', 'Gestión de carritos', 'Registro de incidencias'],
  'Residente': ['Consulta de penalidades', 'Reserva de carritos', 'Ver perfil'],
};

const INITIAL_TARIFAS = {
  tiempoTolerancia: 15,
  montoPenalidad: 15.00
};

const INITIAL_RESIDENTES = [
  {
    id: 1,
    nombre: 'María García',
    unidad: 'T1-101',
    vehiculo: 'Toyota Corolla (ABC-123)',
    historial: [
      { id: 101, fecha: '2024-04-20', minutosExcedidos: 10, monto: 15.00, estado: 'Pagado' },
      { id: 102, fecha: '2024-04-25', minutosExcedidos: 5, monto: 15.00, estado: 'Pendiente' },
    ]
  },
  {
    id: 2,
    nombre: 'Ana López',
    unidad: 'T2-504',
    vehiculo: 'Honda Civic (XYZ-789)',
    historial: [
      { id: 201, fecha: '2024-04-22', minutosExcedidos: 20, monto: 15.00, estado: 'Pagado' },
    ]
  },
  {
    id: 3,
    nombre: 'Pedro Soto',
    unidad: 'T1-302',
    vehiculo: 'Nissan Sentra (DEF-456)',
    historial: [
      { id: 301, fecha: '2024-04-18', minutosExcedidos: 15, monto: 15.00, estado: 'Pendiente' },
      { id: 302, fecha: '2024-04-28', minutosExcedidos: 30, monto: 15.00, estado: 'Pendiente' },
    ]
  }
];

// --- SUBCOMPONENTES ---

const UsuariosTab = () => {
  const [usuarios, setUsuarios] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRolePerms, setSelectedRolePerms] = useState(null);

  const filteredUsuarios = usuarios.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || user.rol === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getInitials = (nombre) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleOpenModal = (user = null) => {
    setCurrentUser(user || { nombre: '', email: '', rol: 'Residente', unidad: '', estado: true });
    setShowModal(true);
  };

  const handleSaveUser = () => {
    if (currentUser.id) {
      setUsuarios(usuarios.map(u => u.id === currentUser.id ? currentUser : u));
    } else {
      setUsuarios([...usuarios, { ...currentUser, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsuarios(usuarios.filter(u => u.id !== id));
    }
  };

  const handleToggleEstado = (id) => {
    setUsuarios(usuarios.map(u => u.id === id ? { ...u, estado: !u.estado } : u));
  };

  const handleShowPermisos = (rol) => {
    setSelectedRolePerms({ rol, permisos: ROLES_PERMISSIONS[rol] || [] });
    setShowPermisosModal(true);
  };

  const counts = {
    Administrador: usuarios.filter(u => u.rol === 'Administrador').length,
    Vigilante: usuarios.filter(u => u.rol === 'Vigilante').length,
    Residente: usuarios.filter(u => u.rol === 'Residente').length,
  };

  return (
    <div className="card border-0 shadow-sm mt-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex gap-3 flex-grow-1" style={{ maxWidth: '600px' }}>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ maxWidth: '200px' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="Todos">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Vigilante">Vigilante</option>
              <option value="Residente">Residente</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <i className="bi bi-person-plus-fill me-2"></i> Nuevo Usuario
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="bg-light">
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Unidad</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                        style={{ width: '40px', height: '40px', fontSize: '0.9rem', fontWeight: 'bold' }}
                      >
                        {getInitials(user.nombre)}
                      </div>
                      <span className="fw-medium">{user.nombre}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.rol === 'Administrador' ? 'bg-danger' : user.rol === 'Vigilante' ? 'bg-warning text-dark' : 'bg-info text-white'}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>{user.unidad}</td>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`switch-${user.id}`}
                        checked={user.estado}
                        onChange={() => handleToggleEstado(user.id)}
                      />
                    </div>
                  </td>
                  <td className="text-end">
                    <div className="dropdown">
                      <button
                        className="btn btn-link text-secondary p-0 border-0 dropdown-toggle no-caret"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-three-dots-vertical fs-5"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button className="dropdown-item" onClick={() => handleOpenModal(user)}>
                            <i className="bi bi-pencil me-2"></i> Editar
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={() => handleShowPermisos(user.rol)}>
                            <i className="bi bi-shield-lock me-2"></i> Ver permisos
                          </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item text-danger" onClick={() => handleDeleteUser(user.id)}>
                            <i className="bi bi-trash me-2"></i> Eliminar
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex gap-4 mt-3 pt-3 border-top text-muted small">
          <span><strong>Total:</strong> {usuarios.length} usuarios</span>
          <span><strong>Administradores:</strong> {counts.Administrador}</span>
          <span><strong>Vigilantes:</strong> {counts.Vigilante}</span>
          <span><strong>Residentes:</strong> {counts.Residente}</span>
        </div>
      </div>

      {/* Modal Usuario */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{currentUser?.id ? 'Editar Usuario' : 'Nuevo Usuario'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {currentUser && (
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Nombre completo</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentUser.nombre}
                        onChange={(e) => setCurrentUser({ ...currentUser, nombre: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={currentUser.email}
                        onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Rol</label>
                          <select
                            className="form-select"
                            value={currentUser.rol}
                            onChange={(e) => setCurrentUser({ ...currentUser, rol: e.target.value })}
                          >
                            <option value="Administrador">Administrador</option>
                            <option value="Vigilante">Vigilante</option>
                            <option value="Residente">Residente</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Unidad / Área</label>
                          <input
                            type="text"
                            className="form-control"
                            value={currentUser.unidad}
                            onChange={(e) => setCurrentUser({ ...currentUser, unidad: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="modal-switch-estado"
                        checked={currentUser.estado}
                        onChange={(e) => setCurrentUser({ ...currentUser, estado: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="modal-switch-estado">Usuario activo</label>
                    </div>
                  </form>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveUser}>Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Permisos */}
      {showPermisosModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Permisos del Rol: {selectedRolePerms?.rol}</h5>
                <button type="button" className="btn-close" onClick={() => setShowPermisosModal(false)}></button>
              </div>
              <div className="modal-body">
                <ul className="list-group list-group-flush">
                  {selectedRolePerms?.permisos.map((perm, idx) => (
                    <li key={idx} className="list-group-item d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-3"></i>
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPermisosModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TarifasTab = () => {
  const [tarifas, setTarifas] = useState(INITIAL_TARIFAS);
  const [tempTarifas, setTempTarifas] = useState(INITIAL_TARIFAS);
  const [showAlert, setShowAlert] = useState(false);

  const handleSave = () => {
    setTarifas(tempTarifas);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleReset = () => {
    setTempTarifas(INITIAL_TARIFAS);
  };

  return (
    <div className="card border-0 shadow-sm mt-3" style={{ maxWidth: '500px' }}>
      <div className="card-body p-4">
        <h5 className="mb-4 fw-bold">Configuración de Cobros</h5>

        {showAlert && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i> Cambios guardados correctamente.
            <button type="button" className="btn-close" onClick={() => setShowAlert(false)}></button>
          </div>
        )}

        <form>
          <div className="mb-4">
            <label className="form-label fw-medium">Tiempo de tolerancia (minutos)</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                value={tempTarifas.tiempoTolerancia}
                onChange={(e) => setTempTarifas({ ...tempTarifas, tiempoTolerancia: parseInt(e.target.value) || 0 })}
              />
              <span className="input-group-text">min</span>
            </div>
            <div className="form-text">
              Tiempo gratuito antes de aplicar penalidad.
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-medium">Penalidad por exceder el tiempo</label>
            <div className="input-group">
              <span className="input-group-text">S/</span>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={tempTarifas.montoPenalidad}
                onChange={(e) => setTempTarifas({ ...tempTarifas, montoPenalidad: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-text">
              Monto fijo a cobrar si se supera la tolerancia.
            </div>
          </div>

          <div className="d-flex gap-3">
            <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={handleReset}>
              Restablecer
            </button>
            <button type="button" className="btn btn-primary flex-grow-1" onClick={handleSave}>
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ResidentesTab = () => {
  const [residentes] = useState(INITIAL_RESIDENTES);
  const [selectedResidente, setSelectedResidente] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenHistorial = (res) => {
    setSelectedResidente(res);
    setShowModal(true);
  };

  const calcularTotalPendiente = (historial) => {
    return historial
      .filter(h => h.estado === 'Pendiente')
      .reduce((acc, curr) => acc + curr.monto, 0);
  };

  const calcularTotalAcumulado = (historial) => {
    return historial.reduce((acc, curr) => acc + curr.monto, 0);
  };

  return (
    <div className="card border-0 shadow-sm mt-3">
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="bg-light">
              <tr>
                <th>Nombre</th>
                <th>Unidad</th>
                <th>Vehículo</th>
                <th>Total Penalidades</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {residentes.map(res => (
                <tr key={res.id}>
                  <td className="fw-medium">{res.nombre}</td>
                  <td>{res.unidad}</td>
                  <td>{res.vehiculo}</td>
                  <td>
                    <span className={`fw-bold ${calcularTotalPendiente(res.historial) > 0 ? 'text-danger' : 'text-success'}`}>
                      S/ {calcularTotalAcumulado(res.historial).toFixed(2)}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-link text-decoration-none"
                      onClick={() => handleOpenHistorial(res)}
                    >
                      Ver historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Historial */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Historial de Penalidades - {selectedResidente?.nombre}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <small className="text-muted d-block">Unidad: {selectedResidente?.unidad}</small>
                  <small className="text-muted d-block">Vehículo: {selectedResidente?.vehiculo}</small>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle border">
                    <thead className="bg-light">
                      <tr>
                        <th>Fecha</th>
                        <th>Minutos Excedidos</th>
                        <th>Monto</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedResidente?.historial.map(item => (
                        <tr key={item.id}>
                          <td>{item.fecha}</td>
                          <td>{item.minutosExcedidos} min</td>
                          <td>S/ {item.monto.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${item.estado === 'Pagado' ? 'bg-success' : 'bg-danger'}`}>
                              {item.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-light p-3 rounded d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <span className="text-muted d-block small">Total Cobrado</span>
                    <span className="fw-bold fs-5 text-success">
                      S/ {(selectedResidente ? calcularTotalAcumulado(selectedResidente.historial) - calcularTotalPendiente(selectedResidente.historial) : 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-end">
                    <span className="text-muted d-block small">Total Pendiente</span>
                    <span className="fw-bold fs-5 text-danger">
                      S/ {(selectedResidente ? calcularTotalPendiente(selectedResidente.historial) : 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

const ConfiguracionPage = () => {
  const [activeTab, setActiveTab] = useState('usuarios');

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Configuración del Sistema</h2>
          <p className="text-muted">Administra usuarios, tarifas y supervisa penalidades de residentes.</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom-0 pt-3">
          <ul className="nav nav-tabs border-bottom-0 custom-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'usuarios' ? 'active' : ''}`}
                onClick={() => setActiveTab('usuarios')}
              >
                <i className="bi bi-people-fill me-2"></i> Usuarios y roles
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'tarifas' ? 'active' : ''}`}
                onClick={() => setActiveTab('tarifas')}
              >
                <i className="bi bi-lightning-fill me-2"></i> Tarifas
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'residentes' ? 'active' : ''}`}
                onClick={() => setActiveTab('residentes')}
              >
                <i className="bi bi-house-door-fill me-2"></i> Residentes
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body pt-0">
          <div className="tab-content">
            {activeTab === 'usuarios' && <UsuariosTab />}
            {activeTab === 'tarifas' && <TarifasTab />}
            {activeTab === 'residentes' && <ResidentesTab />}
          </div>
        </div>
      </div>

      <style>{`
        .custom-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 500;
          padding: 1rem 1.5rem;
          border-bottom: 3px solid transparent;
          background: transparent;
        }
        .custom-tabs .nav-link.active {
          color: var(--bs-primary) !important;
          border-bottom: 3px solid var(--bs-primary) !important;
        }
        .no-caret::after {
          display: none;
        }
        .dropdown-toggle.no-caret::after {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ConfiguracionPage;
