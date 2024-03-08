// servicios.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js'; 

const Servicios = sequelize.define('servicios', {
    id_servicio: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    }, 
    nombre_servicio: {
        type: DataTypes.STRING,
        allowNull: false,
    }, 
    plataforma_servicio: {
        type: DataTypes.STRING,
        allowNull: false,
    }, 
    categoria_servicio: {
        type: DataTypes.STRING,
        allowNull: false,
    }, 
    tipo_servicio: {
        type: DataTypes.STRING,
        allowNull: false,
    }, 
    descripcion_servicio: {
        type: DataTypes.STRING,
        allowNull: true,
    }
    }, {
        timestamps: false, // Desactivar las columnas createdAt y updatedAt

    });
  export { Servicios };