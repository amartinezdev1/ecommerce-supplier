# Publicar RPM en Vercel

Esta carpeta es la raíz del proyecto. El diseño y las funciones de la tienda están preparados para ejecutarse con Next.js y PostgreSQL.

## 1. Crear y preparar Supabase

1. Crea un proyecto de Supabase y guarda su contraseña de base de datos en tu gestor de contraseñas.
2. Abre **SQL Editor** y ejecuta **`supabase/setup.sql`**. Es idempotente: no sobrescribe el catálogo existente. Crea el esquema privado `rpm`, diez productos de muestra y el bucket privado `rpm-products`.
3. En **Connect**, copia la conexión **Transaction pooler**, puerto **6543**. Esa será `DATABASE_URL`. Copia el host completo del panel; no lo construyas a mano. Si la contraseña tiene caracteres especiales, codifícalos para una URL.
4. En **Project Settings → API**, copia la URL del proyecto, la clave publicable y la clave secreta. También se admiten las claves heredadas `anon` y `service_role` en sus variables correspondientes.

No agregues el esquema `rpm` a los esquemas expuestos de la API. El acceso de clientes y personal lo controla el servidor de RPM, no políticas públicas de lectura de tablas. No publiques el bucket ni crees políticas de escritura anónima. Las fotografías de catálogo son servidas por `/media/...` tras guardarlas desde administración.

## 2. Configurar el correo de acceso

1. Habilita el proveedor de **Email** en **Authentication**.
2. Configura **SMTP** con tu servicio de correo para enviar códigos a los clientes. El servicio de prueba del proveedor tiene restricciones de destinatarios y frecuencia; no sustituye SMTP para público real.
3. En **Email Templates → Magic Link**, usa una plantilla con el código, por ejemplo: `Tu código de acceso a RPM es {{ .Token }}`. El asunto debe llevar la marca RPM.
4. Define **Site URL** con tu dominio final y las URL de desarrollo necesarias. El acceso de RPM usa código escrito en la página, no enlaces de otro servicio.

La primera vez que una persona verifica su correo se crea su cuenta. Solo el correo de `RPM_ADMIN_EMAIL` tiene administración principal; desde **Administración → Personal** se autorizan las demás cuentas. Los clientes sin permiso solo ven sus propias cotizaciones.

## 3. Importar el proyecto en Vercel

1. Sube el contenido de esta carpeta a tu repositorio Git y conéctalo a Vercel. También puedes extraer `outputs/rpm-vercel.zip` y subir su carpeta `rpm-plataforma` a un repositorio.
2. Si el repositorio contiene la carpeta padre, selecciona **Root Directory: `rpm-plataforma`**. Si solo contiene el contenido de esta carpeta, usa la raíz.
3. El preset es **Next.js**, Node.js **22.x**, instalación **`npm ci`**, compilación **`npm run build`**. Deja la carpeta de salida con el valor predeterminado. `vercel.json` ya declara el framework y los comandos.
4. En **Settings → Environment Variables**, agrega estas variables para los entornos que vayas a publicar:

| Variable | Valor |
| --- | --- |
| `APP_URL` | Origen HTTPS exacto de la tienda, sin barra final. Por ejemplo, `https://tu-tienda.vercel.app` |
| `RPM_ADMIN_EMAIL` | Correo que verificarás como administrador principal |
| `DATABASE_URL` | Conexión Transaction pooler de Supabase |
| `SUPABASE_URL` | URL HTTPS del proyecto |
| `SUPABASE_PUBLISHABLE_KEY` | Clave publicable/anon |
| `SUPABASE_SECRET_KEY` | Clave secreta/service_role, exclusivamente del servidor |
| `SUPABASE_STORAGE_BUCKET` | `rpm-products` |

Ninguna variable necesita el prefijo `NEXT_PUBLIC_`. No subas `.env.local` al repositorio. Vercel define `NODE_ENV`; no hace falta agregarlo.

5. Publica. Si el dominio definitivo se asigna después, actualiza `APP_URL` y vuelve a desplegar. Para despliegues de prueba, usa su origen exacto y preferiblemente una base separada.
6. Abre `/acceso`, verifica el correo del administrador, carga el catálogo real y revisa precios/sucursales. Prueba una cotización y su PDF antes de compartir el enlace.

## 4. Datos existentes

La publicación del código no mueve automáticamente datos ni archivos de otro alojamiento. Si tienes datos reales, conserva una exportación antes de cambiar el dominio y migra a una base nueva. El catálogo inicial solo contiene ejemplos.

Puedes importar un JSON con `npm run db:import -- /ruta/export.json --replace-demo`. El script admite este formato:

```json
{
  "config": { "demo": true, "branches": [], "taxBps": null, "rules": [] },
  "products": [],
  "quotes": [],
  "members": [],
  "ownerMappings": [],
  "mediaDirectory": "/ruta/a/las/fotos"
}
```

`config` y `products` deben contener los datos completos del catálogo, con las mismas propiedades que devuelve `/api/admin/catalog`. Cada producto conserva `id`, `sku`, `inventory`, `version` y su fotografía. Cada cotización usa `{id, ownerId, tokenHash, status, data}`; `data` conserva su desglose y `createdAt`. Los miembros usan `{email, role, active}`. Para relacionar historiales anteriores con cuentas nuevas, agrega `{legacyId, email}` en `ownerMappings`: la relación se aplica después de verificar ese correo. No inventes correos para registros anónimos.

Las fotos `/media/...` deben existir en `mediaDirectory`; se conservan sus nombres al cargarlas en Supabase. Las fotos externas HTTPS y las imágenes de muestra no necesitan trasladarse. El importador rechaza destinos con cotizaciones o productos reales; `--replace-demo` solo permite sustituir ejemplos intactos. Mantén las exportaciones fuera del repositorio.

## Límites y comandos útiles

- Las fotografías individuales admiten **4 MB** para funcionar bajo el límite normal de las funciones de Vercel.
- El XLSX/CSV se procesa en el navegador: máximo **5 MB**, hasta **500 filas** por importación y **4 MB por imagen** incrustada.
- `npm run check:deploy` valida presencia/formato básico de las variables, sin imprimir claves. No prueba las credenciales ni envía correos.
- `npm run db:migrate` aplica el esquema desde la terminal; usa `.env.local`. El bucket se crea mediante `supabase/setup.sql` en el SQL Editor.
- Los tokens de cotización y los permisos del historial se verifican en cada solicitud. No se confía en encabezados enviados por visitantes.

Referencias: [Next.js en Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [conexión PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres), [acceso con código por correo](https://supabase.com/docs/guides/auth/auth-email-passwordless), [configuración SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [almacenamiento](https://supabase.com/docs/guides/storage/uploads/standard-uploads).
