# Reporte Final: Seguridad y Accesibilidad en TaskFlow

Este reporte consolidado documenta los análisis de seguridad y accesibilidad, los hallazgos y las User Stories de remediación correspondientes a la **Guía de Práctica del Módulo 2 (Clase 12 — Testing de Seguridad y Accesibilidad)**.

---

## 1. Seguridad

### Paso 1 — Análisis de dependencias (`npm audit`)

#### Ejecución en el backend (`apps/api`)
```bash
cd apps/api
npm audit --audit-level=high
```
**Resultado**:
* Se encontraron **5 vulnerabilidades de severidad alta** (además de 14 moderadas y 2 críticas en el análisis general).
* Las vulnerabilidades de severidad alta detectadas en las dependencias de la API incluyen:
  * **form-data**: Inyección CRLF mediante nombres de campo multipartes no sanitizados.
  * **lodash**: Inyección de código y contaminación de prototipos.
  * **path-to-regexp**: Denegación de servicio por expresiones regulares (ReDoS).
  * **tmp**: Escritura/manipulación arbitraria de archivos temporales mediante path traversal.

#### Ejecución en la raíz del proyecto
```bash
npm audit --audit-level=moderate
```
**Resultado**:
* Se detectaron **26 vulnerabilidades en total** (1 de nivel bajo, 16 moderadas, 6 de nivel alto y 3 críticas).
* Destaca la vulnerabilidad crítica en:
  * **shell-quote**: Falta de escape de nuevas líneas (`\n`) en valores de argumentos pasados por consola, facilitando ataques de inyección de comandos.

---

### Paso 2 — Obtención de token JWT

Petición de inicio de sesión realizada para la usuaria **Alice**:
```bash
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@taskflow.dev","password":"Password1"}'
```

**Token A obtenido**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXAzNXN5OWwwMDAwMTI5eHZxdXQ5a3dqIiwiaWF0IjoxNzgyMTgxMTM3LCJleHAiOjE3ODIyNjc1Mzd9.HK9m7EfYKuRBL2315hOZpOcGlWggFoFOtUVKPEUC1UI
```

---

### Paso 3 — Inspección de cabeceras de seguridad

#### Peticiones ejecutadas:
1. Inspección de endpoint de salud `/health`:
   ```bash
   curl -I http://localhost:3001/health
   ```
2. Inspección de endpoint protegido `/projects`:
   ```bash
   curl -I http://localhost:3001/projects \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXAzNXN5OWwwMDAwMTI5eHZxdXQ5a3dqIiwiaWF0IjoxNzgyMTgxMTM3LCJleHAiOjE3ODIyNjc1Mzd9.HK9m7EfYKuRBL2315hOZpOcGlWggFoFOtUVKPEUC1UI"
   ```

#### Cabeceras devueltas por el servidor:
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 15
ETag: W/"f-VaSQ4oDUiZblZNAEkkN+sX+q3Sg"
Date: Tue, 23 Jun 2026 02:19:15 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

**Análisis**:
* ❌ **Ausencia de políticas de seguridad**: Faltan las cabeceras `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options` y `X-Content-Type-Options`.
* ⚠️ **Exposición de información**: Se incluye `X-Powered-By: Express`, revelando innecesariamente la pila tecnológica del servidor.

---

### Paso 4 — Prueba de IDOR (Insecure Direct Object Reference)

#### 1. Creación de un proyecto privado como Alice
```bash
curl -s -X POST http://localhost:3001/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_A>" \
  -d '{"name":"Proyecto Privado de Alice"}'
```
* **ID del proyecto creado**: `cmqq0o34i0001wig3rgdtegmj`

#### 2. Inicio de sesión como Bob
```bash
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@taskflow.dev","password":"Password1"}'
```
* **Token B obtenido**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXAzNXN5OW4wMDAxMTI5eHBxcmxzdDdnIiwiaWF0IjoxNzgyMTgxMjI2LCJleHAiOjE3ODIyNjc6MjZ9.3BFpCskpoO3JfcjkfWf7ysMzhLFv1f48vl_DMjDqkJ8`

