# RPM · Plataforma de catálogo y cotizaciones

Aplicación compartida con catálogo por sucursal, precios y existencias independientes, escalas por cantidad, descuentos generales configurables, cotizaciones con desglose, PDF y solicitud por WhatsApp. Conserva el header, las ocho secciones del home, el ancho de 90%, la escala de 80% y el footer de ancho completo del diseño aprobado.

## Acceso y operación

La tienda permite consultar sin cuenta. En **Cuenta → Iniciar sesión**, los clientes identificados pueden consultar y repetir sus cotizaciones. En el footer, **Administración** abre el portal del personal. El administrador principal corresponde al propietario del proyecto; en **Personal** puede autorizar correos como personal o administradores. El proveedor de identidad controla su pantalla externa de acceso; la interfaz de RPM usa únicamente la marca RPM.

El primer acceso prepara diez artículos de muestra en la base central. **No son precios, existencias ni condiciones reales.** Las escalas y reglas generales están desactivadas hasta configurarlas. El impuesto queda pendiente de confirmar. Cargar y revisar el Excel real, verificar los números de WhatsApp y configurar las condiciones comerciales antes de desactivar **Catálogo de muestra**.

Las cotizaciones no son órdenes, no descuentan ni reservan inventario y no procesan pagos. El botón de WhatsApp prepara un enlace con el mensaje; el cliente revisa y envía desde WhatsApp. Guardar una cotización no confirma que el mensaje haya sido enviado. Los PDF guardan los valores de la solicitud original; repetir una selección recalcula con precios actuales.

## Excel y fotografías

En **Importar Excel**, cargar `.xlsx` o `.csv`, elegir hoja y sucursal, relacionar columnas y revisar antes de confirmar. Código, nombre y precio son obligatorios. Se actualizan códigos existentes y se conservan las otras sucursales. Hasta 500 artículos y 5 MB por archivo; dividir archivos mayores en lotes. `.xls` debe guardarse como `.xlsx` desde Excel. Se reconocen imágenes incrustadas ancladas a filas y enlaces HTTPS. Fórmulas necesitan un valor calculado guardado por Excel. Las fotos también pueden subirse al editar un artículo (JPG, PNG, WEBP, máximo 5 MB).

Los cambios concurrentes se detectan con versiones; si alguien modificó el catálogo durante una importación, hay que recargar y revisar el archivo nuevamente. Los lotes se guardan dentro de una transacción D1.

## Desarrollo

Node 22.13 o superior. Instalar dependencias con el helper de Sites. `node scripts/prepare-client.mjs` prepara los archivos del navegador. `npm run dev -- --port 5173` inicia la vista local. El acceso local usa exclusivamente el simulador del starter; no se incluye en producción.

`node --test tests/pricing.test.mjs` prueba límites de escalas, descuentos, impuestos, existencias, redondeo y entradas inválidas. `npx tsc --noEmit` verifica tipos. `tests/api-smoke.mjs` es una comprobación del servidor local de prueba y requiere el escenario de mayoreo descrito dentro del archivo. El fixture `tests/import-sample.xlsx` contiene un artículo y una imagen de prueba, sin datos reales.

La fuente visual original se conserva en `public/prototype.js`; `lib/business-client.js` integra las funciones reales y `scripts/prepare-client.mjs` genera `public/storefront.js`. API en `app/api/[...path]/route.ts`, cálculo en `lib/pricing.mjs`, tablas en `db/schema.ts` y migraciones en `drizzle/`. D1 almacena catálogo, configuración, permisos y cotizaciones; R2 almacena imágenes. No se guardan credenciales en el navegador ni en el repositorio. Los borradores de selección y favoritos locales usan almacenamiento del dispositivo; los registros de negocio son centrales.

El manifiesto `.openai/hosting.json` conserva la identidad del Site y los enlaces DB/BUCKET. Publicar con los helpers de Sites; no desplegar por fuera de ese flujo. Las migraciones locales y alojadas usan bases separadas.
