import { useState, useRef } from "react";

const ImageUploader = ({ imagenInicial, onImagenChange }) => {
    const [preview, setPreview] = useState(imagenInicial || null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const procesarArchivo = (file) => {
        if (!file) return;

        // Validar que sea imagen
        if (!file.type.match("image/jpeg") && !file.type.match("image/jpg") && !file.type.match("image/png")) {
            alert("Solo se permiten imágenes JPG o PNG");
            return;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("La imagen no puede pesar más de 5MB");
            return;
        }

        // Convertir a base64 para preview y guardar
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            onImagenChange(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        procesarArchivo(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        procesarArchivo(file);
    };

    const eliminarImagen = (e) => {
        e.stopPropagation();
        setPreview(null);
        onImagenChange(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div>
            {/* Zona de drag-and-drop */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                    border: dragActive ? "2px solid #4e6ef2" : "2px dashed #6c757d",
                    borderRadius: "10px",
                    padding: preview ? "0" : "30px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: dragActive ? "rgba(78, 110, 242, 0.1)" : "transparent",
                    transition: "all 0.2s",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {preview ? (
                    <div style={{ position: "relative" }}>
                        <img
                            src={preview}
                            alt="Preview"
                            style={{
                                width: "100%",
                                height: "180px",
                                objectFit: "cover",
                                display: "block",
                            }}
                        />
                        <button
                            type="button"
                            onClick={eliminarImagen}
                            className="btn btn-sm btn-danger"
                            style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                borderRadius: "50%",
                                width: "32px",
                                height: "32px",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                ) : (
                    <>
                        <i className="bi bi-cloud-upload fs-1 text-muted"></i>
                        <p className="mb-1 mt-2 fw-bold">Arrastra una imagen aquí</p>
                        <p className="text-muted small mb-0">o haz clic para seleccionar (JPG/PNG, máx 5MB)</p>
                    </>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                style={{ display: "none" }}
            />
        </div>
    );
};

export default ImageUploader;