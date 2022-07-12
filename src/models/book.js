'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Book.hasOne(models.User, {
        sourceKey: 'user_id',
        foreignKey: 'id',
      })
    }
  }
  Book.init({
    title: {
      type: DataTypes.STRING,
      required:true
    },
    author_name: {
      type: DataTypes.STRING,
      required:true
    },
    isbn:{
      type: DataTypes.STRING,
      required:true
    },
    book_file: {
      type: DataTypes.TEXT,
      allowNull:true
  },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '0:inactive,1:active,2:delete',
    },
  }, {
    sequelize,
    timestamps:true,
    modelName: 'Book',
    tableName: 'books'
  });
  return Book;
};