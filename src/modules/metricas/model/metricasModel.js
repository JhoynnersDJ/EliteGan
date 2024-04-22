import { Op } from 'sequelize';
import { Proyectos, Usuarios, Asignaciones, Tareas, ResponsablesClienteR, EstadoUsuarios, ClientesR } from '../../../database/hormiwatch/asociaciones.js'
import { sequelize } from "../../../database/sequelize.js";
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
    static async proyectosRecientes(){
        try {
          // funcion para las bases de datos de sequelize
          if (database === "SEQUELIZE") {
            const proyectos = await Proyectos.findAll({
                attributes:[
                    'id_proyecto',
                    'nombre_proyecto',
                    'fecha_inicio',
                    'fecha_fin',
                    'createdAt',
                    'pool_horas',
                    'pool_horas_contratadas'
                ],
                limit:2, 
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: ResponsablesClienteR,
                        attributes:[
                            'id_responsable_cliente',
                            ['nombre_responsable_cliente', 'nombre']
                        ],
                        include: [
                            {
                              model: ClientesR,
                              attributes: [
                                "nombre_cliente",
                              ],
                            },
                        ]
                    }
                ]
            })
            // formato de los datos
            const formattedProyectos = proyectos.map(proyecto => ({
                id_proyecto: proyecto.id_proyecto,
                nombre_proyecto: proyecto.nombre_proyecto,
                fecha_inicio: proyecto.fecha_inicio,
                fecha_fin: proyecto.fecha_fin,
                pool_horas: formatearMinutos(proyecto.pool_horas),
                pool_horas_contratadas: formatearMinutos(proyecto.pool_horas_contratadas),
                id_responsable_cliente: proyecto.responsables_cliente.dataValues.id_responsable_cliente,
                nombre_responsable_cliente: proyecto.responsables_cliente.dataValues.nombre,
                nombre_cliente: proyecto.responsables_cliente.cliente.dataValues.nombre_cliente,
            }))
            return formattedProyectos
        }
        } catch (error) {
            console.log(error.message)
        }
    }

    // metricas de un proyecto por id
    static async metricasProyecto(id_proyecto, fecha_busqueda_inicio, fecha_busqueda_fin){
        try {
          // funcion para las bases de datos de sequelize
          if (database === "SEQUELIZE") {
            // buscar los datos del proyecto
            const proyecto = await Proyectos.findByPk(id_proyecto, {
                attributes:[
                    'id_proyecto',
                    'nombre_proyecto',
                    'fecha_inicio',
                    'fecha_fin',
                    'pool_horas',
                    'pool_horas_contratadas',
                    'horas_trabajadas',
                    'tarifa'
                ],
                include: [
                    {
                        model: ResponsablesClienteR,
                        attributes:[
                            'id_responsable_cliente',
                            ['nombre_responsable_cliente', 'nombre']
                        ],
                        include: [
                            {
                              model: ClientesR,
                              attributes: [
                                "nombre_cliente",
                              ],
                            },
                        ]
                    }
                ]
            })
            // buscar los datos de las tareas de cada tecnico
            const tareas = await Tareas.findAll({
                where: {
                    id_proyecto: id_proyecto,
                    [Op.between]: [fecha_busqueda_inicio, fecha_busqueda_fin]
                },
                attributes: [
                    'id_usuario',
                    [sequelize.fn('sum', sequelize.col('tiempo_total')), 'total_tiempo'],
                    [sequelize.fn('sum', sequelize.col('total_tarifa')), 'total_tarifa'],
                    [sequelize.fn('count', sequelize.col('tareas.id_tarea')), 'cantidad_tareas']
                ],
                include:[
                    {
                        model: Usuarios,
                        attributes: [
                            'id_usuario',
                            'nombre',
                            'apellido'
                        ],
                        include:[{
                            model: EstadoUsuarios,
                            attributes: ['nombre_estado_usuario']
                        }]
                    }
                ],
                group: ['tareas.id_usuario']
            })
            // calculo total tarifa del proyecto, sumando los totales tarifa de cada tecnico 
            let sumaTotalTarifa = 0
            for (const tarea of tareas) {
                sumaTotalTarifa += parseFloat(tarea.dataValues.total_tarifa)
            }
            // formato de los datos tarea
            const formatedTarea = tareas.map(tarea => ({
                id_usuario: tarea.usuario.id_usuario,
                nombre_usuario: tarea.usuario.nombre,
                apellido_usuario: tarea.usuario.apellido,
                estado_usuario: tarea.usuario.estado_usuario.nombre_estado_usuario,
                total_tiempo_usuario: tarea.total_tiempo,
                total_tarifa_usuario: tarea.total_tarifa,
                cantidad_tareas: tarea.dataValues.cantidad_tareas
            }))
            // formato de los datos proyecto
            const formattedProyectos = {
                id_proyecto: proyecto.id_proyecto,
                nombre_proyecto: proyecto.nombre_proyecto,
                fecha_inicio: proyecto.fecha_inicio,
                fecha_fin: proyecto.fecha_fin,
                pool_horas: formatearMinutos(proyecto.pool_horas),
                pool_horas_contratadas: formatearMinutos(proyecto.pool_horas_contratadas),
                horas_trabajadas: formatearMinutos(proyecto.horas_trabajadas),
                id_responsable_cliente: proyecto.responsables_cliente.dataValues.id_responsable_cliente,
                nombre_responsable_cliente: proyecto.responsables_cliente.dataValues.nombre,
                nombre_cliente: proyecto.responsables_cliente.cliente.dataValues.nombre_cliente,
                total_tarifa_proyecto: sumaTotalTarifa,
                fecha_busqueda_inicio: fecha_busqueda_inicio,
                fecha_busqueda_fin: fecha_busqueda_fin,
                tareas: formatedTarea
            }
            return formattedProyectos
        }
        } catch (error) {
            console.log(error.message)
        }
    }

    // 2 proyectos mas recientes por usuario
    static async proyectosRecientesByUser(id_usuario){
        try {
          // funcion para las bases de datos de sequelize
          if (database === "SEQUELIZE") {
            const proyectos = await Proyectos.findAll({
                attributes:[
                    'id_proyecto',
                    'nombre_proyecto',
                    'fecha_inicio',
                    'createdAt'
                ],
                limit:2, 
                order: [['createdAt', 'DESC']],
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

    // horas individuales y cantidad de tareas de cada tecnico en un proyecto
    static async tareasPorTecnicoByProyecto(id_proyecto){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                const tareasPorTecnico = await Tareas.findAll({
                    attributes: [
                        'id_usuario',
                        [sequelize.fn('SUM', sequelize.col('tiempo_total')), 'tiempo_total'],
                        [sequelize.fn('COUNT', sequelize.col('*')), 'cantidad_tareas']
                    ],
                    where: {
                        id_proyecto
                    },
                    group: ['id_usuario'],
                    include:[
                        {
                            model: Usuarios,
                            attributes: [
                                'nombre',
                                'apellido'
                            ],
                            include:[{
                                model: EstadoUsuarios,
                                attributes: ['nombre_estado_usuario']
                            }]
                        }
                    ]
                })
                // formato de los datos
                const formatedTareasPorTecnico = tareasPorTecnico.map(tarea => ({
                    id_usuario: tarea.id_usuario,
                    tiempo_total: formatearMinutos(tarea.tiempo_total),
                    cantidad_tareas: tarea.dataValues.cantidad_tareas,
                    nombre_usuario: tarea.usuario.nombre,
                    apellido_usuario: tarea.usuario.apellido,
                    estado_usuario: tarea.usuario.estado_usuario.nombre_estado_usuario
                }))
                // return tareasPorTecnico
                return formatedTareasPorTecnico
            }
        } catch (error) {
            console.log(error.message)
        }
    }
}

