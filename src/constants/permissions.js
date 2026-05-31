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
];
