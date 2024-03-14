import { Proyectos, Usuarios, Asignaciones, Tareas, ResponsablesClienteR } from '../../../database/hormiwatch/asociaciones.js'
import { formatearMinutos } from "../../proyectos/libs/pool_horas.js";
import { sumTareaTiempoTotal } from "../libs/sumTareaTiempoTotal.js"

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

    // 2 proyectos mas recientes
    static async proyectosRecientes(id_usuario){
        try {
          // funcion para las bases de datos de sequelize
          if (database === "SEQUELIZE") {
            const proyectos = await Proyectos.findAll({
                attributes:[
                    'id_proyecto',
                    'nombre_proyecto',
                    'fecha_inicio'
                ],
                limit:2, 
                order: [['fecha_inicio', 'DESC']],
                include: [
                    {
                        model: Tareas,
                        attributes:[
                            'tiempo_total'
                        ]
                    },
                    {
                        model: ResponsablesClienteR,
                        attributes:[
                            'id_responsable_cliente',
                            ['nombre_responsable_cliente', 'nombre']
                        ]
                    },
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
            // formato de los datos
            const formattedProyectos = proyectos.map(proyecto => ({
                id_proyecto: proyecto.id_proyecto,
                nombre_proyecto: proyecto.nombre_proyecto,
                fecha_inicio: proyecto.fecha_inicio,
                id_responsable_cliente: proyecto.responsables_cliente.dataValues.id_responsable_cliente,
                nombre_responsable_cliente: proyecto.responsables_cliente.dataValues.nombre,
                tiempo_total: formatearMinutos(sumTareaTiempoTotal(proyecto.tareas)),
            }))
            return formattedProyectos
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
            const total = formatearMinutos(sumTareaTiempoTotal(filas))
            return total
        }
        } catch (error) {
            console.log(error.message)
        }
    }
}

