// asignaciones.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { Usuarios } from './usuarios.js';
import { Proyectos } from './proyectos.js';

const Asignaciones = sequelize.define('asignaciones', {
id_asignacion: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
id_usuario: {
    type: DataTypes.UUID, // Tipo de datos UUID para la clave externa
    allowNull: false,
    references: {
      model: Usuarios, // Nombre del modelo de la tabla a la que se hace referencia
      key: 'id_usuario', // Clave primaria de la tabla a la que se hace referencia
    },
  },
status: {
    type: DataTypes.BOOLEAN, // Tipo de datos UUID para la clave externa
    defaultValue: true,
    allowNull: true
  },
}, {
  timestamps: false, // Desactivar las columnas createdAt y updatedAt
});

export { Asignaciones } ;