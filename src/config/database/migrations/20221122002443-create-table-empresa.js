'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('empresa', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      cnpj: {
        type: Sequelize.STRING(14),
        allowNull: false,
        unique: true
      },
      razao_social: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      fantasia: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      plano_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'planos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     await queryInterface.dropTable('empresa');
  }
};
