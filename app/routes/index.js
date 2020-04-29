const productsRoutes = require('./products_routes');
module.exports = function(app, db) {
  productsRoutes(app, db);

};