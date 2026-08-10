# 🍏 LOS CAFETEROS - Feria de Hortalizas (Versión Mayor y Detal)

Este documento contiene el resumen técnico y visual completo de los cambios realizarlos, la configuración de activos y la estructura del proyecto para respaldar toda tu información.

---

## 🎨 1. Identidad Visual y Logotipo Oficial
* **Archivo de Logotipo Principal**: `logo-cropped.png`
  - **Formato**: PNG de alta resolución con transparencia alfa 100% real (sin fondo blanco).
  - **Dimensiones de Contenido**: 702px × 380px (Lienzo horizontal óptimo sin márgenes sobrantes).
  - **Ubicación en Código**: Usado en la barra superior (Header), en la tarjeta principal (Hero Card) y en el pie de página (Footer).

* **Icono de Pestaña (Favicon)**:
  - **Archivos**: `favicon.png` (128x128px) y `favicon.ico`
  - **Visual**: Emblema circular de la manzana roja y verde.
  - **Integración**: Configurado en `<head>` de `index.html` mediante etiquetas `<link rel="icon">`.

---

## 🛠️ 2. Paleta de Colores y Estilos CSS
- **Fondo General / Header**: `#F2EEDC` (Tono crema suave artesanal)
- **Verde Hoja Principal**: `#65A61A` / `#559B2E`
- **Verde Lima / Mayor**: `#84D914` / `#92E32B`
- **Verde WhatsApp**: `#1DD05D` / `#25D366`
- **Rojo Pimentón / Acentos**: `#D81E13` / `#E02020`
- **Marrón Tierra**: `#7A4222`
- **Negro Texto**: `#1A1A1A`

---

## 🚀 3. Funcionalidades del Sistema Web
1. **Selector Al Detal / Al Mayor**:
   - Conmutación dinámica de precios y badge informativo.
   - Cálculo de descuentos automáticos al alcanzar volumen (5 kg / huacales).
2. **Barra de Búsqueda de Productos**:
   - Diseño estilo píldora blanca con sombra sutil y buscador en vivo.
   - Chips rápidos de filtrado por rubros populares (Tomate, Pimentón, Cebolla, Papa, Aguacate, Ajo).
3. **Cotizador Interactivo a WhatsApp**:
   - Carrito lateral con cálculo automático en USD y tasa BCV de Venezuela en vivo.
   - Generación de plantilla de mensaje para despacho en restaurantes.
4. **Modal de Ubicación y Cobertura**:
   - Integración con Google Maps para La Urbina y desglose por municipios en Caracas.

---

## 📁 4. Archivos Clave del Proyecto
- `index.html`: Estructura semántica, metaetiquetas SEO, favicons y contenedor principal.
- `styles.css`: Sistema de diseño con variables CSS, animaciones y diseño adaptativo responsive.
- `app.js`: Lógica interactiva del catálogo, carrito, cálculo BCV y WhatsApp.
- `logo-cropped.png`: Imagen de la marca oficial procesada sin fondo blanco.
- `favicon.png` / `favicon.ico`: Iconos de navegación para pestañas.

---

*Guardado y respaldado exitosamente el 07 de Agosto de 2026.*
