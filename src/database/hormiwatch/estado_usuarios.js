// estado_usuarios.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js'; 

const EstadoUsuarios = sequelize.define('estado_usuarios', {
id_estado_usuario: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
nombre_estado_usuario: {
    type: DataTypes.STRING,
    allowNull: false
  },
descripcion_estado_usuario: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: false, // Desactivar las columnas createdAt y updatedAt
});

export { EstadoUsuarios } ;