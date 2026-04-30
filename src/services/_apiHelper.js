// ═══════════════════════════════════════════════════════════
// Helper que simula latencia de red
// CUANDO LLEGUE EL BACKEND: este archivo se reemplaza por el
// cliente HTTP real (axios o fetch con interceptor de JWT)
// ═══════════════════════════════════════════════════════════

// Simula una respuesta async de API
export const fakeDelay = (data, ms = 300) =>
    new Promise(resolve => setTimeout(() => resolve(data), ms));

// Genera nuevo ID (mientras no haya backend)
export const generateId = (collection) =>
    collection.length > 0 ? Math.max(...collection.map(item => item.id)) + 1 : 1;