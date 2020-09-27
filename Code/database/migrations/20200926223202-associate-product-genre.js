'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'products',
      'genre_id',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'genres', // name of Target table
          key: 'id', // key in Target table that we're referencing
        }
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'products', // name of Source table
      'genre_id' // key we want to remove
    );
  }
};