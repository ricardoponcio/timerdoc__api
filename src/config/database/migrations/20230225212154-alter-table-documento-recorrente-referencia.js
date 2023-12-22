'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('documento_recorrente', 'referente_a',
      {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('documento_geral', 'referente_a')
  }
};
