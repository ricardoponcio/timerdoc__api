'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'usuario_empresa',
      'usuario_empresa_convite_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario_empresa_convite',
          key: 'id',
        },
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'usuario_empresa',
      'usuario_empresa_convite_id'
    );
  },
};
