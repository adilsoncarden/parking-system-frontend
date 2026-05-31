const getSwal = () => {
    if (!window.Swal) {
        console.error("SweetAlert2 no está cargado");
        return null;
    }
    return window.Swal;
};

export const confirmAction = async ({
    title = "¿Confirmar acción?",
    text = "",
    confirmText = "Sí, confirmar",
    cancelText = "Cancelar",
    icon = "warning",
}) => {
    const Swal = getSwal();
    if (!Swal) return false;
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: "#435ebe",
        cancelButtonColor: "#6c757d",
    });
    return result.isConfirmed;
};

export const confirmDelete = (itemLabel = "este registro") =>
    confirmAction({
        title: "¿Eliminar?",
        text: `Se eliminará ${itemLabel}. Esta acción no se puede deshacer.`,
        confirmText: "Sí, eliminar",
        icon: "warning",
    });

export const showSuccess = (message, title = "Éxito") => {
    const Swal = getSwal();
    if (!Swal) return;
    return Swal.fire({ icon: "success", title, text: message, confirmButtonColor: "#435ebe" });
};

export const showError = (message, title = "Error") => {
    const Swal = getSwal();
    if (!Swal) return;
    return Swal.fire({ icon: "error", title, text: message, confirmButtonColor: "#435ebe" });
};
