import React, { useState, useMemo } from 'react';
import {
    Tab, Table, Form, Button, Modal, Dropdown, InputGroup, Alert, Card, Row, Col, Container, Badge
} from 'react-bootstrap';

// --- Constantes ---
const INITIAL_USERS = [
    { id: 1, nombre: 'Carlos Rodríguez', email: 'carlos.r@condominio.com', rol: 'Administrador', unidad: 'Oficina Central', estado: true },
    { id: 2, nombre: 'María Loayza', email: 'mloayza@gmail.com', rol: 'Residente', unidad: 'Torre A - 402', estado: true },
    { id: 3, nombre: 'Juan Pérez', email: 'jperez@seguridad.com', rol: 'Vigilante', unidad: 'Portería 1', estado: true },
    { id: 4, nombre: 'Lucía Méndez', email: 'lucia.m@gmail.com', rol: 'Residente', unidad: 'Torre B - 105', estado: false },
    { id: 5, nombre: 'Roberto Gómez', email: 'rgomez@seguridad.com', rol: 'Vigilante', unidad: 'Portería 2', estado: true },
];

const ROLE_PERMISSIONS = {
    'Administrador': ['Gestión total de usuarios', 'Configuración de tarifas y pagos', 'Reportes financieros', 'Auditoría', 'Configuración del sistema'],
    'Vigilante': ['Registro de entradas/salidas', 'Mapa estacionamiento', 'Gestión de visitas', 'Reporte incidentes'],
    'Residente': ['Historial de pagos', 'Pases de visita', 'Reportar problemas', 'Ver comunicados']
};

const INITIAL_RATES = { tolerancia: 15, penalidad: 15.00, moneda: 'S/' };

const INITIAL_RESIDENTS = [
    { id: 1, nombre: 'María Loayza', unidad: 'Torre A - 402', vehiculo: 'ABC-123', totalPenalidades: 45, historial: [{ id: 101, fecha: '2024-04-10', minutos: 25, monto: 15, estado: 'Pagado' }, { id: 102, fecha: '2024-04-15', minutos: 40, monto: 15, estado: 'Pendiente' }, { id: 103, fecha: '2024-04-20', minutos: 15, monto: 15, estado: 'Pendiente' }] },
    { id: 2, nombre: 'Lucía Méndez', unidad: 'Torre B - 105', vehiculo: 'XYZ-789', totalPenalidades: 15, historial: [{ id: 201, fecha: '2024-04-12', minutos: 10, monto: 15, estado: 'Pagado' }] },
    { id: 3, nombre: 'Ricardo Palma', unidad: 'Torre C - 201', vehiculo: 'EFG-456', totalPenalidades: 30, historial: [{ id: 301, fecha: '2024-04-05', minutos: 60, monto: 15, estado: 'Pendiente' }, { id: 302, fecha: '2024-04-18', minutos: 35, monto: 15, estado: 'Pendiente' }] }
];

// --- Subcomponentes ---
const Avatar = ({ name }) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const color = ['#435ebe', '#198754', '#0dcaf0', '#ffc107', '#dc3545'][name.length % 5];
    return (
        <div className="avatar-circle" style={{ backgroundColor: color }}>{initials}</div>
    );
};

