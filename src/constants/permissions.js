export const PERM = {
    VER_DASHBOARD: "VER_DASHBOARD",
    VER_CONDOMINIOS: "VER_CONDOMINIOS",
    CREAR_CONDOMINIOS: "CREAR_CONDOMINIOS",
    EDITAR_CONDOMINIOS: "EDITAR_CONDOMINIOS",
    ELIMINAR_CONDOMINIOS: "ELIMINAR_CONDOMINIOS",
    VER_TORRES: "VER_TORRES",
    CREAR_TORRES: "CREAR_TORRES",
    EDITAR_TORRES: "EDITAR_TORRES",
    ELIMINAR_TORRES: "ELIMINAR_TORRES",
    VER_PISOS: "VER_PISOS",
    CREAR_PISOS: "CREAR_PISOS",
    EDITAR_PISOS: "EDITAR_PISOS",
    ELIMINAR_PISOS: "ELIMINAR_PISOS",
    VER_APARTAMENTOS: "VER_APARTAMENTOS",
    CREAR_APARTAMENTOS: "CREAR_APARTAMENTOS",
    EDITAR_APARTAMENTOS: "EDITAR_APARTAMENTOS",
    ELIMINAR_APARTAMENTOS: "ELIMINAR_APARTAMENTOS",
    VER_ENTRADAS: "VER_ENTRADAS",
    CREAR_ENTRADAS: "CREAR_ENTRADAS",
    EDITAR_ENTRADAS: "EDITAR_ENTRADAS",
    ELIMINAR_ENTRADAS: "ELIMINAR_ENTRADAS",
    VER_CARRITOS: "VER_CARRITOS",
    CREAR_CARRITOS: "CREAR_CARRITOS",
    EDITAR_CARRITOS: "EDITAR_CARRITOS",
    ELIMINAR_CARRITOS: "ELIMINAR_CARRITOS",
    VER_PRESTAMOS: "VER_PRESTAMOS",
    CREAR_PRESTAMOS: "CREAR_PRESTAMOS",
    EDITAR_PRESTAMOS: "EDITAR_PRESTAMOS",
    ELIMINAR_PRESTAMOS: "ELIMINAR_PRESTAMOS",
    VER_CONFIGURACION: "VER_CONFIGURACION",
    CREAR_CONFIGURACION: "CREAR_CONFIGURACION",
    EDITAR_CONFIGURACION: "EDITAR_CONFIGURACION",
    ELIMINAR_CONFIGURACION: "ELIMINAR_CONFIGURACION",
    GESTIONAR_PERMISOS: "GESTIONAR_PERMISOS",

    // ── Parking (ParkControl) ──
    VER_PARKING: "VER_PARKING",
    VER_VEHICULOS: "VER_VEHICULOS",
    CREAR_VEHICULOS: "CREAR_VEHICULOS",
    EDITAR_VEHICULOS: "EDITAR_VEHICULOS",
    ELIMINAR_VEHICULOS: "ELIMINAR_VEHICULOS",
    VER_ESTACIONAMIENTOS: "VER_ESTACIONAMIENTOS",
    CREAR_ESTACIONAMIENTOS: "CREAR_ESTACIONAMIENTOS",
    EDITAR_ESTACIONAMIENTOS: "EDITAR_ESTACIONAMIENTOS",
    ELIMINAR_ESTACIONAMIENTOS: "ELIMINAR_ESTACIONAMIENTOS",
    VER_ZONAS: "VER_ZONAS",
    CREAR_ZONAS: "CREAR_ZONAS",
    EDITAR_ZONAS: "EDITAR_ZONAS",
    ELIMINAR_ZONAS: "ELIMINAR_ZONAS",
    VER_PLAZAS: "VER_PLAZAS",
    CREAR_PLAZAS: "CREAR_PLAZAS",
    EDITAR_PLAZAS: "EDITAR_PLAZAS",
    ELIMINAR_PLAZAS: "ELIMINAR_PLAZAS",
    VER_PASES: "VER_PASES",
    CREAR_PASES: "CREAR_PASES",
    EDITAR_PASES: "EDITAR_PASES",
    ELIMINAR_PASES: "ELIMINAR_PASES",
    VER_ACCESOS: "VER_ACCESOS",
    CREAR_ACCESOS: "CREAR_ACCESOS",
    EDITAR_ACCESOS: "EDITAR_ACCESOS",
    ELIMINAR_ACCESOS: "ELIMINAR_ACCESOS",
};

