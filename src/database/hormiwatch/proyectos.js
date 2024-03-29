// proyectos.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';

const Proyectos = sequelize.define('proyectos', {
id_proyecto: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
nombre_proyecto: {
    type: DataTypes.STRING,
    allowNull: false
  },
tarifa: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
status: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
fecha_fin: {
    type: DataTypes.DATE,
    allowNull: false
  },
pool_horas: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
id_responsable_cliente: {
    type: DataTypes.UUID, // Tipo de datos UUID para la clave externa
    allowNull: false,
    references: {
      model: 'responsables_cliente', // Nombre del modelo de la tabla a la que se hace referencia
      key: 'id_responsable_cliente', // Clave primaria de la tabla a la que se hace referencia
    },
  },
}, {
  timestamps: false, // Desactivar las columnas createdAt y updatedAt
});

export { Proyectos } ;