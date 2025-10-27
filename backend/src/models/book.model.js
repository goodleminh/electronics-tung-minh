import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnection.js";

export class Book extends Model {}

Book.init(
  {
    bookId: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: "book_id",
      defaultValue: DataTypes.UUIDV4,
    },
    bookName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "book_name",
    },
    bookDescription: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "book_description",
    }, 
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "thumbnail",
    },
    author: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "author",
    },
    categoryId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "category_id",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Book",
    tableName: "books",
    timestamps: true,
  }
);