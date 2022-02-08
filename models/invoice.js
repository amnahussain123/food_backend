'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      invoice.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'users',
        onDelete: 'CASCADE',
      })
    }
  }
  invoice.init({
    user_id: DataTypes.INTEGER,
    plan: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'invoice',
  });
  return invoice;
};