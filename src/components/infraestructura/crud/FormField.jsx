const FormField = ({ label, children, required }) => (
    <div className="mb-3">
        <label className="form-label fw-medium">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
        </label>
        {children}
    </div>
);

export default FormField;
