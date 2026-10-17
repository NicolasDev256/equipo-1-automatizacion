# Entrega · Laboratorio 3.1 · Introducción a la automatización de pruebas

**Equipo:** `equipo-1` · **Integrantes:** _nombres_ · **Repositorio:** https://github.com/NicolasDev256/equipo-1-automatizacion

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
| US-13 · CA3 | Sí | Cobrar un pedido de $ 0 es un riesgo alto. Basta comprobar que un botón está deshabilitado. Encontró un bug. |
| US-14 · CA1 y CA2 | Sí | Validaciones del formulario: se repiten mucho y los mensajes son exactos. |
| US-15 · CA1-CA4 (correos) | Sí (por datos) | 12 correos: a mano es lento y repetitivo, en una tabla es perfecto. Encontró un bug en 4 filas. |
| US-16 · CA1 | Sí | Privacidad: los datos de una persona no deben verse en la compra siguiente. Encontró un bug. |
| US-17 · CA1, CA2 y CA3 · US-19 · CA1 | Sí | Camino feliz de la compra: se repite en cada versión. CA3 encontró un bug. |
| US-20 · CA1 y CA2 (accesibilidad) | Parcial (bonus con axe) | axe detecta las etiquetas faltantes, pero no todo (no detectó el contraste del "✕", TDJ-59). El resto se revisa con un lector de pantalla real. |
| US-01 · CA4 (teléfono de 375 px) | Sí (bonus) | Se mide fácil: el ancho del contenido no puede pasar el de la pantalla. Hoy pasa. |
| US-08 y US-18 | Más adelante | No alcanzó el tiempo. US-08 depende de recargar y de la persistencia, hay que pensarla bien para que no sea inestable. |

## 2. Bugs que nuestra suite detecta

