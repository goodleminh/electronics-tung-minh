import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/dbConnection.js';


export class User extends Model {}

User.init(
{
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
        field: 'user_id',
        defaultValue: DataTypes.UUIDV4,
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'username',
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password',
    }, 
    nickname: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'nick_name',
    },
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
});
