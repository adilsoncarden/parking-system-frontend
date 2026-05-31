// ═══════════════════════════════════════════════════════════
// DATOS MOCK del sistema
// Cuando llegue el backend, este archivo se borra y los
// servicios harán fetch a la API real.
// ═══════════════════════════════════════════════════════════

export const condominiosBase = [
    {
        id: 1,
        nombre: "Condominio Los Álamos",
        direccion: "Av. Primavera 123, San Borja, Lima",
        tipo: "residencial",
        imagen: null, // se carga desde el modal
        lat: -12.1059,
        lng: -76.9989,
    },
    {
        id: 2,
        nombre: "Residencial El Bosque",
        direccion: "Jr. Los Pinos 456, Surco, Lima",
        tipo: "premium",
        imagen: null,
        lat: -12.1391,
        lng: -76.9936,
    },
];

export const torresMock = [
    { id: 1, nombre: "Torre A", id_condominio: 1 },
    { id: 2, nombre: "Torre B", id_condominio: 1 },
    { id: 3, nombre: "Torre A", id_condominio: 2 },
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
    { id: 4, numero_apartamento: "202", id_piso: 2, propietario: "Ana García" },
    { id: 5, numero_apartamento: "301", id_piso: 3, propietario: "Pedro Sánchez" },
];

export const carritosMock = [
    { id: 1, nombre: "Carrito #1" },
    { id: 2, nombre: "Carrito #2" },
    { id: 3, nombre: "Carrito #3" },
    { id: 4, nombre: "Carrito #4" },
];