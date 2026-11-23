# RPM · Rebajas por Minuto

Tienda y portal de cotizaciones en **Next.js**, preparada para Vercel. PostgreSQL guarda catálogo, sucursales, precios, personal y cotizaciones. Supabase gestiona acceso por correo con código y fotografías en un bucket privado. La interfaz utiliza únicamente la marca RPM.

Consulta [VERCEL.md](./VERCEL.md) para publicar. `supabase/setup.sql` prepara tablas, ejemplos y almacenamiento; `.env.example` enumera las variables que debes configurar.

## Desarrollo local

Requisitos: Node.js 22 y Docker para la base local, o una conexión PostgreSQL existente.

```sh
npm ci
docker compose up -d --wait
cp .env.example .env.local
```

Para PostgreSQL local, configura `DATABASE_URL=postgresql://rpm:rpm-local-only@127.0.0.1:55471/rpm` y `APP_URL=http://127.0.0.1:8871`. Agrega las claves reales de Supabase para acceso por correo y almacenamiento. No hay cuentas de administración simuladas ni accesos que omitan la verificación del correo.

```sh
npm run db:migrate
npm run dev -- --hostname 127.0.0.1 --port 8871
```

Las cotizaciones públicas y los cálculos funcionan con la base local. El acceso y las fotos cargadas requieren configurar Supabase; las fotos de muestra se sirven desde `public/images/rpm`.

## Validación y entrega

```sh
npm run typecheck
npm test
# Usa exclusivamente una base PostgreSQL de prueba: el test crea y elimina su propia base.
TEST_DATABASE_URL=postgresql://rpm:rpm-local-only@127.0.0.1:55471/postgres npm run test:integration
npm run build
npm run check:deploy
npm run export:vercel
```

`outputs/rpm-vercel.zip` contiene el código y los archivos de configuración. Excluye credenciales, base local, historial Git, dependencias instaladas y compilaciones.

## Funciones

Catálogo por sucursal, cantidades, escalas, descuentos generales sin acumulación, impuestos configurables, cotizaciones anónimas con token, historial de cuentas verificadas, PDF, borrador para WhatsApp, administración por permisos, importación XLSX/CSV y fotografías. Cambios de catálogo e importaciones usan transacciones y control de versiones para evitar sobrescrituras simultáneas.

Los ejemplos iniciales siguen marcados como muestra. Carga y revisa los datos reales antes de desactivar ese modo. Las existencias desconocidas se muestran por confirmar; guardar una cotización no reserva inventario ni envía mensajes.

Los datos de la aplicación viven en el esquema privado `rpm`. La interfaz accede a ellos por rutas de servidor que verifican la identidad y los permisos. La clave secreta de almacenamiento y la conexión de base de datos nunca se envían al navegador.