Los bugs están en el proyecto **TDJ** de Jira (https://proyecto-desarrollo.atlassian.net/browse/TDJ-44 a TDJ-59).

| Prueba (archivo › título) | Bug en Jira (clave) | ¿Quedó con `test.fail(...)`? | Evidencia (captura o trace) |
|---|---|---|---|
| 02-carrito › US-04 CA3: 4 + 4 mochilas supera el stock | TDJ-44 | Sí | Expected "4" · Received "8" (y reproducido a mano) |
| 02-carrito › US-05 CA2: "+" no pasa del stock | TDJ-45 | Sí | Expected "6" · Received "7" |
| 02-carrito › US-06 CA2: con cantidad 1, "−" no la deja en 0 | TDJ-45 (mismo bug que "+") | Sí | Expected "1" · Received "0" |
| 03-descuentos-iva › US-09 CA3: "desc10" y "Desc10" | TDJ-47 (1 bug, 2 filas) | Sí, solo esas 2 filas | Descuento "− $ 0". " DESC10 " con espacios sí funciona |
| 03-descuentos-iva › US-10 CA2: un código inválido no borra el descuento | TDJ-49 | Sí | Expected "$ 6.500" · Received "− $ 0" |
| 03-descuentos-iva › US-11 CA2: IVA sobre el valor descontado | TDJ-50 | Sí | Expected "$ 11.115" · Received "$ 12.350" (19 % de 65.000 sin descontar) |
| 03-descuentos-iva › US-12 CA2: total con descuento | TDJ-50 | Sí | Expected "$ 69.615" · Received "$ 70.850" |
| heredados › H2 | TDJ-50 | Sí | Expected "$ 19.760" · Received "$ 24.700" |
| 04-checkout › US-13 CA3: con total cero no se puede ir a pagar | TDJ-51 | Sí | Expected: disabled · Received: enabled (mismo "−" de US-06, pero es otro bug: no se valida el total) |
| 04-checkout › US-15 CA1-CA3: correos válidos | TDJ-53 (1 bug, 4 filas) | Sí, solo esas 4 filas | Rechaza ana.gomez@, ana-gomez@, ana+tienda@ y @universidad.edu.co con "El correo no tiene un formato válido.". ana_gomez@ sí pasa |
| 05-confirmacion › US-16 CA1: el formulario aparece vacío | TDJ-54 | Sí | Expected "" · Received "Ana Gómez" |
| 05-confirmacion › US-17 CA3: número de pedido tras recargar | TDJ-55 | Sí | Los dos pedidos salen con #1001: al recargar, el contador vuelve a empezar |
| 06-bonus › US-20 CA1: etiquetas del formulario (axe y getByLabel) | TDJ-57 | Sí | axe: "label: 3". `getByLabel('Nombre completo')` no encuentra el campo |
| 06-bonus › US-20 CA2: campo de cantidad del catálogo (axe) | TDJ-58 | Sí | axe: "label: 8" (un campo por producto) |

Todas fallan siempre igual: las del carrito y descuentos se corrieron 5 veces (30 de 30 fallos idénticos) y las de checkout y confirmación 3 veces (60 de 60 con el resultado esperado). US-11, US-12 y H2 son **un solo bug** (TDJ-50: el IVA se calcula antes de restar el descuento) visto desde tres pruebas. Lo mismo pasa con "+" y "−" (TDJ-45). En total la suite detecta **11 bugs distintos** con 19 pruebas marcadas con `test.fail`.

## 3. Pruebas heredadas: nuestro diagnóstico

| Prueba | Veredicto (producto / prueba / inestable / entorno) | Cómo lo comprobamos | Qué hicimos |
|---|---|---|---|
| H1 · el catálogo tiene 6 productos | Prueba | Esperaba 6 y la tienda muestra 8. El criterio US-01 CA1 dice 8. | Corregimos el valor esperado a 8. |
| H2 · el IVA de 2 mochilas con DESC20… | Producto | El valor esperado es correcto: (130.000 − 26.000) × 19 % = 19.760. La tienda da 24.700, que es el 19 % de 130.000 sin descontar. Es el mismo bug de US-11 CA2. | La dejamos con `test.fail` (mismo bug de Jira). |
| H3 · agregar un cuaderno justo después de cargar | Inestable | Con `--repeat-each` falló 2 de 110 veces: "element(s) not found". La tienda es Next.js, y con `waitUntil: 'domcontentloaded'` el botón ya se ve pero el JavaScript todavía no está listo, así que el clic se pierde. | Quitamos `domcontentloaded` (goto espera al evento `load`). Después pasó 100 de 100. No usamos `waitForTimeout`. |

## 4. Medidas

- Criterios de aceptación del backlog: **61** (20 historias, plan en Jira TDJ-21 a TDJ-41) · automatizados: **30** (**49 %**). Son 37 pruebas propias + 3 heredadas + 5 que traía la plantilla = 45.
- Tiempo que nos tomó escribir las pruebas automatizadas: **__ min** · tiempo de ejecutar toda la suite: **≈ 43 s** (45 pruebas, en local) y ≈ 1 min en GitHub Actions
- Tiempo estimado de ejecutar **a mano** esos mismos casos: **≈ 60 min** (≈ 2 min por criterio × 30; los 12 correos solos ya son ≈ 15 min)
- Con esos números, ¿en cuántas ejecuciones se paga la automatización? (inversión ÷ ahorro por ejecución): **__** (tiempo de escribirlas ÷ ≈ 59 min ahorrados por ejecución)

## 5. Reflexión (máximo 5 líneas cada una)

1. ¿Qué casos de nuestro plan **no** automatizaríamos y por qué?
   Lo visual y la experiencia de uso: si algo "se ve raro", el contraste (axe no detectó TDJ-59) o si el lector de pantalla se entiende de verdad. Y lo que cambia mucho o se usa una sola vez no vale la pena.

2. Si la tienda cambia el HTML de un botón, ¿qué parte de nuestro código se rompe y cuál no? ¿Qué aportó el Page Object?
   Se rompen los localizadores. Las pruebas que usan TiendaPage se arreglan cambiando una línea en la clase. Las que todavía tienen el localizador copiado (US-11, US-12 y algunas del carrito) habría que corregirlas una por una. El Page Object hizo que las pruebas nuevas fueran mucho más cortas: una compra completa es `tienda.comprar(...)`.

3. Una prueba roja nuestra que **no** era un bug del producto: ¿cómo nos dimos cuenta?
   US-09 CA1 salió roja la primera vez: esperábamos "$ 6.500" y la tienda mostraba "− $ 6.500". El descuento era correcto, solo que se muestra con el signo menos, así que el error era nuestro. También H1 (esperaba 6 productos y el criterio dice 8) y H3, que fallaba solo a veces y con `--repeat-each` vimos que era inestable.

4. ¿Qué bug o riesgo **no** habría encontrado la automatización por sí sola?
   El contraste del botón "✕" (TDJ-59): axe no lo marcó. Tampoco la dirección larga que desborda la pantalla de confirmación (TDJ-56) ni el Enter que no aplica el código (TDJ-48), porque nadie escribió esas pruebas. La máquina solo revisa lo que le decimos que revise.

5. ¿Qué haríamos distinto en un proyecto real?
   Usar el Page Object desde el principio, pedir a los desarrolladores atributos `data-testid` para no depender de `.rounded-lg`, y conectar cada prueba con su issue desde el inicio. También correr la suite en cada pull request antes de unir cambios, no solo después del push.