export const MODULE_PERMS = {
    CONDOMINIOS: {
        view: PERM.VER_CONDOMINIOS,
        create: PERM.CREAR_CONDOMINIOS,
        edit: PERM.EDITAR_CONDOMINIOS,
        delete: PERM.ELIMINAR_CONDOMINIOS,
    },
    TORRES: {
        view: PERM.VER_TORRES,
        create: PERM.CREAR_TORRES,
        edit: PERM.EDITAR_TORRES,
        delete: PERM.ELIMINAR_TORRES,
    },
    PISOS: {
        view: PERM.VER_PISOS,
        create: PERM.CREAR_PISOS,
        edit: PERM.EDITAR_PISOS,
        delete: PERM.ELIMINAR_PISOS,
    },
    APARTAMENTOS: {
        view: PERM.VER_APARTAMENTOS,
        create: PERM.CREAR_APARTAMENTOS,
        edit: PERM.EDITAR_APARTAMENTOS,
        delete: PERM.ELIMINAR_APARTAMENTOS,
    },
    ENTRADAS: {
        view: PERM.VER_ENTRADAS,
        create: PERM.CREAR_ENTRADAS,
        edit: PERM.EDITAR_ENTRADAS,
        delete: PERM.ELIMINAR_ENTRADAS,
    },
    CARRITOS: {
        view: PERM.VER_CARRITOS,
        create: PERM.CREAR_CARRITOS,
        edit: PERM.EDITAR_CARRITOS,
        delete: PERM.ELIMINAR_CARRITOS,
    },
    PRESTAMOS: {
        view: PERM.VER_PRESTAMOS,
        create: PERM.CREAR_PRESTAMOS,
        edit: PERM.EDITAR_PRESTAMOS,
        delete: PERM.ELIMINAR_PRESTAMOS,
    },
    CONFIGURACION: {
        view: PERM.VER_CONFIGURACION,
        create: PERM.CREAR_CONFIGURACION,
        edit: PERM.EDITAR_CONFIGURACION,
        delete: PERM.ELIMINAR_CONFIGURACION,
    },
};

export const MENU_ITEMS = [
    { path: "/dashboard", label: "Dashboard", icon: "bi-grid-fill", permission: PERM.VER_DASHBOARD },
    { path: "/condominios", label: "Condominios", icon: "bi-building", permission: PERM.VER_CONDOMINIOS },
    { path: "/torres", label: "Torres", icon: "bi-building-fill", permission: PERM.VER_TORRES },
    { path: "/pisos", label: "Pisos", icon: "bi-layout-text-window-reverse", permission: PERM.VER_PISOS },
    { path: "/apartamentos", label: "Apartamentos", icon: "bi-house-fill", permission: PERM.VER_APARTAMENTOS },
    { path: "/carritos", label: "Carritos", icon: "bi-cart-fill", permission: PERM.VER_CARRITOS },
    { path: "/config", label: "Configuración", icon: "bi-gear-fill", permission: PERM.VER_CONFIGURACION },

    // ── Parking (ParkControl) — sección debajo de Configuración ──
    { path: "/parking/acceso", label: "Control de Acceso", icon: "bi-shield-check", permission: PERM.VER_ACCESOS, section: "Parking" },
    { path: "/parking/residentes", label: "Directorio de Residentes", icon: "bi-people-fill", permission: PERM.VER_VEHICULOS },
    { path: "/parking/mapa", label: "Mapa de Estacionamiento", icon: "bi-map-fill", permission: PERM.VER_ESTACIONAMIENTOS },
    { path: "/parking/historial", label: "Historial de Acceso", icon: "bi-clock-history", permission: PERM.VER_ACCESOS },
];

