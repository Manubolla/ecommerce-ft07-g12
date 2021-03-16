require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const ProductImages = require('./models/ProdImages');
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;

const sequelize = new Sequelize(
 `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
 {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
  ssl: {
    rejectUnauthorized: false
  }
 }
);
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs
 .readdirSync(path.join(__dirname, '/models'))
 .filter(
  (file) =>
   file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
 )
 .forEach((file) => {
  modelDefiners.push(require(path.join(__dirname, '/models', file)));
 });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
 entry[0][0].toUpperCase() + entry[0].slice(1),
 entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Product, ProdImages, Category, ProductCategory,User, Order, OrderLine, Review } = sequelize.models;

// Aca vendrian las relaciones
// Product.hasMany(Reviews);

//Categorias de productos
Product.belongsToMany(Category, {
 through: ProductCategory,
 foreignKey: 'productId',
});
Category.belongsToMany(Product, {
 through: ProductCategory,
 foreignKey: 'categoryId',
});

//Fotos de los productos

Product.hasMany(ProdImages)
ProdImages.belongsTo(Product);

//Ordenes de los usuarios
User.hasMany(Order);
Order.belongsTo(User);

//Detalle de las ordenes
Product.belongsToMany(Order,{
  through: OrderLine,
  foreignKey:'productId'
});
Order.belongsToMany(Product,{
  through: OrderLine,
  foreignKey:'orderId'
});
Product.hasMany(Review);
Review.belongsTo(Product);
User.hasMany(Review);
Review.belongsTo(User);



module.exports = {
 ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
 conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
