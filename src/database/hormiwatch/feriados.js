// feriados.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';

const Feriados = sequelize.define('feriados', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
    },
    nombre_feriado: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha_feriado: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
  timestamps: false, // Desactivar las columnas createdAt y updatedAt
});

export { Feriados } ;