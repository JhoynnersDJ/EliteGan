import { Clientes } from "./cliente/clientes.js";
import { ClientesR } from "./hormiwatch/clientes.js";
import { ResponsablesCliente } from "./cliente/responsables_cliente.js";
import { ResponsablesClienteR } from "./hormiwatch/responsables_cliente.js";


// Escucha el evento 'afterCreate' en el modelo Cliente
Clientes.afterCreate(async (cliente) => {
  try {
    // Crea un registro en la base de datos syssopgan usando los datos del cliente creado
    await ClientesR.create({
        id_cliente: cliente.id_cliente,
        nombre_cliente: cliente.nombre_cliente,
        ubicacion: cliente.ubicacion,
    });
  } catch (error) {
    console.error('Error replicando cliente a syssopgan:', error);
  }
});

// Escucha el evento 'afterCreate' en el modelo Cliente
ResponsablesCliente.afterCreate(async (responsable) => {
  try {
    // Crea un registro en la base de datos syssopgan usando los datos del responsable cliente creado
    await ResponsablesClienteR.create({
      id_responsable_cliente: responsable.id_responsable_cliente,
      nombre_responsable_cliente: responsable.nombre_responsable_cliente,
      cargo: responsable.cargo,
      telefono:responsable.telefono,
      cedula:responsable.cedula,
      departamento:responsable.departamento,
      id_cliente:responsable.id_cliente,
    });
  } catch (error) {
    console.error('Error replicando responsable cliente a syssopgan:', error);
  }
});

export { Clientes, ClientesR, ResponsablesCliente, ResponsablesClienteR };
