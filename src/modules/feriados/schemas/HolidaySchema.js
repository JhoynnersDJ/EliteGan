import z from "zod";

export const createHolidaySchema = z.object({
    nombre: z.string({
        required_error: 'Name is required'
    }),
    fecha: z.coerce.date({
        required_error: 'Date must be a string and date type'
    }),

})

export const updateHolidaySchema = z.object({
    nombre: z.string({
        required_error: 'Name is required'
    }).optional(),
    fecha: z.coerce.date({
        required_error: 'Date must be a string and date type'
    }).optional(),

})