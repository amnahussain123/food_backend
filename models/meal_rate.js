'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class meal_rate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      meal_rate.belongsTo(models.Meal, {
        foreignKey: 'meal_id',
        as: 'meals',
        onDelete: 'CASCADE',
      })
    }
  }
  meal_rate.init({
    meal_id: DataTypes.INTEGER,
    rates: {type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { 
          msg: "Rate field is required",
         }
      }
    }
  }, {
    sequelize,
    modelName: 'meal_rate',
  });
  return meal_rate;
};