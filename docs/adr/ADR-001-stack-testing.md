# ADR-001 — Stack de Testing para TaskFlow
**Fecha:** 21/04/2026

## Título
Usar Vitest, Supertest y Playwright como ecosistema base de testing para TaskFlow.

## Estado
Aceptado

## Contexto
Taskflow requiere de soporte continuo a Typescript mediante el flujo de backend (Node/Express) a frontend (Vite/React). Se necesita una herramienta agil, cuyas automatizaciones se puedan agrupar facilmente (npm run test) para ser usadas en integracion continua.

## Decisión
Elegimos Vitest para los Unit Tests en front y back debido a su integracion nativa con el ecosistema de Vite. Ademas tambien decidimos hacer uso de Supertest interactuando con Vitest para la subcapa de integracion/API, dado que evaluan las aplicaciones de Express in-memory de forma rapida.
Finalmente, Playwright sera utilizado para E2E debido a su estabilidad robusta probando browsers invisibles y generando traces a nivel CI/CD con TS puro.

## Alternativas consideradas
- **Jest**: Se descarto debido a que requeriria un setup mas tedioso para hacerlo funcionar con Vite, ademas de que podria causar problemas de rendimiento si se quisiera escalar el proyecto.
- **Cypress**: Se evaluo, pero Playwright tiene una ejecucion headless mas veloz en pipelines de CI/CD para Next y React, ademas de soportar una coleccion de browser mas amplia de forma nativa.

## Consecuencias
- **Ventajas**: El pipeline principal estará dominado por el runner de Vitest y de Playwright, los cuales entienden .ts directamente. Esto minimiza el riesgo de bugs de dependencias y de compilacion en pruebas.
- **Trade-offs**: Postman quedara encargado mayormente al desarrollo manual exploratorio, necesitando sincronizarse manualmente la coleccion si cambian las rutas; esto significa que la logica quede duplicada contra los tests de Supertest (que son la fuente principal de verdad).
- **Onboarding**: Será ágil dado que Playwright y Vitest comparten convenciones modernas.