const UsuariosTab = () => {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('Todos');
    const [modals, setModals] = useState({ user: false, perms: false, current: null, role: '' });

    const filtered = useMemo(() => users.filter(u =>
        (u.nombre.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
        (roleFilter === 'Todos' || u.rol === roleFilter)
    ), [users, search, roleFilter]);

    const handleSave = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        const user = { ...data, id: modals.current?.id || Date.now(), estado: data.estado === 'on' };
        setUsers(modals.current ? users.map(u => u.id === modals.current.id ? user : u) : [...users, user]);
        setModals({ ...modals, user: false, current: null });
    };

    return (
        <div className="py-3">
            <Row className="mb-4 g-3">
                <Col md={6}><InputGroup><InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text><Form.Control placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></InputGroup></Col>
                <Col md={3}><Form.Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="Todos">Todos los roles</option><option>Administrador</option><option>Vigilante</option><option>Residente</option></Form.Select></Col>
                <Col md={3} className="text-end"><Button onClick={() => setModals({ ...modals, user: true, current: null })}><i className="bi bi-person-plus me-2"></i>Nuevo</Button></Col>
            </Row>

            <Card><Table responsive hover className="mb-0 align-middle">
                <thead><tr><th className="ps-4">Nombre</th><th>Email</th><th>Rol</th><th>Unidad</th><th>Estado</th><th className="text-end pe-4">Acciones</th></tr></thead>
                <tbody>{filtered.map(u => (
                    <tr key={u.id}><td className="ps-4"><Avatar name={u.nombre} />{u.nombre}</td><td className="small text-muted">{u.email}</td><td><Badge bg={u.rol === 'Administrador' ? 'primary' : 'secondary'}>{u.rol}</Badge></td><td>{u.unidad}</td>
                        <td><Form.Check type="switch" checked={u.estado} onChange={() => setUsers(users.map(us => us.id === u.id ? { ...us, estado: !us.estado } : us))} /></td>
                        <td className="text-end pe-4"><Dropdown align="end"><Dropdown.Toggle variant="link" className="no-caret text-muted"><i className="bi bi-three-dots-vertical"></i></Dropdown.Toggle>
                            <Dropdown.Menu><Dropdown.Item onClick={() => setModals({ ...modals, user: true, current: u })}><i className="bi bi-pencil me-2"></i>Editar</Dropdown.Item>
                                <Dropdown.Item onClick={() => setModals({ ...modals, perms: true, role: u.rol })}><i className="bi bi-shield-check me-2"></i>Permisos</Dropdown.Item>
                                <Dropdown.Divider /><Dropdown.Item className="text-danger" onClick={() => window.confirm('¿Eliminar?') && setUsers(users.filter(us => us.id !== u.id))}><i className="bi bi-trash me-2"></i>Eliminar</Dropdown.Item></Dropdown.Menu></Dropdown></td></tr>
                ))}</tbody>
            </Table></Card>

            <Modal show={modals.user} onHide={() => setModals({ ...modals, user: false })} centered>
                <Form onSubmit={handleSave}><Modal.Header closeButton><Modal.Title>{modals.current ? 'Editar' : 'Nuevo'} Usuario</Modal.Title></Modal.Header>
                    <Modal.Body><Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control name="nombre" defaultValue={modals.current?.nombre} required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" defaultValue={modals.current?.email} required /></Form.Group>
                        <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Rol</Form.Label><Form.Select name="rol" defaultValue={modals.current?.rol}><option>Administrador</option><option>Vigilante</option><option>Residente</option></Form.Select></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Unidad</Form.Label><Form.Control name="unidad" defaultValue={modals.current?.unidad} required /></Form.Group></Col></Row>
                        <Form.Check type="switch" label="Activo" name="estado" defaultChecked={modals.current ? modals.current.estado : true} /></Modal.Body>
                    <Modal.Footer><Button variant="light" onClick={() => setModals({ ...modals, user: false })}>Cancelar</Button><Button type="submit">Guardar</Button></Modal.Footer></Form>
            </Modal>

            <Modal show={modals.perms} onHide={() => setModals({ ...modals, perms: false })} centered>
                <Modal.Header closeButton><Modal.Title>Permisos: {modals.role}</Modal.Title></Modal.Header>
                <Modal.Body><ul className="list-group list-group-flush">{ROLE_PERMISSIONS[modals.role]?.map((p, i) => <li key={i} className="list-group-item border-0"><i className="bi bi-check-circle-fill text-success me-2"></i>{p}</li>)}</ul></Modal.Body>
            </Modal>
        </div>
    );
};

