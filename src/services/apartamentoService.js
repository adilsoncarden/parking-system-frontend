import { apartamentosMock } from "../data/condominiosData";
import { fakeDelay, generateId } from "./_apiHelper";

let _cache = [...apartamentosMock];

export const apartamentoService = {
    getAll: () => fakeDelay([..._cache]),

    getByPiso: (id_piso) =>
        fakeDelay(_cache.filter(a => a.id_piso === id_piso)),

    getById: (id) => fakeDelay(_cache.find(a => a.id === id) || null),

    create: (data) => {
        const nuevo = { ...data, id: generateId(_cache) };
        _cache = [..._cache, nuevo];
        return fakeDelay(nuevo);
    },

    update: (id, data) => {
        _cache = _cache.map(a => a.id === id ? { ...a, ...data } : a);
        return fakeDelay(_cache.find(a => a.id === id));
    },

    delete: (id) => {
        _cache = _cache.filter(a => a.id !== id);
        return fakeDelay({ success: true, id });
    },
};