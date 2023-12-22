'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn({
      tableName: 'auditoria',
      schema: 'auditoria'
    }, 'user_id', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn({
      tableName: 'auditoria',
      schema: 'auditoria'
    }, 'user_id');
  }
};
