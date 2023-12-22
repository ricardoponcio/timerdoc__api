'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      {
        tableName: 'auditoria',
        schema: 'auditoria',
      },
      'data',
      {
        type: Sequelize.TEXT('long'),
      },
    );
  },

  async down(queryInterface, Sequelize) {},
};
