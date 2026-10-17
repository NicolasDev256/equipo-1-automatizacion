import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * RETOS BONUS: accesibilidad automatica (axe) y diseño en un telefono.
 */

test.describe('US-20 · Usar la tienda con lector de pantalla', () => {
  test('CA1: en el formulario de envío cada campo tiene su etiqueta (axe)', async ({ page }) => {
    test.fail(true, 'TDJ-57 · las etiquetas del formulario de envío no están asociadas a sus campos');
    const tienda = new TiendaPage(page);

    // ARRANGE: llegar al formulario
    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await tienda.irAPagar();

    // ACT
    const resultado = await new AxeBuilder({ page }).analyze();

    // ASSERT: sin problemas de accesibilidad
    expect(resultado.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test('CA1: el campo se encuentra por su etiqueta, como lo haría un lector de pantalla', async ({ page }) => {
    test.fail(true, 'TDJ-57 · las etiquetas del formulario de envío no están asociadas a sus campos');
    const tienda = new TiendaPage(page);

    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await tienda.irAPagar();

    // getByLabel solo funciona si el <label> esta asociado al <input> (for/id o el input dentro del label)
    await expect(page.getByLabel('Nombre completo')).toBeVisible();
  });

  test('CA2: el campo de cantidad del catálogo anuncia su producto (axe)', async ({ page }) => {
    test.fail(true, 'TDJ-58 · el campo de cantidad del catálogo no anuncia a qué producto pertenece');
    const tienda = new TiendaPage(page);

    // ARRANGE + ACT
    await tienda.abrir();
    const resultado = await new AxeBuilder({ page }).analyze();

    // ASSERT
    expect(resultado.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});

test.describe('US-01 · Ver el catálogo en un teléfono', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('CA4: en 375 px el catálogo y el carrito caben sin desplazamiento horizontal', async ({ page }) => {
    const tienda = new TiendaPage(page);

    // ARRANGE: con algo en el carrito para que tambien se vea
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await expect(tienda.linea('Mochila escolar')).toBeVisible();

    // ACT: medir el ancho de la pagina contra el ancho de la pantalla
    const anchos = await page.evaluate(() => ({
      contenido: document.documentElement.scrollWidth,
      pantalla: document.documentElement.clientWidth,
    }));

    // ASSERT
    expect(anchos.contenido).toBeLessThanOrEqual(anchos.pantalla);
  });
});
