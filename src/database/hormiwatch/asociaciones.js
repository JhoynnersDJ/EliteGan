// Relaciones entre modelos
import { Asignaciones } from "./asignaciones.js";
import { ClientesR } from "./clientes.js";
import { EstadoUsuarios } from "./estado_usuarios.js";
import { Proyectos } from "./proyectos.js";
import { ResponsablesClienteR } from "./responsables_cliente.js";
import { Roles } from "./roles.js";
import { Servicios } from "./servicios.js";
import { Tareas } from "./tareas.js";
import { Usuarios } from "./usuarios.js";
import { Notificaciones } from "./notificaciones.js"


/* ----- Asociaciones relacionadas a Roles  ----- */

// Un rol tiene muchos usuarios
// Definir la relación de uno a muchos con roles y usuarios
Roles.hasMany(Usuarios, { foreignKey:'id_rol'});
Usuarios.belongsTo(Roles, { targetKey:'id_rol', foreignKey: 'id_rol'});

/* ----- Asociaciones relacionadas a Tareas  ----- */

// Un rol tiene muchos usuarios
// Definir la relación de uno a muchos con roles y usuarios
Usuarios.hasMany(Tareas, { foreignKey:'id_usuario'});
Tareas.belongsTo(Usuarios, { targetKey:'id_usuario', foreignKey: 'id_usuario'});

Usuarios.hasMany(Proyectos, { foreignKey:'id_lider_proyecto', sourceKey: 'id_usuario'});
Proyectos.belongsTo(Usuarios, { as: 'lider', targetKey:'id_usuario', foreignKey: 'id_lider_proyecto'});

/* ----- Asociaciones relacionadas a EstadoUsuarios  ----- */

// Un estado de usuario tiene muchos usuarios
// Definir la relación de uno a muchos con EstadoUsuarios y Usuarios
EstadoUsuarios.hasMany(Usuarios, { foreignKey:'id_estado_usuario'});
Usuarios.belongsTo(EstadoUsuarios, { targetKey:'id_estado_usuario', foreignKey: 'id_estado_usuario'});


/*  ----- Asociaciones relacionadas a Cliente ----- */

// Un cliente (replica) tiene muchos responsables cliente
// Definir la relación de uno a muchos con Cliente y ResponsableCliente
ClientesR.hasMany(ResponsablesClienteR, { foreignKey:'id_cliente'});
ResponsablesClienteR.belongsTo(ClientesR, { targetKey:'id_cliente', foreignKey: 'id_cliente'});


/* ----- Asociaciones relacionadas a ResponsableCliente -----*/

// Un responsable tecnico tiene muchos proyectos
// Definir la relación de uno a muchos con ResponsableCliente y Proyecto
ResponsablesClienteR.hasMany(Proyectos, { foreignKey:'id_responsable_cliente'});
Proyectos.belongsTo(ResponsablesClienteR, { targetKey:'id_responsable_cliente', foreignKey: 'id_responsable_cliente' });


/* ----- Asociaciones relacionadas a Proyecto ----- */

// Un proyecto tiene muchas tareas
// Definir la relación de uno a muchos con Proyectos y Tareas
Proyectos.hasMany(Tareas, { foreignKey:'id_proyecto'});
Tareas.belongsTo(Proyectos, { targetKey:'id_proyecto', foreignKey: 'id_proyecto'});


/* ----- Asociaciones relacionadas a Servicio ----- */

// Un servicio tiene muchas tareas
// Definir la relación de uno a muchos con Servicios y Tareas
Servicios.hasMany(Tareas, { foreignKey:'id_servicio'});
Tareas.belongsTo(Servicios, { targetKey:'id_servicio', foreignKey: 'id_servicio'});



/* ----- Asociaciones MUCHOS A MUCHOS -----*/

// Un usuario tiene muchos proyectos y proyectos tiene muchos usuarios
// Definir la relación de muchos a muchos con Proyectos y Usuarios
Proyectos.belongsToMany(Usuarios, { through: Asignaciones, foreignKey: 'id_proyecto', targetKey: 'id_usuario'});
Usuarios.belongsToMany(Proyectos, { through: Asignaciones, foreignKey: 'id_usuario', targetKey: 'id_proyecto'});
Proyectos.belongsToMany(Usuarios, { through: Asignaciones, foreignKey: 'id_proyecto', as: 'tecnicos', targetKey: 'id_usuario'});

Usuarios.belongsToMany(Proyectos, { through: Notificaciones, foreignKey: 'id_usuario', targetKey: 'id_lider_proyecto'});
Proyectos.belongsToMany(Usuarios, { through: Notificaciones, foreignKey: 'id_proyecto', targetKey: 'id_lider_proyecto'});


/* ----- Hooks ----- */


/* ----- exportar los modelos con sus respectivas relaciones ----- */
export { Asignaciones, ClientesR, EstadoUsuarios,  Proyectos, ResponsablesClienteR, Roles, Servicios, Tareas, Usuarios, Notificaciones }