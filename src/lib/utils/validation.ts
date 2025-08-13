import { z } from 'zod';

// Esquema para login
export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email es requerido'),
  password: z.string()
    .min(1, 'Contraseña es requerida')
    .min(6, 'Contraseña debe tener al menos 6 caracteres')
});

// Esquema para crear ticket
export const ticketSchema = z.object({
  sucursal_id: z.string()
    .uuid('Sucursal inválida')
    .min(1, 'Sucursal es requerida'),
  servicios: z.array(z.string())
    .min(1, 'Debe seleccionar al menos un servicio'),
  nombre_cliente: z.string()
    .min(1, 'Nombre del cliente es requerido')
    .max(100, 'Nombre demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  doc_tipo: z.enum(['CC', 'CD', 'CE', 'NI', 'PT', 'SC', 'TI']),
  doc_num: z.string()
    .min(1, 'Número de documento es requerido')
    .max(20, 'Número de documento demasiado largo')
    .regex(/^[0-9]+$/, 'El número de documento solo puede contener números'),
  telefono: z.string()
    .min(1, 'Teléfono es requerido')
    .max(15, 'Teléfono demasiado largo')
    .regex(/^[0-9]+$/, 'El teléfono solo puede contener números'),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email es requerido')
});

// Esquema para actualizar servicio
export const servicioUpdateSchema = z.object({
  ticket_servicio_id: z.string()
    .uuid('ID de servicio inválido'),
  estado: z.enum(['pendiente', 'en_proceso', 'completado', 'cancelado'])
});

// Tipos derivados de los esquemas
export type LoginForm = z.infer<typeof loginSchema>;
export type TicketForm = z.infer<typeof ticketSchema>;
export type ServicioUpdateForm = z.infer<typeof servicioUpdateSchema>;

// Función helper para validar y obtener errores
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      // @ts-ignore - ZodError has errors property
      error.errors.forEach((err: any) => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Error de validación desconocido' } };
  }
} 