'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('documento_recorrente_anexo', 'tamanho', {
      type: Sequelize.DataTypes.BIGINT(20),
      allowNull: false,
      defaultValue: BigInt(1),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('documento_recorrente_anexo', 'tamanho');
  },
};
