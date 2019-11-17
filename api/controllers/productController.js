const bodyParser = require("body-parser");
const parser = bodyParser.urlencoded({extended:false});
const User = require("../models/users");
const ProductCategory = require("../models/ProductCategory");
const Product = require("../models/Product");

function getCart(data,res){
    var arr = [];
    data.cart.forEach(pro => {
        Product.findOne({ _id: pro.idProduct }, function (err, da) {
            if (err) {
                throw err;
            } else {
                var newProduct = {
                    product: da,
                    quanty: pro.quanty,
                    size: pro.size,
                    color: pro.color,
                    status: pro.status
                }
                arr.push(newProduct);
                if (arr.length == data.cart.length) {
                    res.send(arr);
                }
            }
        })
    })
}
module.exports = function(app){
    app.get("/detailproduct",(req,res)=>{
        res.render("chitietsanpham");
    });
    app.post("/getDetailProduct",parser,(req,res)=>{
        const idproduct = req.body.idproduct;
        Product.findOne({_id:idproduct},function(err,data){
            if (err) {
                throw err;
            } else {
                res.send(data);
            }
        })
    });
    app.post("/getProductRelate",parser,(req,res)=>{
        const idproduct = req.body.idproduct;
        Product.findOne({_id:idproduct},function(err,product){
            if (err) {
                throw err;
            } else {
                ProductCategory.findOne({_id:product.category},function(err,category){
                    if (err){
                        throw err;
                    } else {
                        console.log(category);
                        var arrresult = [];
                        category.listProduct.forEach(pro => {
                            Product.findOne({_id:pro._id},function(err,data){
                                if (err) {
                                    throw err;
                                } else {
                                    arrresult.push(data);
                                    if (category.listProduct.length == arrresult.length){
                                        res.send(arrresult);
                                    }
                                }
                            })
                        });
                    }
                })
            }
        })
    });

    
    app.post("/cart",parser,(req,res)=>{
        const email = req.body.email;
        User.findOne({email:email},function(err,data){
            if (err){
                throw err;
            } else {
                getCart(data,res);
            }
        })
    });

    app.post("/addToCart",parser,(req,res)=>{
        const id = req.body.id;
        const email = req.body.email;
        User.findOneAndUpdate({email:email},{'$push':{cart:{idProduct:id,quanty:1,size:38,color:"",status:"processing"}}},{new:true},function(err,data){
            if (err){
                throw err;
            } else {
                console.log(data);
                getCart(data,res);
            }
        })
    });
    app.post("/removeFromCart",parser,(req,res)=>{
        const id = req.body.id;
        const email = req.body.email;
        console.log(id);
        User.findOneAndUpdate({email:email},{'$pull':{cart:{idProduct:id}}},{new:true},function(err,data){
            if (err){
                throw err;
            } else {
                getCart(data,res);
            }
        })
    })
}