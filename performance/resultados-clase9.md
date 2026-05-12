# Resultados de Performance - Clase 9

Valores obtenidos en el load test y el spike test.

## Comparativa Load vs Spike

| Métrica | Load (50 VUs) | Spike (200 VUs) | Threshold (SLO) | Cumple? |
| :--- | :--- | :--- | :--- | :--- |
| **p95 total (latencia)** | 17.08 ms | 257.14 ms | < 500 ms | **SÍ** |
| **p99 total (latencia)** | 22.61 ms | 398.75 ms | < 1000 ms | **SÍ** |
| **error_rate** | 0.00% | 0.00% | < 1% | **SÍ** |
| **list_duration p95** | 3.84 ms | 160.32 ms | < 400 ms | **SÍ** |
| **tasks_duration p95** | 20.65 ms | 287.33 ms | < 400 ms | **SÍ** |
| **create_task_duration p95** | 6.88 ms | 281.20 ms | < 500 ms | **SÍ** |
| **Throughput (req/s)** | 56.07 req/s | 220.46 req/s | — | — |