#### 3. Ejecución de la prueba de acceso cruzado
Bob intenta obtener el proyecto privado de Alice usando su `TOKEN_B`:
```bash
curl -i -s http://localhost:3001/projects/cmqq0o34i0001wig3rgdtegmj \
  -H "Authorization: Bearer <TOKEN_B>"
```
**Respuesta**:
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{"error":"Not a project member","message":"Not a project member"}
```

**Resultado de la prueba**:
* El control de acceso funciona correctamente. El backend valida adecuadamente la membresía del proyecto y deniega el acceso a usuarios no autorizados (`403 Forbidden`).

---

## 2. Accesibilidad

### Paso 1 — Instalación y Configuración
* Se instaló la suite de accesibilidad `@axe-core/playwright` como dependencia de desarrollo desde la raíz del monorepositorio.
* Se configuró el archivo de pruebas [`e2e/playwright/tests/a11y.spec.ts`](file:///Users/joaquingasco/Desktop/1erS_2026/testing/taskflow/e2e/playwright/tests/a11y.spec.ts) para auditar las vistas de Login (`/login`) y Proyectos (`/projects`) mediante el motor AxeBuilder.

---

### Pasos 2 y 3 — Ejecución y Detección de Violaciones (Antes de las Correcciones)
Ejecución inicial de los tests:
```bash
npx playwright test e2e/playwright/tests/a11y.spec.ts --reporter=line
```

**Violaciones detectadas**:
1. **Vista Login**:
   * **color-contrast (SC 1.4.3 - Contraste Mínimo - AA)**: El botón "Entrar" (`bg-teal-600` con `text-white`) y el enlace "Registrate" (`text-teal-600` sobre fondo blanco) poseen un ratio de contraste de ~4.13:1 (exige un mínimo de 4.5:1).
   * **link-in-text-block (SC 1.4.1 - Uso del Color - A)**: El enlace "Registrate" dentro del bloque de texto no tiene indicador no cromático estático (como subrayado), dependiendo únicamente del color.
2. **Vista Proyectos**:
   * **color-contrast (SC 1.4.3 - Contraste Mínimo - AA)**: El botón "+ Nuevo proyecto" (`bg-teal-600` con `text-white`) y el logo "TaskFlow" (`text-teal-600` sobre fondo blanco) poseen una relación de contraste insuficiente de ~4.13:1.

---

### Paso 4 — Corrección de las Violaciones en el Código Fuente
Se implementaron los siguientes cambios en la aplicación React (`apps/web/src/`):

1. **Aumento de la Relación de Contraste** (`color-contrast`):
   * Se sustituyó la clase `bg-teal-600` por `bg-teal-700` (`#0f766e`) en los botones de acción principal, elevando el contraste de color a **5.75:1** (superando el umbral WCAG AA de 4.5:1).
   * Se cambió el color de los enlaces y marcas de `text-teal-600` a `text-teal-700` (`#0f766e`), logrando un contraste de **5.75:1**.
2. **Indicación Visual Estructural para Enlaces** (`link-in-text-block`):
   * Se aplicó la clase `underline` por defecto al enlace de registro en `LoginPage.tsx`.

