# ADR-001 — Stack de Testing para TaskFlow
**Fecha:** 21 de Abril de 2026

## Título
Usar Vitest, Supertest y Playwright como el stack unificado de testing para TaskFlow.

## Estado
Aceptado

## Contexto
El proyecto TaskFlow cuenta con un frontend en React 18 usando Vite (TypeScript y ESM) y un backend en Node.js con Express, Prisma ORM y TypeScript (CommonJS/ESM vía tsconfig).
Nuestras restricciones principales son:
1. El pipeline de CI/CD corre en GitHub Actions, por lo que las herramientas deben poder ejecutarse de forma `headless` sin configuración manual.
2. El proyecto requiere soporte estricto de TypeScript nativo o vía `@types`.
3. Un único comando `npm run test` debe poder ejecutar toda la suite (unitaria, integración y E2E) en el entorno de integración continua.
Si no elegimos herramientas integradas a este ecosistema (particularmente a Vite y TypeScript), incurriríamos en sobrecarga de mantención de configuraciones complejas (como integraciones de Jest en Vite) o de comandos redundantes.

## Decisión
Elegimos:
- **Unit Testing**: **Vitest**. Porque su integración nativa con el ecosistema Vite del frontend elimina la fricción de configuración y soporta TypeScript out-of-the-box. Además, provee una API compatible con Jest, agilizando el aprendizaje.
- **Integration/API Testing**: **Supertest + Vitest**. Porque Supertest es el estándar para levantar apps Express en memoria, y al ejecutar sus aserciones con Vitest, unificamos el framework de unit y de integración y su reporte de cobertura bajo una única herramienta de CLI.
- **E2E Testing**: **Playwright**. Porque ofrece un robusto soporte multi-navegador, trazabilidad integrada (Trace Viewer) y, fundamentalmente, soporte nativo de TypeScript con locutores adaptados a atributos `data-testid` que ya estamos instrumentando en TaskFlow.

Adicionalmente, usaremos **Postman** (con Newman opcionalmente) para la *exploración visual* y como *documentación viva* de los endpoints, aunque la trazabilidad en CI/CD se manejará prioritariamente en Vitest/Supertest.

## Alternativas consideradas
- **Jest (Unit)**: Se descartó porque requiere configuraciones adicionales (`ts-jest`, babel) de Babel/TypeScript y suele tener conflictos para integrarse de forma fluida con proyectos base Vite y ESM sin sobrecarga de configuración.
- **Mocha + Chai (Unit)**: Sintaxis desactualizada para el ecosistema moderno y carece de soporte out-of-the-box de TypeScript sin varias dependencias secundarias.
- **Cypress (E2E)**: Se evaluó, pero Playwright tiene una ejecución `headless` por defecto mucho más veloz en pipelines de CI/CD para Next/React, además de soportar nativamente Safari/WebKit y múltiples contextos limpios rápidamente. Selenium fue descartado por baja modernidad y APIs verbosas.
- **Solo Postman (API)**: Rechazado para CI/CD principal, es complejo combinar sus reportes de código de forma unificada con el reporte global de cobertura unitaria/TS comparado a usar Supertest con Vitest en el mismo pipeline.

## Consecuencias
- **Ventajas**: El pipeline principal estará dominado por el runner de Vitest y de Playwright, los cuales entienden `.ts` directamente. Esto minimiza el riesgo de bugs de dependencias y de compilación en pruebas. Un solo comando de suite unificará ambas ramas.
- **Trade-offs**: Postman quedará relegado mayormente al desarrollo manual exploratorio, necesitando sincronizarse manualmente la colección si cambian las rutas; esto significa duplicidad lógica contra los tests de Supertest (que son la fuente principal de verdad).
- **Onboarding**: Será ágil dado que Playwright y Vitest comparten convenciones modernas, aunque requerirá que los integrantes comprendan el patrón de Page Object Model (introducido para Playwright en TaskFlow).

## Links y referencias
- [Vitest Documentation](https://vitest.dev/)
- [Playwright TypeScript Documentation](https://playwright.dev/docs/intro)
- [Vite Testing Guidance](https://vitejs.dev/guide/features.html#testing)
