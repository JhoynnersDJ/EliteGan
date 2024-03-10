import { ClientesR } from '../../../database/hormiwatch/asociaciones.js'

const database = process.env.SELECT_DB;

export class ClienteReplica {
    constructor(id, nombre, ubicacion){
        this.id = id
        this.nombre= nombre
        this.ubicacion = ubicacion
    }
    
    // devuelve todos los registros
    static async findAll(){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                const clientes = await ClientesR.findAll()
                return clientes
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
                const cliente = await ClientesR.findByPk(id)
                return cliente
            }
        } catch (error) {
            console.log(error.message)
        }
    }
}