import { Clientes } from "../../../database/Replicacion.js"; //Necesario para la Replicacion

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


}

export default ClientesController