const TarifasTab = () => {
    const [rates, setRates] = useState(INITIAL_RATES);
    const [temp, setTemp] = useState(INITIAL_RATES);
    const [alert, setAlert] = useState(null);

    const save = () => { setRates(temp); setAlert({ type: 'success', msg: 'Guardado' }); setTimeout(() => setAlert(null), 3000); };
    return (
        <div className="py-4">
            {alert && <Alert variant={alert.type} className="animate__animated animate__fadeIn"><i className="bi bi-check-circle me-2"></i>{alert.msg}</Alert>}
            <Row className="justify-content-center"><Col lg={7}><Card className="overflow-hidden">
                <Card.Header className="bg-primary text-white py-3"><h5 className="mb-0"><i className="bi bi-gear-fill me-2"></i>Parámetros</h5></Card.Header>
                <Card.Body className="p-4">
                    <Form.Group className="mb-4"><Form.Label className="small fw-bold text-uppercase opacity-75">Tolerancia (Min)</Form.Label>
                        <InputGroup size="lg"><InputGroup.Text><i className="bi bi-clock"></i></InputGroup.Text><Form.Control type="number" value={temp.tolerancia} onChange={e => setTemp({ ...temp, tolerancia: e.target.value })} /><InputGroup.Text>minutos</InputGroup.Text></InputGroup></Form.Group>
                    <Form.Group className="mb-4"><Form.Label className="small fw-bold text-uppercase opacity-75">Penalidad</Form.Label>
                        <InputGroup size="lg"><InputGroup.Text>{temp.moneda}</InputGroup.Text><Form.Control type="number" value={temp.penalidad} onChange={e => setTemp({ ...temp, penalidad: e.target.value })} /></InputGroup></Form.Group>
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <Button variant="link" className="text-muted small" onClick={() => window.confirm('¿Restablecer?') && setTemp(rates)}>Restablecer</Button>
                        <Button size="lg" className="px-5" onClick={save}>Guardar Cambios</Button>
                    </div>
                </Card.Body></Card></Col></Row>
        </div>
    );
};

