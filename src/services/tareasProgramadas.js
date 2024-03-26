import cron from "node-cron";
import date from "date-and-time";
import { Proyecto } from "../modules/proyectos/model/ProyectoModel.js";
import tarea  from "../modules/tareas/model/TareaModel.js";

// cada dia comprueba los proyectos que deben finalizar automaticamente
const proyectoFin = cron.schedule('00 00 * * *', async () => {
    try {
        // fecha de hoy
        const now = new Date()
        const fecha_fin = date.format(now, 'YYYY-MM-DD')
        // obtener los proyectos que finalicen en la fecha actual
        const proyectos = await Proyecto.findProyectoByFechaFin(fecha_fin)
        if (!proyectos || proyectos.length == 0) {
            console.log('Hoy no finalizaron proyectos, fecha: ' + fecha_fin)
        }else{
            // concretar cada proyecto
            for (const proyecto of proyectos) {
                await Proyecto.concretarProyecto(proyecto.id_proyecto)
                console.log(fecha_fin + ': Proyecto concretado: ' + proyecto.id_proyecto)
                await tarea.completeTaskByProjectId(proyecto.id_proyecto)
                console.log(fecha_fin + ': Tareas concretadas del proyecto: ' + proyecto.id_proyecto)
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}, {
    scheduled: false,
    timezone: "America/Caracas"
})

export { proyectoFin }