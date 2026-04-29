import React, { useEffect } from 'react';
import CarritosPage from './CarritosPage';

// Este wrapper solo escucha los cambios del localStorage
// que CarritosPage guarda, y avisa a CondominiosPage
const CarritosPageWrapper = () => {

    useEffect(() => {
        // Avisa a CondominiosPage que revise el localStorage
        window.dispatchEvent(new Event("prestamos-updated"));
    }, []);

    return <CarritosPage />;
};

export default CarritosPageWrapper;