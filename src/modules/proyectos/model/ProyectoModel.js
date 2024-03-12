import { Proyectos, ResponsablesClienteR, ClientesR, Usuarios, Asignaciones } from '../../../database/hormiwatch/asociaciones.js'

const database = process.env.SELECT_DB;

export class Proyecto {
    constructor(nombre, tarifa, pool, fecha_fin, responsable_cliente, id_tecnico){
        this.nombre = nombre
        this.tarifa= tarifa
        this.pool = pool
        this.fecha_fin= fecha_fin
        this.responsable_cliente = responsable_cliente
        this.id_tecnico = id_tecnico
    }

    // devuelve todos los registros
    static async findAll(){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                const proyectos = await Proyectos.findAll({
                    include: [
                        {
                            model: ResponsablesClienteR,
                            attributes: [
                                ['nombre_responsable_cliente','nombre']
                            ],
                            include: [
                                {
                                    model: ClientesR,
                                    attributes: [
                                        ['id_cliente', 'id'],
                                        ['nombre_cliente', 'nombre']
                                    ],
                                }
                            ]
                        },
                        {
                            model: Usuarios,
                            attributes: [
                                ['id_usuario', 'id'],
                                'nombre',
                                'apellido',
                                'email'
                            ],
                            through:{
                                model: Asignaciones,
                                attributes: []
                            }
                        }
                    ]
                })
                // formato de los datos
                const formattedProyectos = proyectos.map(proyecto => ({
                    id_proyecto: proyecto.id_proyecto,
                    nombre: proyecto.nombre_proyecto,
                    tarifa: proyecto.tarifa,
                    status: proyecto.status,
                    fecha_inicio: proyecto.fecha_inicio,
                    fecha_fin: proyecto.fecha_fin,
                    pool_horas: proyecto.pool_horas,
                    id_responsable_cliente: proyecto.id_responsable_cliente,
                    nombre_responsable_cliente: proyecto.responsables_cliente.dataValues.nombre,
                    id_cliente: proyecto.responsables_cliente.cliente.dataValues.id,
                    nombre_cliente: proyecto.responsables_cliente.cliente.dataValues.nombre,
                    usuarios: proyecto.usuarios
                }))
                return formattedProyectos
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    // devuelve todos los registros segun el usuario
    static async findByUser(id){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                const proyectos = await Proyectos.findAll({
                    include: [
                        {
                            model: ResponsablesClienteR,
                            attributes: [
                                ['nombre_responsable_cliente','nombre']
                            ],
                            include: [
                                {
                                    model: ClientesR,
                                    attributes: [
                                        ['id_cliente', 'id'],
                                        ['nombre_cliente', 'nombre']
                                    ],
                                }
                            ]
                        },
                        {
                            model: Usuarios,
                            attributes: [],
                            through:{
                                model: Asignaciones,
                                attributes: [],
                            },
                            where: { id_usuario: id }
                        },
                        {
                            model: Usuarios,
                            as: 'tecnicos',
                            attributes: [
                                ['id_usuario', 'id'],
                                'nombre',
                                'apellido',
                                'email'
                            ],
                            through:{
                                model: Asignaciones,
                                attributes: [],
                            }
                        }
                    ]
                })
                // formato de los datos
                const formattedProyectos = proyectos.map(proyecto => ({
                    id_proyecto: proyecto.id_proyecto,
                    nombre: proyecto.nombre_proyecto,
                    tarifa: proyecto.tarifa,
                    status: proyecto.status,
                    fecha_inicio: proyecto.fecha_inicio,
                    fecha_fin: proyecto.fecha_fin,
                    pool_horas: proyecto.pool_horas,
                    id_responsable_cliente: proyecto.id_responsable_cliente,
                    nombre_responsable_cliente: proyecto.responsables_cliente.dataValues.nombre,
                    id_cliente: proyecto.responsables_cliente.cliente.dataValues.id,
                    nombre_cliente: proyecto.responsables_cliente.cliente.dataValues.nombre,
                    usuarios: proyecto.tecnicos
                }))
                return formattedProyectos
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    // devuelve un unico registro segun su primary key
    static async findByPk(id){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                const proyecto = await Proyectos.findByPk(id,{
                    include: [
                        {
                            model: ResponsablesClienteR,
                            attributes: [
                                ['nombre_responsable_cliente','nombre']
                            ],
                            include: [
                                {
                                    model: ClientesR,
                                    attributes: [
                                        ['id_cliente', 'id'],
                                        ['nombre_cliente', 'nombre']
                                    ],
                                }
                            ]
                        },
                        {
                            model: Usuarios,
                            attributes: [
                                ['id_usuario', 'id'],
                                'nombre',
                                'apellido',
                                'email'
                            ],
                            through:{
                                model: Asignaciones,
                                attributes: []
                            }
                        }
                    ]
                })
                // formato de los datos
                const formattedProyecto = {
                    id_proyecto: proyecto.id_proyecto,
                    nombre: proyecto.nombre_proyecto,
                    tarifa: proyecto.tarifa,
                    status: proyecto.status,
                    fecha_inicio: proyecto.fecha_inicio,
                    fecha_fin: proyecto.fecha_fin,
                    pool_horas: proyecto.pool_horas,
                    id_responsable_cliente: proyecto.id_responsable_cliente,
                    nombre_responsable_cliente: proyecto.responsables_cliente.dataValues.nombre,
                    id_cliente: proyecto.responsables_cliente.cliente.dataValues.id,
                    nombre_cliente: proyecto.responsables_cliente.cliente.dataValues.nombre,
                    usuarios: proyecto.usuarios
                }
                return formattedProyecto
            }
        } catch (error) {
            console.log(error.message)
        }
    }




















    
    // registra un unico registro en la base de datos
    static async create(servicio){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                // guardar en la base de datos
                const result = await Servicios.create({
                    id_servicio: servicio.id,
                    nombre_servicio: servicio.nombre,
                    descripcion_servicio: servicio.descripcion,
                    tipo_servicio: servicio.tipo,
                    categoria_servicio: servicio.categoria,
                    plataforma_servicio: servicio.plataforma
                }, { fields: [
                        'id_servicio',
                        'nombre_servicio',
                        'descripcion_servicio',
                        'tipo_servicio',
                        'categoria_servicio',
                        'plataforma_servicio'
                    ]}
                )
                return result
            }
        } catch (error) {
            console.log(error.message)
        }
    }
}