const ResidentesTab = () => {
    const [residents] = useState(INITIAL_RESIDENTS);
    const [selected, setSelected] = useState(null);

    return (
        <div className="py-3">
            <Card><Table responsive hover className="mb-0 align-middle">
                <thead><tr><th className="ps-4">Nombre</th><th>Unidad</th><th>Vehículo</th><th className="text-center">Penalidades</th><th className="text-end pe-4">Acción</th></tr></thead>
                <tbody>{residents.map(r => {
                    const pending = r.historial.filter(h => h.estado === 'Pendiente').reduce((s, h) => s + h.monto, 0);
                    return (
                        <tr key={r.id} onClick={() => setSelected(r)} style={{ cursor: 'pointer' }}>
                            <td className="ps-4 fw-medium"><Avatar name={r.nombre} />{r.nombre}</td>
                            <td>{r.unidad}</td>
                            <td className="text-muted">{r.vehiculo}</td>
                            <td className="text-center">
                                <span className={`fw-bold ${pending > 0 ? 'text-danger' : 'text-success'}`}>
                                    S/ {pending.toFixed(2)}
                                </span>
                            </td>
                            <td className="text-end pe-4">
                                <Button variant="outline-primary" size="sm">Ver Historial</Button>
                            </td>
                        </tr>
                    );
                })}</tbody>
            </Table></Card>

            <Modal show={!!selected} onHide={() => setSelected(null)} size="lg" centered>
                <Modal.Header closeButton><Modal.Title>Historial: {selected?.nombre}</Modal.Title></Modal.Header>
                <Modal.Body className="p-0">
                    <div className="p-3 border-bottom"><Row><Col><strong>Unidad:</strong> {selected?.unidad}</Col><Col><strong>Vehículo:</strong> {selected?.vehiculo}</Col></Row></div>
                    <Table hover className="mb-0"><thead><tr><th className="ps-4">Fecha</th><th>Min.</th><th>Monto</th><th className="pe-4 text-end">Estado</th></tr></thead>
                        <tbody>{selected?.historial.map(h => <tr key={h.id}><td className="ps-4">{h.fecha}</td><td>{h.minutos}m</td><td>S/ {h.monto}</td><td className="pe-4 text-end"><Badge bg={h.estado === 'Pagado' ? 'success' : 'danger'} pill>{h.estado}</Badge></td></tr>)}</tbody>
                    </Table></Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <div className="fw-bold text-danger">Total Pendiente: S/ {selected?.historial.filter(h => h.estado === 'Pendiente').reduce((s, h) => s + h.monto, 0).toFixed(2)}</div>
                    <Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

// --- Pagina Principal ---
const ConfiguracionPage = () => {
    const [tab, setTab] = useState('usuarios');

    return (
        <Container fluid className="p-4 theme-container min-vh-100">
            <div className="mb-4 d-flex justify-content-between align-items-end">
                <div><h2 className="fw-bold text-primary mb-0">Configuración</h2><p className="text-muted mb-0">Administra usuarios y parámetros del sistema</p></div>
                <div className="small text-muted opacity-50"><i className="bi bi-clock me-1"></i>Actualizado: Hoy</div>
            </div>

            <Tab.Container activeKey={tab} onSelect={setTab}>
                <Card className="mb-4 overflow-hidden border-0 shadow-sm"><Card.Header className="p-0 border-0">
                    <nav className="nav nav-tabs nav-justified border-0">
                        {['usuarios', 'residentes', 'tarifas'].map(id => (
                            <button key={id} className={`nav-link py-3 fw-bold ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                                <i className={`bi bi-${id === 'usuarios' ? 'people' : id === 'residentes' ? 'person-badge' : 'gear'}-fill me-2`}></i>
                                {id.charAt(0).toUpperCase() + id.slice(1)}
                            </button>
                        ))}
                    </nav>
                </Card.Header></Card>

                <Tab.Content>
                    <Tab.Pane eventKey="usuarios"><UsuariosTab /></Tab.Pane>
                    <Tab.Pane eventKey="residentes"><ResidentesTab /></Tab.Pane>
                    <Tab.Pane eventKey="tarifas"><TarifasTab /></Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            <style>{`
                :root { --surface: #ffffff; --body-bg: #f2f7ff; --border: #e2e8f0; --text-muted: #64748b; --header-bg: #f8fafc; --input-bg: #ffffff; --text: #1e293b; }
                [data-bs-theme="dark"] { --surface: #252539; --body-bg: #1b1b29; --border: rgba(255,255,255,0.08); --text-muted: #8a8da8; --header-bg: rgba(255,255,255,0.03); --input-bg: #1b1b29; --text: #ced4da; }

                .theme-container { background-color: var(--body-bg) !important; color: var(--text); }
                .card { background-color: var(--surface) !important; border: 1px solid var(--border) !important; color: var(--text) !important; }
                .modal-content { background-color: var(--surface) !important; border: 1px solid var(--border) !important; color: var(--text) !important; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
                .card-header, .card-footer, thead, .modal-header, .modal-footer { background-color: var(--header-bg) !important; border-color: var(--border) !important; color: var(--text-muted) !important; padding: 1rem 1.5rem; }
                .table { color: var(--text) !important; border-color: var(--border) !important; margin-bottom: 0; }
                .table th, .table td { padding: 1rem 0.75rem !important; vertical-align: middle; }
                .list-group-item { background-color: transparent !important; color: var(--text) !important; border-color: var(--border) !important; padding: 1rem 0; }
                .form-control, .form-select, .input-group-text { background-color: var(--input-bg) !important; border-color: var(--border) !important; color: var(--text) !important; padding: 0.6rem 1rem; }
                .form-control:focus, .form-select:focus { background-color: var(--input-bg) !important; color: var(--text) !important; border-color: #435ebe; box-shadow: 0 0 0 0.25rem rgba(67, 94, 190, 0.1); }
                
                .nav-link { color: var(--text-muted); transition: 0.3s; border-radius: 0; }
                .nav-link.active { background-color: rgba(67, 94, 190, 0.1) !important; color: #435ebe !important; border-bottom: 3px solid #435ebe !important; }
                .avatar-circle { 
                    width: 32px; height: 32px; border-radius: 50%; color: white; 
                    display: inline-flex; align-items: center; justify-content: center; 
                    font-size: 0.75rem; font-weight: bold; margin-right: 12px; 
                    flex-shrink: 0; line-height: 1; overflow: hidden;
                }
                .no-caret::after { display: none !important; }
                .badge { padding: 0.5em 0.8em; font-weight: 500; }
                thead th { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; border-bottom: 2px solid var(--border) !important; background-color: var(--header-bg) !important; }
                .modal-backdrop.show { opacity: 0.6; backdrop-filter: blur(4px); }
                .text-primary { color: #435ebe !important; }
            `}</style>
        </Container>
    );
};

export default ConfiguracionPage;
