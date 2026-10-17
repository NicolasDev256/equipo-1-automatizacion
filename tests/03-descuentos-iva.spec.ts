import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE DESCUENTOS E IMPUESTOS · US-09 a US-12.
 * Mismas reglas que en 02-carrito.spec.ts: borren el test.fixme(...) cuando implementen la prueba.
 * Valores útiles (producto: Mochila escolar, $ 65.000): DESC10 → descuento $ 6.500 · DESC20 → $ 13.000.
 */

test.describe('US-09 · Aplicar un código de descuento', () => {
  // migrada al Page Object (Parte 5)
  test('CA1: DESC10 descuenta el 10% del subtotal', async ({ page }) => {
    const tienda = new TiendaPage(page);

    // ARRANGE: 1 mochila en el carrito
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');

    // ACT
    await tienda.aplicarCodigo('DESC10');

    // ASSERT: 10% de 65.000 (la tienda lo muestra como "− $ 6.500", con el signo menos)
    await expect(tienda.total('Descuento')).toContainText('$ 6.500');
  });

  // una prueba por cada variante del codigo
  const VARIANTES = [
    { codigo: 'desc10', bug: 'PENDIENTE-JIRA · el código distingue mayúsculas y minúsculas' },
    { codigo: 'Desc10', bug: 'PENDIENTE-JIRA · el código distingue mayúsculas y minúsculas' },
    { codigo: ' DESC10 ', bug: '' },
  ];

  for (const { codigo, bug } of VARIANTES) {
    test(`CA3: el código "${codigo}" se reconoce igual que DESC10`, async ({ page }) => {
      test.fail(bug !== '', bug); // solo las filas que traen bug son fallo esperado
      const tienda = new TiendaPage(page);

      // ARRANGE
      await tienda.abrir();
      await tienda.agregar('Mochila escolar');

      // ACT
      await tienda.aplicarCodigo(codigo);

      // ASSERT
      await expect(tienda.total('Descuento')).toContainText('$ 6.500');
    });
  }
});

test.describe('US-10 · Recibir aviso si el código no es válido', () => {
  test('CA1: un código inexistente muestra el aviso y el total no cambia', async ({ page }) => {
    const tienda = new TiendaPage(page);

    // ARRANGE: 1 mochila, total 65.000 + 19% = 77.350
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await expect(tienda.total('Total')).toHaveText('$ 77.350');

    // ACT
    await tienda.aplicarCodigo('ABC123');

    // ASSERT
    await expect(tienda.carrito.locator('p.text-xs')).toHaveText('Código de descuento no válido.');
    await expect(tienda.total('Total')).toHaveText('$ 77.350');
  });

  // migrada al Page Object (Parte 5)
  test('CA2: un código inválido NO borra un descuento válido ya aplicado', async ({ page }) => {
    test.fail(true, 'PENDIENTE-JIRA · un código inválido borra el descuento ya aplicado');
    const tienda = new TiendaPage(page);

    // ARRANGE: 1 mochila con DESC10 ya aplicado
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');
    await expect(tienda.total('Descuento')).toContainText('$ 6.500');

    // ACT: ahora un codigo que no existe
    await tienda.aplicarCodigo('ABC123');

    // ASSERT: el descuento anterior se tiene que mantener
    await expect(tienda.carrito.locator('p.text-xs')).toHaveText('Código de descuento no válido.');
    await expect(tienda.total('Descuento')).toContainText('$ 6.500');
  });
});

test.describe('US-11 · Ver el IVA correcto', () => {
  test('CA2: con descuento, el IVA se calcula sobre el valor descontado', async ({ page }) => {
    test.fail(true, 'PENDIENTE-JIRA · el IVA se calcula sobre el subtotal sin descontar');
    // el valor esperado sale del requisito, no de lo que muestra la tienda
    const descuento = 65000 * 0.1;
    const ivaEsperado = (65000 - descuento) * 0.19;
    const formato = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

    // ARRANGE
    await page.goto('/');
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();

    const carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });

    // ACT
    await carrito.getByPlaceholder('Código de descuento').fill('DESC10');
    await carrito.getByRole('button', { name: 'Aplicar' }).click();
    await expect(carrito.locator('dt:text("Descuento") + dd')).toContainText('$ 6.500');

    // ASSERT
    await expect(carrito.locator('dt:text-is("IVA (19%)") + dd')).toHaveText(formato.format(ivaEsperado));
  });
});

test.describe('US-12 · Ver el total a pagar correcto', () => {
  test('CA2: con descuento, el total es subtotal − descuento + IVA (IVA sobre lo descontado)', async ({ page }) => {
    test.fail(true, 'PENDIENTE-JIRA · el total usa el IVA sin descontar (misma causa que US-11 CA2)');
    // mismo oraculo que en US-11
    const subtotal = 65000;
    const descuento = subtotal * 0.1;
    const iva = (subtotal - descuento) * 0.19;
    const totalEsperado = subtotal - descuento + iva;
    const formato = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

    // ARRANGE
    await page.goto('/');
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();

    const carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });

    // ACT
    await carrito.getByPlaceholder('Código de descuento').fill('DESC10');
    await carrito.getByRole('button', { name: 'Aplicar' }).click();
    await expect(carrito.locator('dt:text("Descuento") + dd')).toContainText('$ 6.500');

    // ASSERT
    await expect(carrito.locator('dt:text-is("Total") + dd')).toHaveText(formato.format(totalEsperado));
  });
});
