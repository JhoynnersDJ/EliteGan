//import Tareas from '../model/TareasModel.js';
//import {Tareas} from '../../../database/hormiwatch/Tareas.js'
import tarea from '../model/TareaModel.js';
import { calcularDiferenciaDeTiempo, calculartarifa, formatHour } from '../libs/Tarifa.js';
import holidayFunction from '../../feriados/model/HolidaysFunction.js';

export const register = async (req, res) => {
    const { fecha, hora_inicio, hora_fin, id_proyecto, id_servicio, status } = req.body;
    try {
        const proyectFound = await tarea.findProjectById(id_proyecto);

        if (!proyectFound) return res.status(404).json({ message: 'Proyecto no encontrado' });

        const serviceFound = await tarea.findServiceById(id_servicio);

        if (!serviceFound) return res.status(404).json({ message: 'Servicio no encontrado' });

        const holidays = await holidayFunction.getHolidaysDate();

        var time = calcularDiferenciaDeTiempo(hora_inicio, hora_fin);
        console.log(calcularDiferenciaDeTiempo(hora_inicio, '00:00AM'));

        var time2 = calculartarifa(hora_inicio, hora_fin, fecha, holidays);

        if (time2.fin) {
            const horas1 = formatHour(hora_inicio,hora_fin);

            const tiempo_total_dia1 = calcularDiferenciaDeTiempo(hora_inicio, '00:00AM').tiempo_minutos;

            const tareaSaved_dia1 = new tarea(null, fecha, horas1.tiempo_formateado1, '00:00AM', 
            tiempo_total_dia1, time2.tarifa1, 
            id_proyecto, id_servicio, time2.tarifa1*proyectFound.tarifa, status,null);

            await tarea.restPoolProjectById(id_proyecto,tiempo_total_dia1);

            await tarea.save(tareaSaved_dia1);

            const horas2 = formatHour(hora_inicio,hora_fin);

            const tiempo_total_dia2 = calcularDiferenciaDeTiempo( '00:00AM',hora_fin).tiempo_minutos;
            
            const tareaSaved_dia2 = new tarea(null, time2.fin, '00:00AM', horas2.tiempo_formateado2, 
            tiempo_total_dia2, time2.tarifa2, 
            id_proyecto, id_servicio, time2.tarifa2*proyectFound.tarifa, status,null);

            await tarea.save(tareaSaved_dia2);

            await tarea.restPoolProjectById(id_proyecto,tiempo_total_dia2);
            
        } else {
            const horas = formatHour(hora_inicio,hora_fin)
            const tareaSaved = new tarea(null, fecha, horas.tiempo_formateado1, horas.tiempo_formateado2, 
                time.tiempo_minutos, time2.tarifa1, id_proyecto, id_servicio, time2.tarifa1*proyectFound.tarifa, status,null)
                
            await tarea.save(tareaSaved);

            await tarea.restPoolProjectById(id_proyecto,time.tiempo_minutos);
            
            
        }
        res.status(200).json({message: "se creao la tarea exitosamente"})
        /*res.status(200).json({
            total_time: time.tiempo_formateado,
            total_time2: time.tiempo_minutos,
            total_tarifa_dia1: time2.tarifa1,
            total_tarifa_da2: time2.tarifa2,
            siguiente_dia: time2.fin
        })*/
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getByProject = async (req, res) => {
    const { id } = req.params
    try {
        const proyectFound = await tarea.findProjectById(id);

        if (!proyectFound) return res.status(404).json({ message: 'Proyecto no encontrado' });

        const tasks = await tarea.findTaskByProjectId(id);
        res.status(200).json(tasks)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteById = async (req, res) => {
    const { id } = req.params
    try {
        const taskFound = await tarea.getTasksById(id);

        if (!taskFound) return res.status(404).json({ message: 'tarea no encontrada' });

        const deleteTask = await tarea.deleteTasksById(id);
        res.status(200).json(taskFound)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}