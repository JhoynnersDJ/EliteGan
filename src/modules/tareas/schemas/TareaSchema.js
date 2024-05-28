import z from "zod"

//se asegura que los campos ingresados al crear una tarea sean validos
export const createTaskSchema = z.object({
    fecha: z.coerce.date({
        required_error: "Fecha es requerido",
        invalid_type_error: "La fecha de inicio debe ser una cadena de caráteres y formato ISO 8601",
    }),
    hora_inicio: z.string({
        required_error: 'Hora de inicio es requerido',
        // invalid_type_error: 'Hora de inicio debe ser un número'
        }),
    hora_fin: z.string({
        required_error: 'Hora de finalización es requerido',
        invalid_type_error: 'Hora de finalización debe ser tipo cadena de carácteres'
        }),
    id_proyecto: z.string({
        required_error: 'Id de proyecto es requerido',
        invalid_type_error: 'Id de proyecto debe ser tipo cadena de carácteres'
        }).uuid({
            message: "Id de proyecto debe ser tipo UUID"
        }).nullable(),
    id_servicio: z.string({
        required_error: 'Id de servicio es requerido',
        invalid_type_error: 'Id de servicio debe ser tipo cadena de carácteres'
        }),
    status: z.boolean({
        required_error: 'status es requerido',
    }),
    id_usuario: z.string({
        required_error: 'Id de usuario es requerido',
        invalid_type_error: 'Id de usuario debe ser tipo cadena de carácteres'
        }).uuid({
            message: "Id de usuario debe ser tipo UUID"
        }),
})

//se asegura que los campos ingresados al actualizar una tarea sean validos
export const updateTaskSchema = z.object({
    status: z.boolean({
        invalid_type_error: 'Status debe ser tipo cadena de carácteres'
        }).optional(),
    id_servicio: z.string({
        invalid_type_error: 'Id de servicio debe ser tipo cadena de carácteres'
        }).optional(),
    hora_inicio: z.string({
        //required_error: 'Hora de inicio es requerido',
        // invalid_type_error: 'Hora de inicio debe ser un número'
        invalid_type_error: 'Hora de inicio debe ser tipo cadena de carácteres'
        }).optional(),
    hora_fin: z.string({
        //required_error: 'Hora de finalización es requerido',
        invalid_type_error: 'Hora de finalización debe ser tipo cadena de carácteres'
        }).optional(),
    descripcion: z.string({
        invalid_type_error: 'Descripcion debe ser tipo cadena de carácteres'
    }).optional()
})