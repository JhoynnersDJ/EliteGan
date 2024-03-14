import { Proyectos, Usuarios, Asignaciones, Tareas} from '../../../database/hormiwatch/asociaciones.js'
import { formatearMinutos } from "../../proyectos/libs/pool_horas.js";

const database = process.env.SELECT_DB;

export class Metricas {
    constructor(id_proyecto, id_responsable_cliente, id_usuario, id_cliente){
        this.id_proyecto = id_proyecto
        this.id_responsable_cliente= id_responsable_cliente
        this.id_usuario = id_usuario
        this.id_cliente = id_cliente
    }

    // cantidad de proyectos completados por un tecnico
    static async proyectosCompletadosByUsuario(id_usuario){
        try {
          // funcion para las bases de datos de sequelize
          if (database === "SEQUELIZE") {
            const numProyectosCompletados = await Proyectos.count({
                where: {
                    status: 1
                },
                include: [
                    {
                        model: Usuarios,
                        attributes: [],
                        through:{
                            model: Asignaciones,
                            attributes: [],
                        },
                        where: { id_usuario }
                    }
                ]
            })
            return numProyectosCompletados
        }
        } catch (error) {
            console.log(error.message)
        }
    }

    // cantidad de tareas de un tecnico
    static async tareasByTecnico(id_usuario){
        try {
          // funcion para las bases de datos de sequelize
          if (database === "SEQUELIZE") {
            const numTareasRegistradas = await Tareas.count({
                where: {
                    id_usuario
                }
            })
            return numTareasRegistradas
        }
        } catch (error) {
            console.log(error.message)
        }
    }

    // suma del factor tiempo total por usuario
    static async totalFactorByUser(id_usuario){
        try {
          // funcion para las bases de datos de sequelize
          if (database === "SEQUELIZE") {
            // buscar todos los registros
            const filas = await Tareas.findAll({
                attributes:['tiempo_total'],
                where: {
                    id_usuario
                }
            })
            let tiempo_total = 0
            for (let i = 0; i < filas.length; i++) {
                tiempo_total = tiempo_total + filas[i].tiempo_total
            }
            const total = formatearMinutos(tiempo_total)
            return total
        }
        } catch (error) {
            console.log(error.message)
        }
    }
}

