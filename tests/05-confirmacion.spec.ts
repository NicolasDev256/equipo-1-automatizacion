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
    test.fail(true, 'PENDIENTE-JIRA · el formulario conserva los datos de la compra anterior');
    const tienda = new TiendaPage(page);

    // ARRANGE: una compra terminada
    await tienda.abrir();
    await tienda.comprar('Esfero azul');

    // ACT: empezar otra compra
    await page.getByRole('button', { name: 'Volver a la tienda' }).click();
    await tienda.agregar('Cuaderno universitario');
    await tienda.irAPagar();

    // ASSERT: no deben quedar los datos de la compra anterior
    await expect(tienda.campo('Nombre completo')).toHaveValue('');
    await expect(tienda.campo('Correo electrónico')).toHaveValue('');
    await expect(tienda.campo('Dirección de entrega')).toHaveValue('');
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
    const tienda = new TiendaPage(page);

    // ARRANGE: primera compra
    await tienda.abrir();
    await tienda.comprar('Esfero azul');
    const primero = await tienda.numeroDePedido();

    // ACT: segunda compra
    await page.getByRole('button', { name: 'Volver a la tienda' }).click();
    await tienda.comprar('Esfero azul');
    const segundo = await tienda.numeroDePedido();

    // ASSERT
    expect(segundo).not.toBe(primero);
  });

  test('CA3: un pedido hecho después de recargar la página no repite un número anterior', async ({ page }) => {
    test.fail(true, 'PENDIENTE-JIRA · al recargar, el número de pedido vuelve a empezar (#1001 repetido)');
    const tienda = new TiendaPage(page);

    // ARRANGE: primera compra
    await tienda.abrir();
    await tienda.comprar('Esfero azul');
    const primero = await tienda.numeroDePedido();

    // ACT: recargar y comprar otra vez
    await page.reload();
    await tienda.comprar('Esfero azul');
    const segundo = await tienda.numeroDePedido();

    // ASSERT
    expect(segundo).not.toBe(primero);
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
