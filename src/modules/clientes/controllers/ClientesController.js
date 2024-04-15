import { Clientes } from "../../../database/Replicacion.js"; //Necesario para la Replicacion
import { ClienteReplica } from "../model/clientesModel.js" // Funciones a diferentes bases de datos
import date from "date-and-time"

class ClientesController {

        // crear un cliente
        static async create (req, res){
            try {
                // capturar datos
                const { nombre_cliente, ubicacion } = req.body
                // guardar en la base de datos
                await Clientes.create(
                    { nombre_cliente: nombre_cliente, ubicacion: ubicacion },
                    { fields: ['nombre_cliente', 'ubicacion'] }
                  )
                res.status(201).json({ message: 'Cliente registrado correctamente' })
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }

    // devuelve todos los registros 
    static async index (req, res) {
        try {
            // buscar todos los registros
            const clientes = await ClienteReplica.findAll()
            // si no se encuentran registros en la base de datos
            if (!clientes) {
                return res.status(204).json({message: 'No hay clientes registrados en la base de datos', data: []})
            }
            // enviar respuesta
            res.status(200).json(clientes)
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // devuelve el registro de una replica de cliente segun su ID
    static async getById (req, res){
        try {
            // capturar id de cliente
            const { id } = req.params
            // comprobar si existe
            const cliente = await ClienteReplica.findByPk(id)
            // si no hay cliente
            if (!cliente) {
                return res.status(404).json({
                    code: 'Recurso no encontrado',
                    message: 'Cliente no encontrado',
                    details: 'El cliente con el id '+ id + ' no se encuentra en la base de datos',
                    timestamp: date.format(new Date(),  'YYYY-MM-DDTHH:mm:ss'),
                    requestID: id
                })
            }
            // envia los datos
            res.status(200).json(cliente)
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // devuelve todos los registros 
    static async getAll (req, res) {
        try {
            // buscar todos los registros
            const clientes = await ClienteReplica.getAllClient()
            // si no se encuentran registros en la base de datos
            if (!clientes) {
                return res.status(204).json({message: 'No hay clientes registrados en la base de datos', data: []})
            }
            // enviar respuesta
            res.status(200).json(clientes)
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default ClientesController