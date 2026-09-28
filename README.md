# Actividad 03 — Backend Seguro y Base de Datos
## Proyecto Socioformativo: Feria Agroecológica Santa Cruz (EcoFeria)

**Universidad Privada Domingo Savio (UPDS)**  
**Carrera:** Ingeniería en Sistemas  
**Asignatura:** Programación Web II — Turno Medio Día  
**Docente:** Ing. Jimmy Requena (Bolivianotech)  
**Estudiantes (Pod de Ingeniería):**  
- **Eduar Heredia Chávez** (Líder de Dominio, Arquitecto de Datos y Frontend)  
- **Limbert David Quispe Osco** (Auditor de Backend, Ciberseguridad OWASP y Presupuesto Web)  
**Copiloto AI:** Antigravity AI (AI-DLC)  
**Santa Cruz de la Sierra — Bolivia (2026)**

---

## 1. Visión General del Proyecto

Este repositorio contiene la entrega completa del **Bloque III (Fase Mob Construction)** correspondiente a la **Actividad 03**:
- **Desarrollo de la API REST:** Construida en **Python 3.11** y **Flask 3**, implementando el patrón **Application Factory** y dividida en 4 Blueprints modulares (`salud`, `auth`, `tareas`, `ecoforia`).
- **Documentación Interactiva:** Generada automáticamente en `/docs` mediante **Flask-Smorest** y especificación **OpenAPI 3.0.3 / Swagger UI**, con integración del esquema de autorización `BearerAuth`.
- **Autenticación y Ciberseguridad JWT:** Protocolo de doble token: **Access Token** de 15 minutos (corta duración) y **Refresh Token** de 7 días (larga duración con rotación estricta y margen *leeway* de 10 segundos).
- **Persistencia y Aislamiento RLS en PostgreSQL / Supabase:** Implementación de **Row Level Security (RLS)** mediante políticas `USING` y `WITH CHECK`. Demostración de aislamiento multi-tenant (*Ana vs. Beto*): ante intentos de acceso no autorizado a recursos ajenos, la API responde **`404 Not Found`** para prevenir ataques BOLA y enumeración de IDs.
- **Calidad Certificada:** Batería de **22 pruebas automatizadas en Pytest** con 100% de éxito en 0.29 segundos.
- **Trazabilidad Integral:** Mapeo 1:1 con los casos de uso **CU-01 al CU-04** definidos en la Actividad 01 y consumidos por el Frontend SPA de la Actividad 02.

---

## 2. Estructura del Repositorio

```text
Actividad_3/
├── backend/                  # API REST en Python Flask 3 con Blueprints
│   ├── app/
│   │   ├── __init__.py       # Application Factory: create_app()
│   │   ├── config.py         # Configuraciones (Dev, Prod, Test, JWT, CORS)
│   │   ├── extensions.py     # Flask-Smorest Api y Flask-CORS
│   │   ├── auth/             # Módulo de Autenticación, JWT utils y @token_required
│   │   ├── salud/            # Endpoint de diagnóstico (/api/salud)
│   │   ├── tareas/           # CRUD de tareas con RLS (Laboratorio Ana vs. Beto)
│   │   └── ecoforia/         # Endpoints CU-01 a CU-04 (Cosechas y Pedidos)
│   ├── sql/
│   │   └── 01_schema_rls.sql # Script DDL con políticas RLS (USING / WITH CHECK)
│   ├── tests/
│   │   ├── conftest.py       # Fixtures de Pytest (tokens de Ana y Beto)
│   │   └── test_api.py       # 22 pruebas automatizadas
│   ├── Procfile & render.yaml# Configuración para despliegue en Render
│   ├── requirements.txt      # Dependencias de producción y pruebas
│   ├── run.py                # Arranque local (http://localhost:5000)
│   └── README.md             # Documentación técnica del backend
├── frontend/                 # Frontend SPA en React 18, Vite y Tailwind CSS v4 (Actividad 02)
├── INFORME_ACTIVIDAD_03.md   # Informe técnico formal con carátula UPDS y checklist OWASP
├── INFORME_ACTIVIDAD_03.html # Versión imprimible / Exportable a PDF con membrete
└── README.md                 # Este documento
```

---

## 3. Guía de Ejecución Rápida

### 3.1. Backend Local
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1       # En Windows
pip install -r requirements.txt
python run.py
```
- **API:** `http://localhost:5000`
- **Swagger UI:** `http://localhost:5000/docs`
- **OpenAPI JSON:** `http://localhost:5000/openapi.json`
- **Health Check:** `http://localhost:5000/api/salud`

### 3.2. Ejecutar Pruebas Automatizadas (Pytest)
```bash
cd backend
pytest -v
```
*Resultado: 22 pruebas pasando al 100%.*

### 3.3. Frontend Local
```bash
cd frontend
npm install
npm run dev
```

---

## 4. Documentación e Informe

El informe técnico formal de la actividad con el **Checklist OWASP (Diapositiva 6)**, matrices AI-DLC, trazabilidad y guion de defensa se encuentra en:
- Markdown: [`INFORME_ACTIVIDAD_03.md`](INFORME_ACTIVIDAD_03.md)
- Web / PDF: [`INFORME_ACTIVIDAD_03.html`](INFORME_ACTIVIDAD_03.html)
