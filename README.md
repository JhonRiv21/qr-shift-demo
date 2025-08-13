# Sistema de Turnos - Gestión Completa

Sistema integral de gestión de turnos con múltiples servicios, sucursales y trazabilidad completa.

## 🚀 Características

- **Múltiples Servicios por Ticket**: PQR, Afiliación, Desvinculación, etc.
- **Gestión por Sucursal**: Cada sucursal maneja sus propios tickets
- **Trazabilidad Completa**: Logs de todas las acciones
- **Realtime**: Actualizaciones en tiempo real
- **Interfaz Moderna**: Diseño responsive con Tailwind CSS
- **Generación de PDF**: Tickets descargables
- **Autenticación Protegida**: Panel de gestión con login
- **Validación Robusta**: Validación en cliente con Zod
- **Toast System**: Feedback visual mejorado

## 📋 Estructura del Sistema

### Vistas Principales

1. **Home** (`/`) - Dashboard de navegación
2. **Mesa de Ayuda** (`/mesa-ayuda`) - Crear tickets con múltiples servicios
3. **Panel de Gestión** (`/sucursal`) - Gestionar tickets por sucursal
4. **Pantalla** (`/pantalla`) - Visualización pública de turnos

### Base de Datos

#### Tablas Principales
- `turnos_sucursales` - Sucursales del sistema de turnos
- `turnos_servicios` - Servicios disponibles
- `turnos_tickets` - Tickets principales
- `turnos_tickets_servicios` - Relación tickets-servicios
- `turnos_logs` - Trazabilidad de acciones

#### Funciones RPC
- `turnos_crear_ticket()` - Crear ticket con múltiples servicios
- `turnos_llamar_siguiente_sucursal()` - Llamar siguiente ticket
- `turnos_finalizar_actual_sucursal()` - Finalizar ticket actual
- `turnos_actualizar_servicio_ticket()` - Actualizar estado de servicio

## 🛠️ Instalación

### 1. Dependencias
```bash
npm install
```

### 2. Variables de Entorno
Crear archivo `.env`:
```env
PUBLIC_SUPABASE_URL=tu_url_de_supabase
PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Base de Datos
Ejecutar en Supabase SQL Editor:

```sql
-- 1. SCHEMA BASE - SISTEMA DE TURNOS
-- Extensiones necesarias
create extension if not exists pgcrypto;

-- Tabla de sucursales del sistema de turnos
create table if not exists public.turnos_sucursales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  codigo text not null unique,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

-- Tabla de servicios disponibles para turnos
create table if not exists public.turnos_servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  codigo text not null unique,
  descripcion text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Tabla principal de turnos/tickets
create table if not exists public.turnos_tickets (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid not null references public.turnos_sucursales(id),
  tipo text not null, -- código del servicio principal
  numero integer not null,
  turno text not null, -- formato: TIPO-NUMERO
  doc_tipo text not null,
  doc_num text not null,
  nombre_cliente text,
  telefono text,
  email text,
  fecha timestamptz not null default now(),
  fecha_date date not null default current_date, -- Campo para índice único
  estado text not null check (estado in ('pendiente','atendiendo','finalizado','cancelado')),
  atendido_por uuid references auth.users(id),
  fecha_atencion timestamptz,
  fecha_finalizacion timestamptz,
  observaciones text
);

-- Tabla de relación tickets-servicios (muchos a muchos)
create table if not exists public.turnos_tickets_servicios (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.turnos_tickets(id) on delete cascade,
  servicio_id uuid not null references public.turnos_servicios(id),
  estado text not null check (estado in ('pendiente','en_proceso','completado','cancelado')) default 'pendiente',
  observaciones text,
  atendido_por uuid references auth.users(id),
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  created_at timestamptz not null default now()
);

-- Tabla de logs/trazabilidad de turnos
create table if not exists public.turnos_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.turnos_tickets(id) on delete cascade,
  accion text not null,
  detalles jsonb,
  usuario_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Índices y triggers...
```

### 4. Ejecutar
```bash
npm run dev
```

## 🔄 Flujo de Trabajo

### 1. Crear Ticket (Mesa de Ayuda)
1. Seleccionar sucursal
2. Elegir servicios (múltiples)
3. Ingresar datos del cliente
4. Generar ticket con número único

### 2. Gestionar Ticket (Panel de Gestión)
1. Seleccionar sucursal
2. Ver ticket actual y servicios
3. Actualizar estados de servicios
4. Llamar siguiente o finalizar actual

### 3. Visualizar (Pantalla)
- Mostrar ticket actual y siguiente
- Información de sucursales activas
- Actualización en tiempo real

## 🔧 Configuración

### Servicios Disponibles
- PQR (Peticiones, Quejas y Reclamos)
- Afiliación
- Desvinculación
- Actualización de datos
- Consulta general
- Otros

### Sucursales
- Sucursal Centro (CENTRO)
- Sucursal Norte (NORTE)
- Sucursal Sur (SUR)

## 📱 Uso

### Mesa de Ayuda
- Crear tickets con múltiples servicios
- Información completa del cliente
- **Validación robusta con Zod**
- **Feedback visual con toasts**
- Generación de PDF

### Panel de Gestión
- Gestión por sucursal específica
- Control de estados de servicios
- Llamado de turnos
- Interfaz mejorada con indicadores visuales
- **Autenticación requerida** (admin@admin.com / A123456*a)
- Validación en tiempo real

### Pantalla
- Visualización pública
- Información en tiempo real
- Diseño optimizado para pantallas grandes

## 🔒 Seguridad

- RLS (Row Level Security) habilitado
- Funciones SECURITY DEFINER
- Autenticación por sucursal
- Trazabilidad completa de acciones

## 🎨 Tecnologías

- **Frontend**: SvelteKit 5 + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **PDF**: pdf-lib
- **Deploy**: Vercel/Netlify compatible

## 📈 Próximas Mejoras

- [ ] Dashboard de estadísticas
- [ ] Notificaciones push
- [ ] Integración con WhatsApp
- [ ] Reportes avanzados
- [ ] API REST completa
