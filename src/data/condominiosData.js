// Datos base de condominios — vinculados a los carritosMock de CarritosPage
export const condominiosBase = [
    {
        id: 1,
        nombre: "Condominio Los Álamos",
        direccion: "Av. Primavera 123",
        badge: "Residencial",
        badgeColor: "#4e6ef2",
        imagen: "/images/condominios/condominio-los-alamos.jpg",
        // IDs de carritos que pertenecen a este condominio
        carritoIds: [1, 2],
    },
    {
        id: 2,
        nombre: "Residencial El Bosque",
        direccion: "Jr. Los Pinos 456",
        badge: "Premium",
        badgeColor: "#16a34a",
        imagen: "/images/condominios/condominio-el-bosque.jpg",
        carritoIds: [3, 4],
    },
];