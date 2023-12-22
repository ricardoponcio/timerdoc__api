'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.addConstraint('usuario', {
      fields: ['email'],
      type: 'unique',
      name: 'unique_email_constraint'
     });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('usuario','unique_email_constraint');
  }
};
