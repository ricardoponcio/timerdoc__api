'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('armazenamento_acao', 'tamanho_kb', {
      type: Sequelize.DataTypes.DOUBLE(25, 4),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('armazenamento_acao', 'tamanho_kb', {
      type: Sequelize.DataTypes.BIGINT(11),
    });
  },
};
