import { torresMock } from "../data/condominiosData";
import { fakeDelay, generateId } from "./_apiHelper";

let _cache = [...torresMock];

export const torreService = {
    getAll: () => fakeDelay([..._cache]),

    getByCondominio: (id_condominio) =>
        fakeDelay(_cache.filter(t => t.id_condominio === id_condominio)),

    getById: (id) => fakeDelay(_cache.find(t => t.id === id) || null),

    create: (data) => {
        const nuevo = { ...data, id: generateId(_cache) };
        _cache = [..._cache, nuevo];
        return fakeDelay(nuevo);
    },

    update: (id, data) => {
        _cache = _cache.map(t => t.id === id ? { ...t, ...data } : t);
        return fakeDelay(_cache.find(t => t.id === id));
    },

    delete: (id) => {
        _cache = _cache.filter(t => t.id !== id);
        return fakeDelay({ success: true, id });
    },
};