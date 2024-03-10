// clientes.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js'; 

const ClientesR = sequelize.define('clientes', {
  id_cliente: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        },
    nombre_cliente: {
        type: DataTypes.STRING,
        allowNull: false,
    },
  ubicacion: {
        type:DataTypes.STRING,
        allowNull:false,
    }  
    }, {
        timestamps: false, // Desactivar las columnas createdAt y updatedAt

    });
  export { ClientesR };