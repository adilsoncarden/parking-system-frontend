import { pisosMock } from "../data/condominiosData";
import { fakeDelay, generateId } from "./_apiHelper";

let _cache = [...pisosMock];

export const pisoService = {
    getAll: () => fakeDelay([..._cache]),

    getByTorre: (id_torre) =>
        fakeDelay(_cache.filter(p => p.id_torre === id_torre)),

    getById: (id) => fakeDelay(_cache.find(p => p.id === id) || null),

    create: (data) => {
        const nuevo = { ...data, id: generateId(_cache) };
        _cache = [..._cache, nuevo];
        return fakeDelay(nuevo);
    },

    update: (id, data) => {
        _cache = _cache.map(p => p.id === id ? { ...p, ...data } : p);
        return fakeDelay(_cache.find(p => p.id === id));
    },

    delete: (id) => {
        _cache = _cache.filter(p => p.id !== id);
        return fakeDelay({ success: true, id });
    },
};