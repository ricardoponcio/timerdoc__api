'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('documento_recorrente_anexo', 'ativo');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('documento_recorrente_anexo', 'ativo', {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },
};
