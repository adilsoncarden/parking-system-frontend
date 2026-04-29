# 🚗 Sistema de Gestión de Condominios CondoSaaS

## 📌 Descripción del Proyecto

Plataforma web desarrollada para la administración moderna de condominios residenciales, enfocada en el control vehicular, gestión de estacionamientos y administración de activos comunes.

El sistema trabaja bajo arquitectura **SaaS (Software as a Service)**, permitiendo gestionar múltiples condominios desde una sola plataforma, manteniendo independencia de datos y configuración por cada cliente.

---

# 🎯 Objetivo General

Optimizar los procesos administrativos, operativos y de seguridad dentro de condominios mediante una solución digital escalable, segura y eficiente.

---

# 🚨 Problemática Actual

Muchos condominios manejan sus operaciones de forma manual o con herramientas dispersas, generando:

- Falta de control vehicular
- Ingresos no autorizados
- Demoras en portería
- Pérdida de registros
- Mal uso de activos comunes
- Cobros no controlados de multas
- Baja trazabilidad administrativa

---

# ✅ Solución Propuesta

Implementación de un sistema modular compuesto por:

## 🔹 Módulo Administrativo

- Gestión de condominios
- Torres, pisos y apartamentos
- Usuarios y roles
- Configuración de multas
- Gestión de carritos de carga
- Reportes generales

## 🔹 Módulo Parqueo y Portería

- Registro de ingreso y salida vehicular
- Escaneo OCR de placas
- Validación automática de acceso
- Registro manual de contingencia
- Historial vehicular

---

# 🧱 Arquitectura del Sistema

Modelo Multi-Tenant SaaS:

```text
1 Plataforma = N Condominios
Cada condominio = Datos independientes
```
