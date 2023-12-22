'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuario_empresa_convite',
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
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        email_convidado: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        nome_convidado: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        hash_recuperacao: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        // Relacionamentos
        usuario_origem_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'usuario',
            key: 'id'
          }
        },
        usuario_criacao_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'usuario',
            key: 'id'
          }
        },
        empresa_convite_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'empresa',
            key: 'id'
          }
        },
        role_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'role',
            key: 'id'
          }
        },
        desistencia_usuario_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'usuario',
            key: 'id'
          }
        }
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuario_empresa_convite');
  },
};
