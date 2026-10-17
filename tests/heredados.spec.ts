import { test, expect } from '@playwright/test';

/**
 * PRUEBAS HEREDADAS (Parte 4).
 *
 * Las dejó otro equipo, y nadie sabe por qué fallan: están en CUARENTENA (test.fixme), que es lo que hacen los
 * equipos reales con pruebas rojas que no entienden, para no frenar a los demás.
 *
 * Su trabajo, una por una:
 *   1. Saquen la prueba de cuarentena (borren su línea test.fixme) y ejecútenla.
 *   2. Diagnostiquen QUÉ falla: ¿el PRODUCTO (bug), la PRUEBA (defecto de la prueba), la INESTABILIDAD o el ENTORNO?
 *      Para detectar inestabilidad ejecútenla muchas veces:  npx playwright test heredados -g H3 --repeat-each=10
 *   3. Dejen cada una en su estado correcto y anoten el veredicto en ENTREGA.md.
 * No las "arreglen" a ciegas: un rojo no siempre es un bug.
 */

test('H1 · el catálogo tiene 8 productos', async ({ page }) => {
  // defecto de la prueba: esperaba 6, pero US-01 CA1 dice 8 y la tienda muestra 8
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(8);
});

test('H2 · el IVA de 2 mochilas con DESC20 es $ 19.760', async ({ page }) => {
  // el valor esperado esta bien: (130.000 - 26.000) * 0.19 = 19.760. La tienda da 24.700 (IVA sin descontar)
  test.fail(true, 'PENDIENTE-JIRA · el IVA se calcula sobre el subtotal sin descontar (mismo bug de US-11 CA2)');
  await page.goto('/');
  const tarjeta = page
    .locator('.rounded-lg')
    .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
  await tarjeta.getByRole('spinbutton').fill('2');
  await tarjeta.getByRole('button', { name: 'Agregar' }).click();
  await page.getByPlaceholder('Código de descuento').fill('DESC20');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('dt:text-is("IVA (19%)") + dd')).toHaveText('$ 19.760');
});

test('H3 · agregar un cuaderno justo después de cargar', async ({ page }) => {
  // antes usaba waitUntil: 'domcontentloaded' y a veces el clic se perdia porque la pagina
  // todavia no tenia el JavaScript listo. goto por defecto espera al evento load.
  await page.goto('/');
  await page.getByRole('button', { name: 'Agregar' }).first().click();
  await expect(page.getByRole('listitem').filter({ hasText: 'Cuaderno universitario' })).toBeVisible();
});
