'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('documento_geral', 'data_inicio_contagem', {
      type: DataTypes.DATE
    });
    await queryInterface.changeColumn('documento_geral', 'data_fim_contagem', {
      type: DataTypes.DATE
    });
    await queryInterface.changeColumn('documento_recorrente', 'referente_a', {
      type: DataTypes.DATE
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('documento_geral', 'data_inicio_contagem', {
      type: DataTypes.DATEONLY
    });
    await queryInterface.changeColumn('documento_geral', 'data_fim_contagem', {
      type: DataTypes.DATEONLY
    });
    await queryInterface.changeColumn('documento_recorrente', 'referente_a', {
      type: DataTypes.DATEONLY
    });
  }
};
