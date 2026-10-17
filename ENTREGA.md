# Entrega · Laboratorio 3.1 · Introducción a la automatización de pruebas

**Equipo:** `equipo-1` · **Integrantes:** _nombres_ · **Repositorio:** https://github.com/NicolasDev256/Equipo-automatizacion

> Respondan aquí, en este archivo, y háganle commit. Sean breves y concretos: una frase buena vale más que un párrafo.

## 1. ¿Qué automatizamos y por qué? (decisión)

| Criterio (US-xx · CAy) | ¿Automatizamos? | Por qué (frecuencia · riesgo · estabilidad · facilidad de verificar) |
|---|---|---|
| US-04 · CA2 | Sí | Riesgo alto (vender más de lo que hay). El alert se captura fácil y el resultado es un número. |
| US-04 · CA3 | Sí | Mismo riesgo de stock, pero en dos pasos: a mano casi nadie lo prueba. Encontró un bug. |
| US-05 · CA2 | Sí | Otra entrada al mismo riesgo de stock. Un clic y comparar un número. |
| US-06 · CA2 | Sí | Cantidades en 0 o negativas dañan el total. Fácil de verificar. Encontró un bug. |
| US-07 · CA2 | Sí | Flujo muy usado y estable. Se comprueba con un texto y un valor. |
| US-09 · CA1 | Sí | Afecta el dinero cobrado. El resultado es un valor exacto. |
| US-09 · CA3 | Sí (por datos) | Muchas variantes del mismo caso: perfecto para una tabla de datos. Encontró un bug con minúsculas. |
| US-10 · CA1 y CA2 | Sí | Se corren en cada cambio del carrito. CA2 encontró un bug. |
| US-11 · CA2 y US-12 · CA2 | Sí | Riesgo más alto (cálculo de dinero). El oráculo se calcula en la prueba a partir del requisito. |
| US-17 · CA1 y US-19 · CA1 | Sí | Camino feliz de la compra: se repite en cada versión. |
| US-15 · CA1-CA4 (correos) | Más adelante | Buena para datos, pero no alcanzó el tiempo. |
| US-20 (accesibilidad) | No (solo parcial) | Una herramienta automática no ve todo: hace falta revisarlo con una persona. |

## 2. Bugs que nuestra suite detecta

Las claves de Jira están pendientes (hay que confirmar con el docente qué proyecto usar). En el código aparecen como `PENDIENTE-JIRA`.

| Prueba (archivo › título) | Bug en Jira (clave) | ¿Quedó con `test.fail(...)`? | Evidencia (captura o trace) |
|---|---|---|---|
| 02-carrito › US-04 CA3: 4 + 4 mochilas supera el stock | _pendiente_ | Sí | Expected "4" · Received "8" (y reproducido a mano) |
| 02-carrito › US-05 CA2: "+" no pasa del stock | _pendiente_ | Sí | Expected "6" · Received "7" |
| 02-carrito › US-06 CA2: con cantidad 1, "−" no la deja en 0 | _pendiente_ | Sí | Expected "1" · Received "0" |
| 03-descuentos-iva › US-09 CA3: "desc10" y "Desc10" | _pendiente_ (1 bug, 2 filas) | Sí, solo esas 2 filas | Descuento "− $ 0". " DESC10 " con espacios sí funciona |
| 03-descuentos-iva › US-10 CA2: un código inválido no borra el descuento | _pendiente_ | Sí | Expected "$ 6.500" · Received "− $ 0" |
| 03-descuentos-iva › US-11 CA2: IVA sobre el valor descontado | _pendiente_ | Sí | Expected "$ 11.115" · Received "$ 12.350" (19 % de 65.000 sin descontar) |
| 03-descuentos-iva › US-12 CA2: total con descuento | mismo bug de US-11 | Sí | Expected "$ 69.615" · Received "$ 70.850" |
| heredados › H2 | mismo bug de US-11 | Sí | Expected "$ 19.760" · Received "$ 24.700" |

Todas fallan siempre igual: cada una se corrió 5 veces (`--repeat-each=5`, 30 de 30 fallos idénticos). US-11, US-12 y H2 son **un solo bug** (el IVA se calcula antes de restar el descuento) visto desde tres pruebas.

## 3. Pruebas heredadas: nuestro diagnóstico

| Prueba | Veredicto (producto / prueba / inestable / entorno) | Cómo lo comprobamos | Qué hicimos |
|---|---|---|---|
| H1 · el catálogo tiene 6 productos | Prueba | Esperaba 6 y la tienda muestra 8. El criterio US-01 CA1 dice 8. | Corregimos el valor esperado a 8. |
| H2 · el IVA de 2 mochilas con DESC20… | Producto | El valor esperado es correcto: (130.000 − 26.000) × 19 % = 19.760. La tienda da 24.700, que es el 19 % de 130.000 sin descontar. Es el mismo bug de US-11 CA2. | La dejamos con `test.fail` (mismo bug de Jira). |
| H3 · agregar un cuaderno justo después de cargar | Inestable | Con `--repeat-each` falló 2 de 110 veces: "element(s) not found". La tienda es Next.js, y con `waitUntil: 'domcontentloaded'` el botón ya se ve pero el JavaScript todavía no está listo, así que el clic se pierde. | Quitamos `domcontentloaded` (goto espera al evento `load`). Después pasó 100 de 100. No usamos `waitForTimeout`. |

## 4. Medidas

- Casos de prueba de nuestro plan en Jira: **\_\_** · automatizados en este laboratorio: **16** (+3 heredadas) (**\_\_ %**)
- Tiempo que nos tomó escribir las pruebas automatizadas: **\_\_ min** · tiempo de ejecutar toda la suite: **≈ 27 s** (31 pruebas, en local)
- Tiempo estimado de ejecutar **a mano** esos mismos casos: **\_\_ min**
- Con esos números, ¿en cuántas ejecuciones se paga la automatización? (inversión ÷ ahorro por ejecución): **\_\_**

## 5. Reflexión (máximo 5 líneas cada una)

1. ¿Qué casos de nuestro plan **no** automatizaríamos y por qué?
2. Si la tienda cambia el HTML de un botón, ¿qué parte de nuestro código se rompe y cuál no? ¿Qué aportó el Page Object?
3. Una prueba roja nuestra que **no** era un bug del producto: ¿cómo nos dimos cuenta?
4. ¿Qué bug o riesgo **no** habría encontrado la automatización por sí sola?
5. ¿Qué haríamos distinto en un proyecto real?
