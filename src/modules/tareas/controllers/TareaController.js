//import Tareas from '../model/TareasModel.js';
//import {Tareas} from '../../../database/hormiwatch/Tareas.js'
import tarea from '../model/TareaModel.js'
import { calcularDiferenciaDeTiempo, calculartarifa, isHoliday } from '../libs/Tarifa.js'

export const register = async (req, res) => {
    const { fecha, hora_inicio, hora_fin, id_proyecto, id_servicio, status } = req.body;
    try {
        const proyectFound = await tarea.findProjectById(id_proyecto);

        if (!proyectFound) return res.status(404).json({ message: 'Proyecto no encontrado' });

        const serviceFound = await tarea.findServiceById(id_servicio);

        if (!serviceFound) return res.status(404).json({ message: 'Servicio no encontrado' });

        var time = calcularDiferenciaDeTiempo(hora_inicio, hora_fin);

        var time2 = calculartarifa(hora_inicio, hora_fin, fecha);

        if (time2.fin) {
            /*await Tarea.create(
                { fecha: fecha, hora_inicio:hora_inicio, hora_fin: '12:00AM', total_hora: calcularDiferenciaDeTiempo(hora_inicio,'12:00AM'), id_proyecto_fk: id_proyecto, id_servicio_fk: id_servicio, feriado_fk: isHoliday(fecha), total_tarifa: calculartarifa(hora_inicio,'12:00AM', fecha).tarifa1 },
                { fields: ['fecha', 'hora_inicio', 'hora_fin', 'total_hora', 'id_proyecto_fk', 'id_servicio_fk', 'feriado_fk','total_tarifa'] }
            );
            await Tarea.create(
                { fecha: time2.fin, hora_inicio:'12:00AM', hora_fin: hora_fin, total_hora: calcularDiferenciaDeTiempo('12:00AM',hora_fin), id_proyecto_fk: id_proyecto, id_servicio_fk: id_servicio, feriado_fk: isHoliday(time2.fin), total_tarifa: calculartarifa('12:00AM',hora_fin, fecha).tarifa1 },
                { fields: ['fecha', 'hora_inicio', 'hora_fin', 'total_hora', 'id_proyecto_fk', 'id_servicio_fk', 'feriado_fk','total_tarifa'] }
            )*/
        } else {
            const tareaSaved = new tarea(null, fecha, hora_inicio, hora_fin, 
                tiempo_total, factor_tiempo_total, id_proyecto, id_servicio, total_tarifa, status)
            // Parsea las horas, minutos y período de date1
            /*const [hours1, minutes1, period1] = hora_inicio.match(/\d+|AM|PM/g);

            // Parsea las horas, minutos y período de date2
            const [hours2, minutes2, period2] = hora_fin.match(/\d+|AM|PM/g);
            console.log(hours1+':'+minutes1+':00')
            await Tarea.create(
                { fecha: new Date(fecha), hora_inicio:hours1+':'+minutes1+':00', hora_fin: hours2+':'+minutes2+':00', total_hora: time, id_proyecto_fk: id_proyecto, id_servicio_fk: id_servicio, feriado_fk: isHoliday(fecha), total_tarifa: time2.tarifa1},
                { fields: ['fecha', 'hora_inicio', 'hora_fin', 'total_hora', 'id_proyecto_fk', 'id_servicio_fk', 'feriado_fk','total_tarifa'] }
            )*/
        }
        res.status(200).json({
            total_time: time.tiempo_formateado,
            total_time2: time.tiempo_minutos,
            total_tarifa_dia1: time2.tarifa1,
            total_tarifa_da2: time2.tarifa2,
            siguiente_dia: time2.fin
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getByProject = async (req, res) => {
    const { id } = req.params
    try {
        const proyectFound = await Tareas.findProjectById(id_proyecto);

        if (!proyectFound) return res.status(404).json({ message: 'Proyecto no encontrado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}