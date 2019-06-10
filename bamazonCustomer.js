var inquirer = require('inquirer');
var mysql = require("mysql");
const cTable = require('console.table');
let selectedItem = "";
let purchaseQuantity = "";

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'secret',
  database: 'bamazon_db'
});


connection.connect(function (err) {
  if (err) {
    throw err
  }

  displayAllProducts();
});

function displayAllProducts() {

  connection.query('SELECT item_id AS "Product #", product_name AS "Product Name", department_name AS "Department", price, stock_quantity AS "In Stock" FROM products;',
    function (err, res) {
      if (err) {
        throw err
      }
      console.table(res);
      inquirer.prompt({
        type: 'input',
        name: 'userSelection',
        message: 'Please enter the ID of the item you would like to purchase: ',
      }).then(answers => {
        selectedItem = answers.userSelection;
        console.log(selectedItem);
        getQuantity();
        // executeChoice(answers.userSelection);
      });
    });
}

function getQuantity() {
  inquirer.prompt({
    type: 'input',
    name: 'quantity',
    message: 'How many would you like to purchase?'
    // validate: function (value) {
    //   if (isNaN(value) === false) {
    //       return true;
    //     } else {
    //       return false;
    //     }
    // }
  }).then(answers => {
    purchaseQuantity = answers.quantity;
    connection.query('SELECT stock_quantity FROM products WHERE ?', {
      item_id: parseInt(selectedItem)
    }, function (err, res) {
      if (err) throw err
      var quantityInStock = res[0].stock_quantity;
      console.log(`You want to purchase ${purchaseQuantity} of ${quantityInStock} items`)
      if (quantityInStock >= purchaseQuantity) {
        connection.query("UPDATE products SET ? WHERE ?", [{
            stock_quantity: quantityInStock - purchaseQuantity
          },
          {
            item_id: selectedItem
          }
        ], function (err, res) {
          if (err) {
            throw err
          }
          console.log(res);
        })
        console.log(`\n***** Your order was successful! *****\n`);
        displayAllProducts();
      } else {
        console.log("\n *****Insufficient quantity! Please place a new order *****\n");
        displayAllProducts();
      }
    })    
  });
}
