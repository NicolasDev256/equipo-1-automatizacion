import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE CONFIRMACIÓN · US-16 a US-19.
 *
 * Un pedido completo son varios pasos (agregar, ir a pagar, llenar datos, confirmar). Cuando lo escriban por tercera vez
 * en la misma forma, ya sienten por qué existe el Page Object (Parte 5): escribir "comprar()" una sola vez.
 * Datos válidos de ejemplo: nombre "Ana Gómez", correo "ana@correo.com", dirección "Calle 10 # 20-30".
 * Recuerden: cada prueba arranca con el navegador limpio (carrito vacío, sin memoria de la anterior).
 */

test.describe('US-16 · Que mis datos no queden a la vista de otra persona', () => {
  test('CA1: tras confirmar y empezar otra compra, el formulario aparece vacío', async ({ page }) => {
    test.fixme(true, 'Pendiente de automatizar');
    // Nivel 3 · CAZABUGS.
    // Compren algo, presionen "Volver a la tienda", agreguen otro producto, "Ir a pagar" y comprueben que los tres
    // campos están vacíos:  await expect(campo).toHaveValue('')
  });
});

test.describe('US-17 · Confirmar mi pedido', () => {
  test('CA1: con datos válidos veo "¡Pedido confirmado!" y un número de pedido', async ({ page }) => {
    const tienda = new TiendaPage(page);

    // ARRANGE + ACT: compra completa de un esfero
    await tienda.abrir();
    await tienda.comprar('Esfero azul');

    // ASSERT
    await expect(page.getByRole('heading', { name: '¡Pedido confirmado!' })).toBeVisible();
    await expect(page.getByText(/Número de pedido:/)).toHaveText(/#\d+/);
  });

  test('CA2: un segundo pedido (sin recargar) tiene otro número', async ({ page }) => {
    test.fixme(true, 'Pendiente de automatizar');
    // Nivel 2. Hagan dos compras seguidas ("Volver a la tienda" entre ambas), lean el número de cada una
    // (guárdenlo en una variable con innerText()) y comprueben que son distintos: expect(segundo).not.toBe(primero)
  });

  test('CA3: un pedido hecho después de recargar la página no repite un número anterior', async ({ page }) => {
    test.fixme(true, 'Pendiente de automatizar');
    // Nivel 3 · CAZABUGS.
    // Igual que la anterior, pero entre las dos compras recarguen la página con  await page.reload().
    // Predicción antes de ejecutar: ¿pasará o fallará? Anótenla y compárenla con el resultado.
  });
});

test.describe('US-19 · Empezar una compra nueva con el carrito limpio', () => {
  test('CA1: tras confirmar, el carrito está vacío y el contador marca 0', async ({ page }) => {
    const tienda = new TiendaPage(page);

    // ARRANGE: una compra terminada
    await tienda.abrir();
    await tienda.comprar('Esfero azul');

    // ACT
    await page.getByRole('button', { name: 'Volver a la tienda' }).click();

    // ASSERT
    await expect(tienda.carrito.getByText('Tu carrito está vacío.')).toBeVisible();
    await expect(page.getByRole('banner').getByText(/artículo\(s\)/)).toContainText('0 artículo(s)');
  });
});
