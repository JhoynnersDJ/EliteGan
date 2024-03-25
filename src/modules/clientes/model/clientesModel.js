import {
  Proyectos,
  ResponsablesClienteR,
  ClientesR,
  Usuarios,
  Asignaciones,
  Tareas,
  Servicios,
} from "../../../database/hormiwatch/asociaciones.js";

const database = process.env.SELECT_DB;

export class ClienteReplica {
  constructor(id, nombre, ubicacion) {
    this.id = id;
    this.nombre = nombre;
    this.ubicacion = ubicacion;
  }

  // devuelve todos los registros
  static async findAll() {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        const clientes = await ClientesR.findAll();
        return clientes;
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // devuelve un unico registro segun su primary key
  static async findByPk(id) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        const cliente = await ClientesR.findByPk(id);
        return cliente;
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  static async getAllClient(id) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        const clientes = await ClientesR.findAll({
          include: [
            {
              model: ResponsablesClienteR,
              attributes: [
                ["nombre_responsable_cliente", "nombre"],
                ["cargo", "cargo"],
                ["departamento", "departamento"],
                ["telefono", "telefono"],
                ["cedula", "cedula"],
              ],
              include: [
                {
                  model: Proyectos,
                },
              ],
            },
          ],
        });
        var newClientes = [];
        function countProjects(responsables) {
          var count = 0;
          if (responsables.length !== 0) {
            responsables.forEach((responsable) => {
                count += responsable.proyectos.length;
            });
          }
          return count;
        }
        clientes.forEach((cliente) => {
          var formattedClients = {
            id_cliente: cliente.id_cliente,
            nombre_cliente: cliente.nombre_cliente,
            numero_responsables: cliente.responsables_clientes.length,
            numero_proyectos: countProjects(cliente.responsables_clientes),
          };
          newClientes.push(formattedClients);
        });
        //console.log(clientes[2].responsables_clientes[0].proyectos.length)
        return newClientes;
      }
    } catch (error) {
      console.log(error.message);
    }
  }
}
