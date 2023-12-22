'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('planos', 'ordem',
      {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
    );
    await queryInterface.sequelize.query('update planos set ordem = 1');
    await queryInterface.sequelize.query('alter table planos alter column ordem set not null');
    await queryInterface.sequelize.query('insert into planos(nome, ordem, "createdAt", "updatedAt") values(\'BASICO\', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), (\'SIMPLES\', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), (\'COMPLETO\', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('planos', 'ordem');
  }
};
