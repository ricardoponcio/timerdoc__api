'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createSchema('auditoria');
    await queryInterface.createTable(
      'auditoria',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        operation: {
          type: Sequelize.DataTypes.ENUM(['I', 'U', 'D']),
          allowNull: false,
        },
        data: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      {
        schema: 'auditoria',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('auditoria', {
      schema: 'auditoria',
    });
    await queryInterface.dropSchema('auditoria');
  },
};
