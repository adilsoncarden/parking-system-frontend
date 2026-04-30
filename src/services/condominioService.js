import { condominiosBase } from "../data/condominiosData";
import { fakeDelay, generateId } from "./_apiHelper";

let _cache = [...condominiosBase];

// ═══════════════════════════════════════════════════════════
// CONDOMINIO SERVICE
// Hoy: devuelve datos mock
// Mañana: cada método hará fetch('/api/condominios')
// ═══════════════════════════════════════════════════════════

export const condominioService = {
    getAll: () => fakeDelay([..._cache]),

    getById: (id) => fakeDelay(_cache.find(c => c.id === id) || null),

    create: (data) => {
        const nuevo = { ...data, id: generateId(_cache) };
        _cache = [..._cache, nuevo];
        return fakeDelay(nuevo);
    },

    update: (id, data) => {
        _cache = _cache.map(c => c.id === id ? { ...c, ...data } : c);
        return fakeDelay(_cache.find(c => c.id === id));
    },

    delete: (id) => {
        _cache = _cache.filter(c => c.id !== id);
        return fakeDelay({ success: true, id });
    },
};