export const PERMISSION_GROUPS = [
    {
        module: "Dashboard",
        items: [{ key: PERM.VER_DASHBOARD, label: "Ver" }],
    },
    {
        module: "Condominios",
        items: [
            { key: PERM.VER_CONDOMINIOS, label: "Ver" },
            { key: PERM.CREAR_CONDOMINIOS, label: "Crear" },
            { key: PERM.EDITAR_CONDOMINIOS, label: "Editar" },
            { key: PERM.ELIMINAR_CONDOMINIOS, label: "Eliminar" },
        ],
    },
    {
        module: "Torres",
        items: [
            { key: PERM.VER_TORRES, label: "Ver" },
            { key: PERM.CREAR_TORRES, label: "Crear" },
            { key: PERM.EDITAR_TORRES, label: "Editar" },
            { key: PERM.ELIMINAR_TORRES, label: "Eliminar" },
        ],
    },
    {
        module: "Pisos",
        items: [
            { key: PERM.VER_PISOS, label: "Ver" },
            { key: PERM.CREAR_PISOS, label: "Crear" },
            { key: PERM.EDITAR_PISOS, label: "Editar" },
            { key: PERM.ELIMINAR_PISOS, label: "Eliminar" },
        ],
    },
    {
        module: "Apartamentos",
        items: [
            { key: PERM.VER_APARTAMENTOS, label: "Ver" },
            { key: PERM.CREAR_APARTAMENTOS, label: "Crear" },
            { key: PERM.EDITAR_APARTAMENTOS, label: "Editar" },
            { key: PERM.ELIMINAR_APARTAMENTOS, label: "Eliminar" },
        ],
    },
    {
        module: "Entradas",
        items: [
            { key: PERM.VER_ENTRADAS, label: "Ver" },
            { key: PERM.CREAR_ENTRADAS, label: "Crear" },
            { key: PERM.EDITAR_ENTRADAS, label: "Editar" },
            { key: PERM.ELIMINAR_ENTRADAS, label: "Eliminar" },
        ],
    },
    {
        module: "Carritos",
        items: [
            { key: PERM.VER_CARRITOS, label: "Ver" },
            { key: PERM.CREAR_CARRITOS, label: "Crear" },
            { key: PERM.EDITAR_CARRITOS, label: "Editar" },
            { key: PERM.ELIMINAR_CARRITOS, label: "Eliminar" },
        ],
    },
    {
        module: "Préstamos",
        items: [
            { key: PERM.VER_PRESTAMOS, label: "Ver" },
            { key: PERM.CREAR_PRESTAMOS, label: "Crear" },
            { key: PERM.EDITAR_PRESTAMOS, label: "Editar" },
            { key: PERM.ELIMINAR_PRESTAMOS, label: "Eliminar" },
        ],
    },
    {
        module: "Configuración",
        items: [
            { key: PERM.VER_CONFIGURACION, label: "Ver" },
            { key: PERM.CREAR_CONFIGURACION, label: "Crear" },
            { key: PERM.EDITAR_CONFIGURACION, label: "Editar" },
            { key: PERM.ELIMINAR_CONFIGURACION, label: "Eliminar" },
            { key: PERM.GESTIONAR_PERMISOS, label: "Gestionar permisos" },
        ],
    },
    // ── Parking (ParkControl) ──
    {
        module: "Parking",
        items: [{ key: PERM.VER_PARKING, label: "Ver panel de parking" }],
    },
    {
        module: "Vehículos",
        items: [
            { key: PERM.VER_VEHICULOS, label: "Ver" },
            { key: PERM.CREAR_VEHICULOS, label: "Crear" },
            { key: PERM.EDITAR_VEHICULOS, label: "Editar" },
            { key: PERM.ELIMINAR_VEHICULOS, label: "Eliminar" },
        ],
    },
    {
        module: "Estacionamientos",
        items: [
            { key: PERM.VER_ESTACIONAMIENTOS, label: "Ver (mapa)" },
            { key: PERM.CREAR_ESTACIONAMIENTOS, label: "Crear" },
            { key: PERM.EDITAR_ESTACIONAMIENTOS, label: "Editar" },
            { key: PERM.ELIMINAR_ESTACIONAMIENTOS, label: "Eliminar" },
        ],
    },
    {
        module: "Zonas",
        items: [
            { key: PERM.VER_ZONAS, label: "Ver" },
            { key: PERM.CREAR_ZONAS, label: "Crear" },
            { key: PERM.EDITAR_ZONAS, label: "Editar" },
            { key: PERM.ELIMINAR_ZONAS, label: "Eliminar" },
        ],
    },
    {
        module: "Plazas",
        items: [
            { key: PERM.VER_PLAZAS, label: "Ver" },
            { key: PERM.CREAR_PLAZAS, label: "Crear" },
            { key: PERM.EDITAR_PLAZAS, label: "Editar" },
            { key: PERM.ELIMINAR_PLAZAS, label: "Eliminar" },
        ],
    },
    {
        module: "Pases",
        items: [
            { key: PERM.VER_PASES, label: "Ver" },
            { key: PERM.CREAR_PASES, label: "Crear" },
            { key: PERM.EDITAR_PASES, label: "Editar" },
            { key: PERM.ELIMINAR_PASES, label: "Eliminar" },
        ],
    },
    {
        module: "Accesos",
        items: [
            { key: PERM.VER_ACCESOS, label: "Ver" },
            { key: PERM.CREAR_ACCESOS, label: "Registrar entrada" },
            { key: PERM.EDITAR_ACCESOS, label: "Registrar salida" },
            { key: PERM.ELIMINAR_ACCESOS, label: "Eliminar" },
        ],
    },
];
