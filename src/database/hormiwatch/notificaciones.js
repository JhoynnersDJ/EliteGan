// notificaciones.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { Usuarios } from './usuarios.js';
import { Proyectos } from './proyectos.js';

const Notificaciones = sequelize.define('notificaciones', {
id_proyecto: {
    type: DataTypes.UUID, // Tipo de datos UUID para la clave externa
    allowNull: false,
    references: {
      model: Proyectos, // Nombre del modelo de la tabla a la que se hace referencia
      key: 'id_proyecto', // Clave primaria de la tabla a la que se hace referencia
    },
  },
id_lider_proyecto: {
    type: DataTypes.UUID, // Tipo de datos UUID para la clave externa
    allowNull: true,
    references: {
      model: Usuarios, // Nombre del modelo de la tabla a la que se hace referencia
      key: 'id_usuario', // Clave primaria de la tabla a la que se hace referencia
    },
  },
}, {
  timestamps: false, // Desactivar las columnas createdAt y updatedAt
});

export { Notificaciones } ;