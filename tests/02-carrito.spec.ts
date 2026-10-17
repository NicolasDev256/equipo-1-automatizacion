import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE CARRITO · US-04 a US-07.
 *
 * Cómo se trabaja este archivo:
 *  - La primera prueba ya está resuelta (EJEMPLO GUIADO).
 *  - Las demás están "pendientes": traen un test.fixme(...) que las salta. Para activar una, escriban su cuerpo
 *    y BORREN esa línea. Las pistas están en los comentarios.
 *  - "Nivel" va de 1 (fácil) a 3 (reto). "CAZABUGS" = el criterio probablemente destapa un bug de la tienda.
 *  - Los localizadores de la tienda están en el "Mapa de la tienda" de la guía del laboratorio.
 */

test.describe('US-04 · Agregar productos sin superar el stock', () => {
  // ─────────────── EJEMPLO GUIADO (resuelto) ───────────────
  test('CA1: se pueden agregar 15 cuadernos (stock 15)', async ({ page }) => {
    // ARRANGE: abrir la tienda
    await page.goto('/');

    // ACT: ubicar la tarjeta del cuaderno, escribir 15 en su cantidad y presionar "Agregar"
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Cuaderno universitario', level: 3 }) });
    await tarjeta.getByRole('spinbutton').fill('15');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();

    // ASSERT: en el carrito (la tarjeta con el encabezado "Carrito") aparece el cuaderno con cantidad 15
    const carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
    const linea = carrito.getByRole('listitem').filter({ hasText: 'Cuaderno universitario' });
    await expect(linea.locator('span')).toHaveText('15');
  });

  // ─────────────── PENDIENTES ───────────────
  test('CA2: no deja agregar 7 mochilas de una vez (stock 6) y avisa', async ({ page }) => {
    // ARRANGE
    await page.goto('/');
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
    const carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });

    // el alert bloquea la pagina, por eso el manejador va antes del clic
    let aviso = '';
    page.once('dialog', async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });

    // ACT
    await tarjeta.getByRole('spinbutton').fill('7');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();

    // ASSERT
    await expect(carrito.getByText('Tu carrito está vacío.')).toBeVisible();
    expect(aviso).toContain('Solo hay 6 unidades');
  });

  test('CA3: 4 + 4 mochilas supera el stock (6) y debe rechazarse', async ({ page }) => {
    test.fail(true, 'PENDIENTE-JIRA · agregar en dos veces deja pasar del stock (4 + 4 = 8 con stock 6)');
    // ARRANGE
    await page.goto('/');
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
    const carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
    const linea = carrito.getByRole('listitem').filter({ hasText: 'Mochila escolar' });

    // por si la tienda muestra un alert en el segundo intento
    page.on('dialog', (dialogo) => dialogo.accept());

    // ACT: 4 y despues otras 4
    await tarjeta.getByRole('spinbutton').fill('4');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();
    await expect(linea.locator('span')).toHaveText('4');

    await tarjeta.getByRole('spinbutton').fill('4');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();

    // ASSERT: el criterio dice que no se puede pasar del stock, asi que se queda en 4
    await expect(linea.locator('span')).toHaveText('4');
  });
});

test.describe('US-05 · Aumentar la cantidad desde el carrito', () => {
  test('CA2: "+" no pasa del stock (6 mochilas)', async ({ page }) => {
    test.fail(true, 'PENDIENTE-JIRA · el botón "+" deja pasar del stock (6 → 7)');
    // ARRANGE: las 6 mochilas del stock
    await page.goto('/');
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
    await tarjeta.getByRole('spinbutton').fill('6');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();

    const carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
    const linea = carrito.getByRole('listitem').filter({ hasText: 'Mochila escolar' });
    await expect(linea.locator('span')).toHaveText('6');

    page.on('dialog', (dialogo) => dialogo.accept());

    // ACT
    await carrito.getByRole('button', { name: 'Aumentar cantidad de Mochila escolar' }).click();

    // ASSERT
    await expect(linea.locator('span')).toHaveText('6');
  });
});

test.describe('US-06 · Disminuir la cantidad desde el carrito', () => {
  // migrada al Page Object (Parte 5)
  test('CA2: con cantidad 1, "−" no la deja en 0 ni en negativo (elegimos: se queda en 1)', async ({ page }) => {
    test.fail(true, 'PENDIENTE-JIRA · el botón "−" deja la cantidad en 0');
    const tienda = new TiendaPage(page);

    // ARRANGE: 1 mochila
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await expect(tienda.cantidad('Mochila escolar')).toHaveText('1');

    // ACT
    await tienda.carrito.getByRole('button', { name: 'Disminuir cantidad de Mochila escolar' }).click();

    // ASSERT: elegimos la opcion de que se quede en 1
    await expect(tienda.cantidad('Mochila escolar')).toHaveText('1');
  });
});

test.describe('US-07 · Quitar un producto del carrito', () => {
  // migrada al Page Object (Parte 5)
  test('CA2: quitar el único producto deja el carrito vacío y el total en $ 0', async ({ page }) => {
    const tienda = new TiendaPage(page);

    // ARRANGE: agregar un esfero
    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await expect(tienda.linea('Esfero azul')).toBeVisible();

    // ACT: quitarlo
    await tienda.carrito.getByRole('button', { name: 'Eliminar Esfero azul' }).click();

    // ASSERT
    await expect(tienda.carrito.getByText('Tu carrito está vacío.')).toBeVisible();
    await expect(tienda.total('Total')).toHaveText('$ 0');
  });
});
