import { ResponsablesCliente } from "../../../database/Replicacion.js"; //Necesario para la replica
import { ClientesR } from "../../../database/hormiwatch/clientes.js"; //Busqueda en la replica de clientes
import { ResponsableClienteReplica } from "../model/responsable_clienteModel.js"; // Funciones a diferentes bases de datos
import { ClienteReplica } from "../../clientes/model/clientesModel.js"; // Funciones a diferentes bases de datos
import date from "date-and-time"

class ResponsablesClienteController {
  static async create(req, res) {
      try {
        // Captura de datos del cuerpo de la solicitud
        const { nombre_responsable_cliente, cargo, departamento, telefono,cedula, id_cliente } = req.body;
  
        // Verificar si el cliente existe
        const cliente = await ClientesR.findByPk(id_cliente);
        if (!cliente) {
          return res.status(404).json({
            code: 'Recurso no encontrado',
            message: 'Cliente no encontrado',
            details: 'El cliente con el id '+ id + ' no se encuentra en la base de datos',
            timestamp: date.format(new Date(),  'YYYY-MM-DDTHH:mm:ss'),
            requestID: id
        });
        }
  
        // Crear el responsable del cliente
        const responsableCliente = await ResponsablesCliente.create({
          nombre_responsable_cliente,
          cargo,
          departamento,
          telefono,
          cedula,
          id_cliente: id_cliente, 
        });
  
        res.status(201).json({ message: 'Responsable de cliente creado correctamente', responsableCliente });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }

    // devuelve todos los registros 
    static async index (req, res) {
      try {
          // buscar todos los registros
          const responsables_cliente = await ResponsableClienteReplica.findAll()
          // si no hay responsables cliente
          if (!responsables_cliente) {
              return res.status(204).json({message: 'No hay clientes registrados en la base de datos', data: []})
          }
          // enviar respuesta
          res.status(200).json(responsables_cliente)
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
  }

  // devuelve un responsable cliente segun su ID
  static async getById (req, res){
      try {
          // capturar id de responsable cliente
          const { id } = req.params
          // comprobar si existe
          const responsible_client = await ResponsableClienteReplica.findByPk(id)
          if (!responsible_client) {
              return res.status(404).json({
                code: 'Recurso no encontrado',
                message: 'Responsable cliente no encontrado',
                details: 'El responsable cliente con el id '+ id + ' no se encuentra en la base de datos',
                timestamp: date.format(new Date(),  'YYYY-MM-DDTHH:mm:ss'),
                requestID: id
            })
          }
          // envia datos
          res.status(200).json(responsible_client)
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
  }

  // devuelve los responsables cliente de un cliente
  static async getByClient (req, res){
      try {
          // capturar id de cliente
          const { id } = req.params
          // comprobar si existe el cliente
          const clienteFound = await ClienteReplica.findByPk(id)
          if (!clienteFound) {
              return res.status(404).json({
                code: 'Recurso no encontrado',
                message: 'Cliente no encontrado',
                details: 'El cliente con el id '+ id + ' no se encuentra en la base de datos',
                timestamp: date.format(new Date(),  'YYYY-MM-DDTHH:mm:ss'),
                requestID: id
            })
          }
          // obtener todos los responsables cliente de un cliente
          const responsables_cliente = await ResponsableClienteReplica.findAll()
          // si no se encuentran tareas
          if (!responsables_cliente) {
              return res.status(204).json({message: 'Este cliente no tiene responsables', data: []})
          }
          // enviar los datos
          res.status(200).json(responsables_cliente)
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
  } 
}

export default ResponsablesClienteController