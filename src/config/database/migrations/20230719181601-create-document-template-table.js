'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documento_formulario',
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
          defaultValue: Sequelize.fn('NOW')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        nivel: {
          type: Sequelize.DataTypes.ENUM([
            'EMPRESA',
            'DOCUMENTO'
          ]),
          allowNull: false
        },
        nome: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        descricao: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        corpo: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        assinatura: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        referencia: {
          type: Sequelize.TEXT,
          allowNull: true
        },

        // Relacionamentos
        usuario_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'usuario',
            key: 'id'
          }
        },
        empresa_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'empresa',
            key: 'id'
          }
        },
        documento_geral_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'documento_geral',
            key: 'id'
          }
        }
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('variavel');
  },
};
