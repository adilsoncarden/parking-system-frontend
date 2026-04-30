import { useReducer } from "react";
import { AppContext } from "./AppContext";

const initialState = {
    prestamos: [],
};

function appReducer(state, action) {
    switch (action.type) {
        case "AGREGAR_PRESTAMO":
            return {
                ...state,
                prestamos: [...state.prestamos, action.payload],
            };
        case "DEVOLVER_PRESTAMO":
            return {
                ...state,
                prestamos: state.prestamos.map(p =>
                    p.id === action.payload
                        ? { ...p, estado: "devuelto", hora_fin: new Date() }
                        : p
                ),
            };
        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);
    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}