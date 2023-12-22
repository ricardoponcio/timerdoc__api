'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('role', 'ordem',
      {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true
      },
    );
    await queryInterface.sequelize.query('update role set ordem = 1');
    await queryInterface.sequelize.query('alter table role alter column ordem set not null');
    await queryInterface.sequelize.query('insert into role(nome, ordem, "createdAt", "updatedAt") values(\'ADM\', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), (\'Gestor\', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), (\'Usuario\', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), (\'Visualizador\', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('role', 'ordem');
  }
};
