// tareas.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';

const Tareas = sequelize.define('tareas', {
id_tarea: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
hora_inicio: {
    type: DataTypes.STRING,
    allowNull: false
  },
hora_fin: {
    type: DataTypes.STRING,
    allowNull: false
  },
tiempo_total: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
factor_tiempo_total: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
status: {
    type: DataTypes.STRING(36),
    allowNull: false
  },
total_tarifa: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
id_proyecto: {
    type: DataTypes.UUID, // Tipo de datos UUID para la clave externa
    allowNull: false,
    references: {
      model: 'proyectos', // Nombre del modelo de la tabla a la que se hace referencia
      key: 'id_proyectos', // Clave primaria de la tabla a la que se hace referencia
    },
  },
id_servicio: {
    type: DataTypes.UUID, // Tipo de datos UUID para la clave externa
    allowNull: false,
    references: {
      model: 'servicios', // Nombre del modelo de la tabla a la que se hace referencia
      key: 'id_servicio', // Clave primaria de la tabla a la que se hace referencia
    },
  },
}, {
  timestamps: false, // Desactivar las columnas createdAt y updatedAt
});

export { Tareas } ;