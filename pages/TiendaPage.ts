import { type Locator, type Page } from '@playwright/test';

/**
 * PARTE 5 · PAGE OBJECT DE LA TIENDA.
 *
 * Idea: las pruebas deben contar la HISTORIA ("agrego una mochila y aplico DESC10"), no el HTML
 * (".rounded-lg", "dt:text-is(...) + dd"). Los localizadores (el "cómo") viven aquí, en un solo lugar.
 * Si mañana la tienda cambia su HTML, se corrige esta clase una vez y las pruebas siguen intactas.
 *
 * Regla de oro: el Page Object ofrece ACCIONES (agregar, aplicarCodigo...) y entrega LOCALIZADORES (cantidad, total...).
 * Las aserciones (expect) se quedan en las pruebas.
 */
export class TiendaPage {
  /** El panel del carrito (la tarjeta que tiene el encabezado "Carrito"). */
  readonly carrito: Locator;

  constructor(readonly page: Page) {
    this.carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
  }

  // ---------- Catálogo ----------
  /** Abre la tienda. */
  async abrir(): Promise<void> {
    await this.page.goto('/');
  }

  /** La tarjeta de un producto del catálogo. */
  tarjeta(producto: string): Locator {
    return this.page
      .locator('.rounded-lg')
      .filter({ has: this.page.getByRole('heading', { name: producto, level: 3 }) });
  }

  /** Escribe la cantidad en la tarjeta del producto y presiona "Agregar". */
  async agregar(producto: string, cantidad = 1): Promise<void> {
    const tarjeta = this.tarjeta(producto);
    await tarjeta.getByRole('spinbutton').fill(String(cantidad));
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();
  }

  // ---------- Carrito ----------
  /** La línea del carrito de un producto. */
  linea(producto: string): Locator {
    return this.carrito.getByRole('listitem').filter({ hasText: producto });
  }

  /** El número de unidades que muestra el carrito para un producto. */
  cantidad(producto: string): Locator {
    return this.linea(producto).locator('span');
  }

  /** Escribe el código y presiona "Aplicar". */
  async aplicarCodigo(codigo: string): Promise<void> {
    await this.carrito.getByPlaceholder('Código de descuento').fill(codigo);
    await this.carrito.getByRole('button', { name: 'Aplicar' }).click();
  }

  /** Valor de una fila del resumen: 'Subtotal', 'Descuento', 'IVA' o 'Total'. */
  total(fila: 'Subtotal' | 'Descuento' | 'IVA' | 'Total'): Locator {
    // Descuento e IVA traen el porcentaje en la etiqueta, por eso se buscan por una parte del texto
    if (fila === 'Descuento') return this.carrito.locator('dt:text("Descuento") + dd');
    if (fila === 'IVA') return this.carrito.locator('dt:text-is("IVA (19%)") + dd');
    return this.carrito.locator(`dt:text-is("${fila}") + dd`);
  }

  /** Presiona "Ir a pagar". */
  async irAPagar(): Promise<void> {
    await this.carrito.getByRole('button', { name: 'Ir a pagar' }).click();
  }

  // ---------- Checkout y confirmación ----------
  /** Un campo del formulario de envío, por el texto de su etiqueta. (Recuerden: getByLabel no funciona aquí.) */
  campo(etiqueta: 'Nombre completo' | 'Correo electrónico' | 'Dirección de entrega'): Locator {
    return this.page.locator(`label:text-is("${etiqueta}") + input`);
  }

  /** Llena el formulario con los datos que reciba. */
  async llenarDatos(datos: { nombre?: string; correo?: string; direccion?: string }): Promise<void> {
    if (datos.nombre !== undefined) await this.campo('Nombre completo').fill(datos.nombre);
    if (datos.correo !== undefined) await this.campo('Correo electrónico').fill(datos.correo);
    if (datos.direccion !== undefined) await this.campo('Dirección de entrega').fill(datos.direccion);
  }

  /** Presiona "Confirmar pedido". */
  async confirmar(): Promise<void> {
    await this.page.getByRole('button', { name: 'Confirmar pedido' }).click();
  }

  /** Lee el número de pedido de la pantalla de confirmación (ej. "1001"). */
  async numeroDePedido(): Promise<string> {
    const texto = await this.page.getByText(/Número de pedido:/).innerText();
    return texto.match(/#(\d+)/)?.[1] ?? '';
  }

  /** Atajo: compra completa de un producto con datos válidos, hasta ver "¡Pedido confirmado!". */
  async comprar(producto: string): Promise<void> {
    await this.agregar(producto);
    await this.irAPagar();
    await this.llenarDatos({ nombre: 'Ana Gómez', correo: 'ana@correo.com', direccion: 'Calle 10 # 20-30' });
    await this.confirmar();
    await this.page.getByRole('heading', { name: '¡Pedido confirmado!' }).waitFor();
  }
}
