'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'documento_geral_alerta',
      'tipo',
      {
        type: Sequelize.TEXT,
      },
    );
    await queryInterface.sequelize.query('drop type enum_documento_geral_alerta_tipo;')
      .then(() => queryInterface.changeColumn(
        'documento_geral_alerta',
        'tipo',
        {
          type: Sequelize.ENUM(
            'F', // Documentos Faltantes
            'P', // Pendente Entrega,
            'C', // Entregas em berto
            'A', // Proximo da entrega
          ),
        },
      ));
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'documento_geral_alerta',
      'tipo',
      {
        type: Sequelize.TEXT,
      },
    );
    await queryInterface.sequelize.query('drop type enum_documento_geral_alerta_tipo;')
      .then(() => queryInterface.changeColumn(
        'documento_geral_alerta',
        'tipo',
        {
          type: Sequelize.ENUM(
            'F', // Documentos Faltantes
            'P', // Pendente Entrega
            'C', // Entregas em berto
          ),
        },
      ));
  }
};
