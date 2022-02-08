'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Meal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Meal.hasOne(models.meal_rate, {
        foreignKey: 'meal_id',
        as: 'rate',
        onDelete: 'CASCADE',
      });
    }
  }
  Meal.init({
    menu: 
    {type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { 
          msg: "Menu field is required",
         }
      }
    },
    day: 
    {type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { 
          msg: "Day field is required",
         }
      }
    },
    date: 
    {type:DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: { 
          msg: "Date field is required",
         }
      }
    },
    week: 
    {type:DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { 
          msg: "Week no field is required",
         }
      }
    }
  }, {
    sequelize,
    modelName: 'Meal',
  });
  return Meal;
};