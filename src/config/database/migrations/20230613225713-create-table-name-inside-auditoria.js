'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      {
        tableName: 'auditoria',
        schema: 'auditoria',
      },
      'table_name',
      {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      {
        tableName: 'auditoria',
        schema: 'auditoria',
      },
      'table_name',
    );
  },
};
