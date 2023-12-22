'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'usuario_empresa_convite',
      'status',
      {
        type: Sequelize.DataTypes.ENUM([
          'A', // Acecpted
          'D', // Declined
        ]),
        allowNull: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'usuario_empresa_convite',
      'status'
    );
  }
};
