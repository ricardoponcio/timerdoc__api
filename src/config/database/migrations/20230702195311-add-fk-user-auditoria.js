'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('delete from auditoria.auditoria where not exists (select id from public.usuario where id = user_id);');
    await queryInterface.changeColumn(
      {
        tableName: 'auditoria',
        schema: 'auditoria',
      },
      'user_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: {
            tableName: 'usuario',
            schema: 'public',
          },
          key: 'id',
        },
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      {
        tableName: 'auditoria',
        schema: 'auditoria',
      },
      'user_id',
      {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
    );
  },
};
