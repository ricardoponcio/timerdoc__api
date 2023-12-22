'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'armazenamento_acao',
      'md5',
      {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'armazenamento_acao',
      'md5'
    );
  }
};
