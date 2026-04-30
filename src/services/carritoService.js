import { carritosMock } from "../data/condominiosData";
import { fakeDelay } from "./_apiHelper";

const _carritos = [...carritosMock];

export const carritoService = {
    getAll: () => fakeDelay([..._carritos]),

    getById: (id) => fakeDelay(_carritos.find(c => c.id === id) || null),
};