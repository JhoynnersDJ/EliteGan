import { Router} from "express";
import {loadHolidays, getHolidays, createHoliday, updateHoliday, getHoliday, deleteHoliday, getHolidayByDate} from "../controllers/HolidayController.js"
import {validateSchema} from "../../../middlewares/ValidatorSchema.js"
import {createHolidaySchema, updateHolidaySchema} from "../schemas/HolidaySchema.js"
import { authRequired, authRequired2} from "../../../middlewares/validateToken.js";

const router = Router()

//cargar los feriados en el sistema desde goole calendar
router.get('/cargar-feriados',authRequired,loadHolidays)

//agrega un feriado ccon nombre y fecha
router.post('/crear',authRequired,validateSchema(createHolidaySchema), createHoliday)

//actualiza un feriado por id en los campos opcionales de nombre o feccha
router.put('/actualizar-feriado/:id',authRequired,validateSchema(updateHolidaySchema), updateHoliday)

//busca un feriado por id
router.get('/buscar-feriado/:id',authRequired, getHoliday)

//busca un feriado por fecha
router.get('/buscar-feriado-fecha/:date',authRequired, getHolidayByDate)

//te devuelve un json con todos los feriados en el sistema
router.get('/todos',authRequired,getHolidays)

//elimina un feriado por id
router.delete('/eliminar-feriado/:id',authRequired, deleteHoliday)





export default router