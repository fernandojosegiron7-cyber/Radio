# ALÓ PAISANO RADIO — Panel admin privado + Supabase

## Qué incluye
- `/app/` reproductor público
- `/admin/` panel privado con contraseña
- `/api/config` entrega configuración pública
- `/api/admin-login` verifica contraseña
- `/api/admin-save` guarda cambios en Supabase
- Metadatos Zeno, historial, volumen, compartir
- Cambios del panel se reflejan para todos los visitantes
- Permite URL o imagen pequeña (máx. 1.2 MB) para logo/fondo

## 1. Crear Supabase
Crea un proyecto gratuito en Supabase.

En SQL Editor, ejecuta el contenido de `supabase-setup.sql`.

En Project Settings > API copia:
- Project URL
- service_role key (NO la publiques)

## 2. Subir a Vercel
Sube este proyecto a Vercel.

En Vercel > Project > Settings > Environment Variables crea:
- `SUPABASE_URL` = Project URL de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key
- `ADMIN_PASSWORD` = tu contraseña privada (mínimo 6 caracteres)

Después haz Redeploy.

## 3. Usar
- Reproductor: `https://tu-dominio.vercel.app/app/`
- Admin: `https://tu-dominio.vercel.app/admin/`

El público no puede cambiar la configuración. Solo quien conozca `ADMIN_PASSWORD` puede guardar cambios.

## Seguridad
La contraseña y la service_role key permanecen en variables de entorno del servidor de Vercel.
Nunca pongas la service_role key dentro del HTML o JavaScript del navegador.


## Corrección Supabase 2026
Compatible con claves nuevas `sb_secret_...`: se envían solo por `apikey`, no como Bearer JWT.
