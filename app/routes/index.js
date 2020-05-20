const productsRoutes = require('./products_routes');
const orderRoutes = require('./order_routes');
module.exports = function(app, db) {
  productsRoutes(app, db);
  orderRoutes(app, db);
};