// roles.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js'; 

const Roles = sequelize.define('roles', {
  id_rol: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  nombre_rol: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion_rol: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false, // Esto desactiva la creación automática de las columnas createdAt y updatedAt
});

export { Roles };