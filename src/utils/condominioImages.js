// Imagen de cabecera por condominio.
//
// Por defecto se asigna una de las ilustraciones generadas (public/assets/condominios/).
// Cuando tengas una FOTO REAL de un condominio:
//   1. Pon el archivo en  public/assets/condominios/   (ej: los-olivos.jpg)
//   2. Mapea aquí su id ->  "/assets/condominios/los-olivos.jpg"
// No requiere cambios en la base de datos.

const OVERRIDES = {
    // 1: "/assets/condominios/los-olivos.jpg",
    // 5: "/assets/condominios/vista-mar.jpg",
};

const ILUSTRACIONES = [
    "/assets/condominios/cond-1.svg",
    "/assets/condominios/cond-2.svg",
    "/assets/condominios/cond-3.svg",
    "/assets/condominios/cond-4.svg",
    "/assets/condominios/cond-5.svg",
    "/assets/condominios/cond-6.svg",
];

const hashOf = (text = "") => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
};

export const imageForCondominio = (id, name = "") => {
    if (id != null && OVERRIDES[id]) return OVERRIDES[id];
    return ILUSTRACIONES[hashOf(name || String(id)) % ILUSTRACIONES.length];
};
