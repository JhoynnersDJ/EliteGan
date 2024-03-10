import { ResponsablesClienteR, ClientesR } from '../../../database/hormiwatch/asociaciones.js'

const database = process.env.SELECT_DB;

export class ResponsableClienteReplica {
    constructor(id, nombre, cargo, departamento, telefono, cedula, id_cliente){
        this.id = id
        this.nombre= nombre
        this.ubicacion = cargo
        this.departamento = departamento
        this.telefono = telefono
        this.cedula = cedula
        this.id_cliente = id_cliente
    }
    
    // devuelve todos los registros
    static async findAll(){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                const responsables_cliente = await ResponsablesClienteR.findAll({
                    include: [
                        {
                            model: ClientesR,
                            attributes: [
                                ['nombre_cliente', 'nombre'],
                                'ubicacion'
                            ]
                        }
                    ]
                })
                // formato de los datos
                const responsablesFormated = responsables_cliente.map(responsable => ({
                    id_responsable_cliente: responsable.dataValues.id_responsable_cliente,
                    nombre: responsable.dataValues.nombre_responsable_cliente,
                    cargo: responsable.dataValues.cargo,
                    departamento: responsable.dataValues.departamento,
                    telefono: responsable.dataValues.telefono,
                    cedula: responsable.dataValues.cedula,
                    id_cliente: responsable.dataValues.id_cliente,
                    nombre_cliente: responsable.dataValues.cliente ? responsable.cliente.dataValues.nombre : null,
                    ubicacion_cliente: responsable.dataValues.cliente ? responsable.cliente.dataValues.ubicacion : null,
                }))
                return responsablesFormated
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
                const responsable_cliente = await ResponsablesClienteR.findByPk(id,{
                    include: [
                        {
                            model: ClientesR,
                            attributes: [
                                ['nombre_cliente', 'nombre'],
                                'ubicacion'
                            ]
                        }
                    ]
                })
                // formato de los datos
                const responsable_clienteFormated = {
                    id_responsable_cliente: responsable_cliente.dataValues.id_responsable_cliente,
                    nombre: responsable_cliente.dataValues.nombre_responsable_cliente,
                    cargo: responsable_cliente.dataValues.cargo,
                    departamento: responsable_cliente.dataValues.departamento,
                    telefono: responsable_cliente.dataValues.telefono,
                    cedula: responsable_cliente.dataValues.cedula,
                    id_cliente: responsable_cliente.dataValues.id_cliente,
                    nombre_cliente: responsable_cliente.dataValues.cliente ? responsable_cliente.cliente.dataValues.nombre : null,
                    ubicacion_cliente: responsable_cliente.dataValues.cliente ? responsable_cliente.cliente.dataValues.ubicacion : null
                }
                return responsable_clienteFormated
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    // devuelve todos los registros segun el cliente
    static async findByCliente(id){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                const responsable_cliente = await ResponsablesClienteR.findByPk({
                    attributes: [
                        'id_responsable_cliente',
                        ['nombre_responsable_cl', 'nombre'],
                        'cargo',
                        'departamento',
                        'telefono',
                        'cedula'
                    ],
                    where: {
                        id_cliente: id
                    }
                })
                return responsable_cliente
            }
        } catch (error) {
            console.log(error.message)
        }
    }
}