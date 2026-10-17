import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE CHECKOUT · US-13 a US-15.
 *
 * IMPORTANTE: en el formulario de envío page.getByLabel('Nombre completo') NO encuentra el campo. Pruébenlo y
 * diagnostiquen por qué (inspeccionen el HTML). Mientras tanto, esto SÍ funciona:
 *     page.locator('label:text-is("Nombre completo") + input')
 * (la etiqueta va justo antes del campo). Los textos de las etiquetas son: "Nombre completo",
 * "Correo electrónico" y "Dirección de entrega".
 */

// Datos listos para la prueba dirigida por datos (US-15). Escribir cada correo a mano invita al error.
const CORREOS_VALIDOS = [
  'juan@correo.com',
  'ana_gomez@gmail.com',
  'ana.gomez@gmail.com',
  'ana-gomez@gmail.com',
  'ana+tienda@gmail.com',
  'ana@universidad.edu.co',
];
// estos correos son validos pero hoy la tienda los rechaza (mismo bug: la validacion es muy estricta)
const CORREOS_CON_BUG = ['ana.gomez@gmail.com', 'ana-gomez@gmail.com', 'ana+tienda@gmail.com', 'ana@universidad.edu.co'];
const CORREOS_MAL_FORMADOS = ['ana.gmail.com', 'ana@', '@gmail.com', 'ana gomez@gmail.com', 'ana@@gmail.com', 'ana@gmail'];

test.describe('US-13 · Ir a pagar desde el carrito', () => {
  test('CA3: con total cero o negativo no se puede ir a pagar', async ({ page }) => {
    test.fail(true, 'PENDIENTE-JIRA · con total $ 0 el botón "Ir a pagar" sigue habilitado');
    const tienda = new TiendaPage(page);

    // ARRANGE: 1 mochila
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await expect(tienda.cantidad('Mochila escolar')).toHaveText('1');

    // ACT: bajar la cantidad a 0 con "−"
    await tienda.carrito.getByRole('button', { name: 'Disminuir cantidad de Mochila escolar' }).click();

    // ASSERT
    await expect(tienda.carrito.getByRole('button', { name: 'Ir a pagar' })).toBeDisabled();
  });
});

test.describe('US-14 · Completar mis datos de envío', () => {
  test('CA1: con el formulario vacío hay un error por cada campo obligatorio', async ({ page }) => {
    const tienda = new TiendaPage(page);

    // ARRANGE
    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await tienda.irAPagar();

    // ACT: confirmar sin llenar nada
    await tienda.confirmar();

    // ASSERT
    await expect(page.getByText('El nombre es obligatorio.')).toBeVisible();
    await expect(page.getByText('El correo es obligatorio.')).toBeVisible();
    await expect(page.getByText('La dirección es obligatoria.')).toBeVisible();
  });

  test('CA2: un nombre y una dirección de solo espacios se rechazan como vacíos', async ({ page }) => {
    const tienda = new TiendaPage(page);

    // ARRANGE
    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await tienda.irAPagar();

    // ACT
    await tienda.llenarDatos({ nombre: '   ', correo: 'ana@correo.com', direccion: '   ' });
    await tienda.confirmar();

    // ASSERT
    await expect(page.getByText('El nombre es obligatorio.')).toBeVisible();
    await expect(page.getByText('La dirección es obligatoria.')).toBeVisible();
    await expect(page.getByRole('heading', { name: '¡Pedido confirmado!' })).not.toBeVisible();
  });
});

test.describe('US-15 · Ingresar un correo electrónico válido', () => {
  // una prueba por cada correo valido
  for (const correo of CORREOS_VALIDOS) {
    test(`CA1-CA3: el correo ${correo} se acepta`, async ({ page }) => {
      test.fail(CORREOS_CON_BUG.includes(correo), 'PENDIENTE-JIRA · la tienda rechaza correos válidos con . - + o dominio de varios niveles');
      const tienda = new TiendaPage(page);

      // ARRANGE
      await tienda.abrir();
      await tienda.agregar('Esfero azul');
      await tienda.irAPagar();

      // ACT
      await tienda.llenarDatos({ nombre: 'Ana Gómez', correo, direccion: 'Calle 10 # 20-30' });
      await tienda.confirmar();

      // ASSERT
      await expect(page.getByRole('heading', { name: '¡Pedido confirmado!' })).toBeVisible();
    });
  }

  // y una por cada correo mal formado
  for (const correo of CORREOS_MAL_FORMADOS) {
    test(`CA4: el correo "${correo}" se rechaza con un mensaje claro`, async ({ page }) => {
      const tienda = new TiendaPage(page);

      // ARRANGE
      await tienda.abrir();
      await tienda.agregar('Esfero azul');
      await tienda.irAPagar();

      // ACT
      await tienda.llenarDatos({ nombre: 'Ana Gómez', correo, direccion: 'Calle 10 # 20-30' });
      await tienda.confirmar();

      // ASSERT
      await expect(page.getByText('El correo no tiene un formato válido.')).toBeVisible();
      await expect(page.getByRole('heading', { name: '¡Pedido confirmado!' })).not.toBeVisible();
    });
  }
});
