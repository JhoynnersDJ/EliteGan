import z from "zod"

//se asegura que los campos ingresados al crear una tarea sean validos
export const createEschema = z.object({
    date: z.coerce.date({
        required_error: "Fecha es requerido",
        invalid_type_error: "La fecha de inicio debe ser una cadena de caráteres y formato ISO 8601",
    }),
    start_time: z.string({
        required_error: 'Hora de inicio es requerido',
        // invalid_type_error: 'Hora de inicio debe ser un número'
        }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    end_time: z.string({
        required_error: 'Hora de finalización es requerido',
        invalid_type_error: 'Hora de finalización debe ser tipo cadena de carácteres'
        }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    id_project: z.string({
        required_error: 'Id de proyecto es requerido',
        invalid_type_error: 'Id de proyecto debe ser tipo cadena de carácteres'
        }).uuid({
            message: "Id de proyecto debe ser tipo UUID"
        }).nullable(),
    id_service: z.string({
        required_error: 'Id de servicio es requerido',
        invalid_type_error: 'Id de servicio debe ser tipo cadena de carácteres'
        }).uuid({
            message: "Id de servicio debe ser tipo UUID"
        })
})

//se asegura que los campos ingresados al actualizar una tarea sean validos
export const updateEschema = z.object({
    date: z.coerce.date({
        required_error: "Fecha es requerido",
        invalid_type_error: "La fecha de inicio debe ser una cadena de caráteres y formato ISO 8601",
    }),
    start_time: z.string({
        required_error: 'Hora de inicio es requerido',
        // invalid_type_error: 'Hora de inicio debe ser un número'
        }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    end_time: z.string({
        required_error: 'Hora de finalización es requerido',
        invalid_type_error: 'Hora de finalización debe ser tipo cadena de carácteres'
        }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    id_project: z.string({
        required_error: 'Id de proyecto es requerido',
        invalid_type_error: 'Id de proyecto debe ser tipo cadena de carácteres'
        }).uuid({
            message: "Id de proyecto debe ser tipo UUID"
        }).nullable(),
    id_service: z.string({
        required_error: 'Id de servicio es requerido',
        invalid_type_error: 'Id de servicio debe ser tipo cadena de carácteres'
        }).uuid({
            message: "Id de servicio debe ser tipo UUID"
        })
}).partial()