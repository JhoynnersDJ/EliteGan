import { ResponsablesCliente } from "../../../database/Replicacion.js"; //Necesario para la replica
import { ClientesR } from "../../../database/hormiwatch/clientes.js"; //Busqueda en la replica de clientes



class ResponsablesClienteController {

    static async create(req, res) {
        try {
          // Captura de datos del cuerpo de la solicitud
          const { nombre_responsable_cliente, cargo, departamento, telefono,cedula, id_cliente } = req.body;
    
          // Verificar si el cliente existe
          const cliente = await ClientesR.findByPk(id_cliente);
          if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
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



}

export default ResponsablesClienteController