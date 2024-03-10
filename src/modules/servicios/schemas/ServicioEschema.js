import z from "zod"

//se asegura que los campos ingresados al crear un rol sean validos
export const createEschema = z.object({
    nombre: z.string({
        required_error: 'Nombre es requerido',
        invalid_type_error: 'Nombre debe ser tipo cadena de carácteres'
        }).max(255,{
            message: 'Nombre debe tener 255 o menos carácteres'
        }),
    descripcion: z.string({
        invalid_type_error: 'Descripción debe ser tipo cadena de carácteres'
        }).max(255, {
            message: 'Descripción debe tener 255 o menos carácteres'
        }).nullable().or(z.undefined()),
    tipo: z.string({
        required_error: 'Tipo de servicio es requerido',
        invalid_type_error: 'Tipo de servicio debe ser tipo cadena de carácteres'
        }).max(255, {
            message: 'Tipo de servicio debe tener 255 o menos carácteres'
        }),
    categoria: z.string({
        required_error: 'Categoría es requerido',
        invalid_type_error: 'Categoría debe ser tipo cadena de carácteres'
        }).max(255, {
            message: 'Categoría debe tener 255 o menos carácteres'
        }),
    plataforma: z.string({
        required_error: 'Plataforma es requerido',
        invalid_type_error: 'Plataforma debe ser tipo cadena de carácteres'
    }).max(255, {
        message: 'Plataforma debe tener 255 o menos carácteres'
    })
})