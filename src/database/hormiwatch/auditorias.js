// roles.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js'; 

const Auditorias = sequelize.define('auditorias', {
  id_auditoria: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  nombre_usuario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol_usuario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  datos: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
}, {
    timestamps: true,
    createdAt: true,
    updatedAt: false
});

export { Auditorias };