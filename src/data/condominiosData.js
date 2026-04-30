// ─────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE VERDAD — todos los módulos importan desde aquí
// ─────────────────────────────────────────────────────────────

export const condominiosBase = [
    {
        id: 1,
        nombre: "Condominio Los Álamos",
        direccion: "Av. Primavera 123",
        badge: "Residencial",
        badgeColor: "#4e6ef2",
        imagen: "/assets/images/condominios/condominio-los-alamos.jpg",
        carritoIds: [1, 2],
    },
    {
        id: 2,
        nombre: "Residencial El Bosque",
        direccion: "Jr. Los Pinos 456",
        badge: "Premium",
        badgeColor: "#16a34a",
        imagen: "/assets/images/condominios/condominio-el-bosque.jpg",
        carritoIds: [3, 4],
    },
];

export const torresMock = [
    { id: 1, nombre: "Torre A", id_condominio: 1 },
    { id: 2, nombre: "Torre B", id_condominio: 1 },
    { id: 3, nombre: "Torre C", id_condominio: 1 },
];

export const pisosMock = [
    { id: 1, numero_piso: 1, id_torre: 1 },
    { id: 2, numero_piso: 2, id_torre: 1 },
    { id: 3, numero_piso: 3, id_torre: 1 },
    { id: 4, numero_piso: 1, id_torre: 2 },
    { id: 5, numero_piso: 2, id_torre: 2 },
];

export const apartamentosMock = [
    { id: 1, numero_apartamento: "101", id_piso: 1, propietario: "Juan Pérez" },
    { id: 2, numero_apartamento: "102", id_piso: 1, propietario: "María López" },
    { id: 3, numero_apartamento: "201", id_piso: 2, propietario: "Carlos Ruiz" },
    { id: 4, numero_apartamento: "202", id_piso: 2, propietario: "Ana Torres" },
    { id: 5, numero_apartamento: "301", id_piso: 3, propietario: "Luis Mora" },
];

export const carritosMock = [
    { id: 1, nombre: "Carrito #1" },
    { id: 2, nombre: "Carrito #2" },
    { id: 3, nombre: "Carrito #3" },
    { id: 4, nombre: "Carrito #4" },
];