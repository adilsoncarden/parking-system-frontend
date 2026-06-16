// Color, degradado e iniciales deterministas por nombre, para darle identidad
// visual a cada condominio sin necesidad de subir un logo.

const hashOf = (text = "") => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
};

const AVATAR_COLORS = [
    "#5a8dee", "#39afd1", "#ffab00", "#39da8a",
    "#fc544b", "#826af9", "#ff6c40", "#00cfdd",
];

// Pares de colores para las cabeceras con degradado (texto blanco legible).
const GRADIENTS = [
    ["#667eea", "#764ba2"],
    ["#2193b0", "#6dd5ed"],
    ["#11998e", "#38ef7d"],
    ["#fc466b", "#3f5efb"],
    ["#f7797d", "#f8836b"],
    ["#1488cc", "#2b32b2"],
    ["#ff5f6d", "#ffc371"],
    ["#36d1dc", "#5b86e5"],
];

export const colorForName = (text = "") => AVATAR_COLORS[hashOf(text) % AVATAR_COLORS.length];

export const gradientForName = (text = "") => {
    const [a, b] = GRADIENTS[hashOf(text) % GRADIENTS.length];
    return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
};

export const initialsForName = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "C";