*Archivos modificados*:
* [`apps/web/src/pages/LoginPage.tsx`](file:///Users/joaquingasco/Desktop/1erS_2026/testing/taskflow/apps/web/src/pages/LoginPage.tsx)
* [`apps/web/src/pages/ProjectsPage.tsx`](file:///Users/joaquingasco/Desktop/1erS_2026/testing/taskflow/apps/web/src/pages/ProjectsPage.tsx)
* [`apps/web/src/components/Navbar.tsx`](file:///Users/joaquingasco/Desktop/1erS_2026/testing/taskflow/apps/web/src/components/Navbar.tsx)

#### Re-ejecución del test de accesibilidad:
```bash
npx playwright test e2e/playwright/tests/a11y.spec.ts --reporter=line
```
**Resultado posterior**:
* **4 passed (2.5s)**: Se verificaron exitosamente ambas vistas y se comprobó que **todas las violaciones de accesibilidad desaparecieron por completo (0 violaciones encontradas)**.

---

## 3. Plantillas de Hallazgos y User Stories de Remediación

### 3.1 Hallazgos de Seguridad

#### Hallazgo de Seguridad N.° 01 (SEC-01)
* **ID**: SEC-01
* **Título**: Vulnerabilidades críticas y de severidad alta en dependencias de terceros (`npm audit`)
* **Severidad**: HIGH
* **Descripción**: La ejecución de `npm audit` revela que el proyecto utiliza versiones de dependencias desactualizadas con vulnerabilidades conocidas, destacando `shell-quote` (severidad crítica, permite inyección de comandos en terminales) y `path-to-regexp` / `lodash` / `tmp` / `form-data` (severidad alta, permiten inyección de código, ReDoS y manipulación de archivos temporales).
* **Pasos de reproducción**:
  1. Acceder al directorio raíz del proyecto en la terminal.
  2. Ejecutar el comando: `npm audit --audit-level=moderate`.
  3. Inspeccionar las alertas devueltas en consola para constatar los paquetes vulnerables.
* **Impacto**:
  * Consumo masivo de CPU y denegación de servicio (DoS) del backend de TaskFlow si un atacante explota rutas vulnerables de expresiones regulares (ReDoS).
  * Compromiso o ejecución de código/comandos arbitrarios en el servidor a través de librerías vulnerables (ej. shell-quote).
* **Remediación propuesta**:
  * Ejecutar `npm audit fix` para los parches directos compatibles.
  * Actualizar manualmente en `package.json` las dependencias principales a versiones seguras (como `vitest`, `vite` y `@cucumber/cucumber`).

#### Hallazgo de Seguridad N.° 02 (SEC-02)
* **ID**: SEC-02
* **Título**: Ausencia de cabeceras de seguridad HTTP básicas y divulgación de firma del servidor
* **Severidad**: MEDIUM
* **Descripción**: El backend Express no configura ni responde con cabeceras HTTP de seguridad fundamentales (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) y expone abiertamente la firma tecnológica del backend `X-Powered-By: Express`.
* **Pasos de reproducción**:
  1. Levantar el backend de la aplicación ejecutando `npm run dev`.
  2. Enviar una petición HTTP GET para obtener cabeceras mediante curl: `curl -I http://localhost:3001/health`.
  3. Examinar el listado de cabeceras de respuesta recibidas para constatar la presencia de `X-Powered-By: Express` y la ausencia de cabeceras de mitigación.
* **Impacto**:
  * Vulnerabilidad a ataques de clickjacking y cross-site scripting (XSS) al no configurar políticas de renderizado restrictivas en el navegador.
  * Facilita a atacantes la búsqueda de exploits específicos para Node/Express mediante la información expuesta del framework subyacente.
* **Remediación propuesta**:
  * Instalar e integrar el middleware `helmet` en `apps/api/src/app.ts` (`app.use(helmet())`) para deshabilitar automáticamente `X-Powered-By` y añadir cabeceras de seguridad robustas por defecto.

---

### 3.2 Hallazgos de Accesibilidad

#### Hallazgo de Accesibilidad N.° 01 (ACC-01)
* **ID**: ACC-01
* **SC WCAG 2.1**: SC 1.4.3: Contraste (Mínimo)
* **Nivel**: AA
* **Principio POUR**: Perceptible
* **Vista afectada**: Vista Login (Botón "Entrar") y Vista Proyectos (Botón "+ Nuevo proyecto")
* **Descripción del fallo**: La combinación de fondo de botón `bg-teal-600` con texto de color blanco `text-white` posee un contraste de 4.13:1, inferior al ratio mínimo de 4.5:1 exigido para texto normal bajo el estándar WCAG 2.1 AA.
* **Fix propuesto**: Reemplazar la clase `bg-teal-600` por `bg-teal-700` (`#0f766e`) en los botones del frontend, elevando la relación de contraste a **5.75:1**.

#### Hallazgo de Accesibilidad N.° 02 (ACC-02)
* **ID**: ACC-02
* **SC WCAG 2.1**: SC 1.4.1: Uso del Color
* **Nivel**: A
* **Principio POUR**: Perceptible
* **Vista afectada**: Vista Login (Enlace "Registrate")
* **Descripción del fallo**: El enlace de registro dentro del bloque de texto se diferenciaba de este exclusivamente a través del color (`text-teal-600`), careciendo de una distinción no cromática (como subrayado por defecto), violando el principio de no depender exclusivamente del color.
* **Fix propuesto**: Aplicar la clase `underline` por defecto al enlace en `LoginPage.tsx` para que sea distinguible de forma estática estructural.

#### Hallazgo de Accesibilidad N.° 03 (ACC-03)
* **ID**: ACC-03
* **SC WCAG 2.1**: SC 1.4.3: Contraste (Mínimo)
* **Nivel**: AA
* **Principio POUR**: Perceptible
* **Vista afectada**: Navbar (Logo "TaskFlow") y Vista Login (Enlace "Registrate")
* **Descripción del fallo**: El texto coloreado con `text-teal-600` sobre el fondo blanco tiene un contraste de 4.13:1, lo cual afecta la visualización de enlaces y elementos destacados para usuarios con dificultades de visión.
* **Fix propuesto**: Cambiar el texto a la clase `text-teal-700` (`#0f766e`), elevando la relación de contraste seguro a **5.75:1**.

---

### 3.3 User Stories de Remediación

#### US de Seguridad — Hallazgo más crítico (Dependencias y Cabeceras)
* **Como**: Desarrollador del sistema / Administrador de seguridad.
* **Quiero**: Actualizar dependencias de producción críticas y ocultar la firma tecnológica del backend.
* **Para**: Reducir la superficie de ataque mitigando riesgos de inyección de comandos e identificación automatizada del servidor.
* **Criterios de Aceptación (CA)**:
  * **CA-01**: La ejecución de `npm audit --audit-level=high` en la carpeta `apps/api` no debe arrojar vulnerabilidades de nivel crítico ni alto.
  * **CA-02**: Todas las respuestas HTTP del backend deben excluir la cabecera `X-Powered-By`.
  * **CA-03**: La suite de pruebas de integración de la API debe pasar al 100% tras la actualización de las dependencias.

#### US de Accesibilidad — Hallazgo más grave (Contraste Mínimo)
* **Como**: Usuario con baja visión o dificultades visuales.
* **Quiero**: Que los botones y enlaces de la aplicación tengan un contraste de color de al menos 4.5:1.
* **Para**: Identificar y leer los elementos accionables del sistema de manera clara, autónoma y sin fatiga ocular.
* **Criterios de Aceptación (CA)**:
  * **CA-01**: Todos los botones de acción principal (ej. "Entrar", "+ Nuevo proyecto") deben poseer una relación de contraste superior a 4.5:1 contra el texto blanco.
  * **CA-02**: Los enlaces embebidos en bloques de texto deben tener subrayado u otra distinción no basada únicamente en el color.
  * **CA-03**: El analizador Axe-Builder integrado en Playwright debe retornar 0 fallas de contraste en todas las pruebas de regresión.
