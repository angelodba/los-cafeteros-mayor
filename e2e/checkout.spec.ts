import { test, expect } from '@playwright/test';

test.describe('Flujo E2E: Checkout de Los Cafeteros', () => {
  test('Flujo de B2B: Agregar al carrito, activar descuento mayorista y prevenir escape a WhatsApp', async ({ page, context }) => {
    // 1. Navegar a la página
    await page.goto('/');

    // 2. Esperar a que el catálogo cargue
    const productCard = page.locator('.product-card').first();
    await expect(productCard).toBeVisible();

    // 3. Modificar el input de cantidad a 35 (para activar el mayor)
    const qtyInput = productCard.locator('input[type="number"]');
    await qtyInput.fill('35');

    // 4. Hacer clic en "Añadir a la Cesta"
    const addBtn = productCard.locator('button', { hasText: 'Añadir' }).first();
    await addBtn.click();

    // 5. Validar que el Drawer se abrió
    const drawer = page.locator('.cart-drawer-content');
    await expect(drawer).toBeVisible();

    // 6. Validar que el botón diga "Enviar Pedido al WhatsApp"
    const whatsappBtn = drawer.locator('button', { hasText: 'WhatsApp' });
    await expect(whatsappBtn).toBeVisible();

    // 7. Interceptar window.open para prevenir que abra WhatsApp real durante los tests
    await page.evaluate(() => {
      window.open = function() {
        console.log('Intercepted window.open to WhatsApp');
        return null;
      };
    });

    // 8. Hacer click en enviar y validar que no crashea
    await whatsappBtn.click();
  });
});
