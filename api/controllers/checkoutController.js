const bodyParser = require("body-parser");
const parser = bodyParser.urlencoded({extended:false});
const User = require("../models/users");
const Order = require("../models/order");
const Product = require("../models/Product");
const sendmail = require("./mail");
var Statistic = require("../models/statistic");
const NodeGeocoder = require('node-geocoder');
const distance = require('google-distance');
const Nexmo = require("nexmo");
var _eQuatorialEarthRadius = 6378.1370;
var _d2r = (Math.PI / 180.0);
var arrUserOnline = []
function randomInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
//Định dạng ngày
 function getCurrentDay() {
    var dateObj = new Date();
    var month = dateObj.getMonth() + 1; //months from 1-12
    var day = dateObj.getDate();
    var year = dateObj.getFullYear();
    if (month%10==month) month = '0'+month;
    if (day%10==day) day='0'+day;
    nowday = year.toString()+month.toString()+day.toString();
    return nowday;
}
//format tiền tệ VND
function formatCurrency(cost){
    return cost.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
}
//format thời gian để lưu vào đơn hàng
function getCurrentDayTime() {
    offset = "+7";
    var d = new Date();
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var day = new Date(utc + (3600000*offset));
    var nowday = day.getDate().toString()+"-"+(day.getMonth()+1).toString()+"-"+day.getFullYear().toString()+" "
    +day.getHours().toString()+":"+day.getMinutes().toString();
    return nowday;
 }
module.exports = function(app,io){
    app.get("/checkout",(req,res)=>{
        res.render("checkout");
    })
    app.post("/saveOrder",parser,(req,res)=>{
        const order = JSON.parse(req.body.order);
        Order.create(order,function(err,data){
            if (err){
                throw err;
            } else {
                res.send(data._id);
            }
        })
    });
    app.post("/getPosition",parser,(req,res)=>{
        const address = req.body.address;
        const options = {
            provider: 'google',
            apiKey: 'AIzaSyAAe03FCWqKI0XJjwuuZQT41KpU9KOgBU4', 
            formatter: null 
          };
        const geocoder = NodeGeocoder(options);
        geocoder.geocode(address)
        .then(result => {
            console.log(result);
            if (result.length>0) res.json({err:"",position:{lat:result[0].latitude,lng: result[0].longitude}})
            else res.json({err:"Vui lòng kiểm tra lại địa chỉ!"});
        }, 
        err=> res.json({err:"Vui lòng kiểm tra lại địa chỉ!"}));
        
        // opencage.geocode({q: address}).then(data => {
        //     if (data.status.code == 200) {
        //       if (data.results.length > 0) {
        //         var place = data.results[0];
        //         res.json({err:"",position:place.geometry});
        //       } else {
        //           res.json({err:"Vui lòng kiểm tra lại địa chỉ!"})
        //       }
        //     } else{
        //       console.log('have a problem');
        //     } 
        //   }).catch(error => {
        //     console.log('error', error.message);
        //   });
    })
    app.post("/updateOrder",parser,(req,res)=>{
        const order = JSON.parse(req.body.order);
        const id = req.body.id;
        Order.update({_id:id},{$set:{time:order.time,timestamp:order.timestamp,sumproductcost:order.sumproductcost,
        listproduct:order.listproduct}},function(err,data){
            if (err) console.log(err); else res.send("Ok");
        })
    })
    app.post("/updateAddress",parser,(req,res)=>{
        const address = req.body.address;
        const fullname = req.body.fullname;
        const phonenumber = req.body.phonenumber;
        const email = req.body.email;
        const id = req.body.id;
        const sumcost = req.body.sumcost;
        const voucher = req.body.voucher;
        distance.apiKey = 'AIzaSyAAe03FCWqKI0XJjwuuZQT41KpU9KOgBU4';
        User.findOneAndUpdate({email:email},{address:address},function(err,data){
            if (err) console.log(err);
        })
        // distance.get(
        //     {
        //       origin: 'Đại học Sư phạm kỹ thuật TPHCM',
        //       destination: address
        //     },
        //     function(err, data) {
        //       if (err){
        //         res.json({err:1})
        //       } else {
        //           console.log(data);
        //         console.log(sumcost);
        //         var result;
        //         if (sumcost>800000){
        //             result=0;
        //         } else {
        //             if (distance <= 3000) result = 0;
        //             else result = 3*(data.distanceValue-3000);
        //         }
        //         Order.update({ _id: id }, { $set: { address: address, fullname:fullname, phonenumber:phonenumber, sumshipcost:result} }, function (err, data) {
        //             if (err) {
        //                 console.log(err);
        //             } else {
        //                 Order.findOne({ _id: id }, function (err, data) {
        //                     if (err) {
        //                         throw err;
        //                     } else {
        //                         console.log(data.sumproductcost);
        //                         if (data.sumproductcost >=800000) result=0;
        //                         res.json({err:0,data:data,ship:result});
        //                     }
        //                 })
        //             }
        //         });
        //       }
        //   });
        // sau này xóa đoạn code bên dưới và mở khóa đoạn code bên trên
        const result = 10000;
        Order.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              address: address,
              fullname: fullname,
              phonenumber: phonenumber,
              sumshipcost: result,
              costVoucher:voucher
            },
          },
          function (err, data) {
            if (err) {
              console.log(err);
            } else {
              Order.findOne({ _id: id }, function (err, data) {
                if (err) {
                  throw err;
                } else {
                  res.json({ err: 0, data: data, ship: result });
                }
              });
            }
          }
        );
    });
    app.post("/sendmail",parser,(req,res) => { //KHOẢNG CÁCH VẬN CHUYỂN ĐƯA VÀO SAU
        const order = JSON.parse(req.body.order);
        const ship = req.body.ship;
        const id = req.body.id;
        let txtTo = order.email;
        let txtSubject = "XÁC NHẬN ĐƠN HÀNG TỪ SHOELG - SHOP BÁN GIÀY ONLINE";
        let dssp ="";
        var count = 0;
        var strsp = `<table style="" width="90%">
        <thead>
            <tr>
                <th align="center" style="padding:10px; border:1px solid #333">STT</th>
                <th align="center" style="padding:10px; border:1px solid #333">Tên sản phẩm</th>
                <th align="center" style="padding:10px; border:1px solid #333">Số lượng</th>
                <th align="center" style="padding:10px; border:1px solid #333">Màu sắc</th>
                <th align="center" style="padding:10px; border:1px solid #333">Kích cỡ</th>
                <th align="center" style="padding:10px; border:1px solid #333">Giá sản phẩm</th>
            </tr>
        </thead>
            <tbody>`
        order.listproduct.forEach(e => {
            count++;
            if (e.size==0) e.size='default';
            strsp += `<tr >
                        <td align="center" style="padding:10px; border:1px solid #333">${count}</td>
                        <td align="center" style="padding:10px; border:1px solid #333">${e.name}</td>
                        <td align="center" style="padding:10px; border:1px solid #333">${e.quanty}</td>
                        <td align="center" style="padding:10px; border:1px solid #333">${e.color}</td>
                        <td align="center" style="padding:10px; border:1px solid #333">${e.size}</td>
                        <td align="center" style="padding:10px; border:1px solid #333">${formatCurrency(e.cost)}</td>
                   </tr>`
            // var strsp = `<p>${count}. Tên sản phẩm: ${e.name}; Số lượng: ${e.quanty}; Màu sắc:${e.color}; Size: ${e.size}; Giá sản phẩm: ${e.cost}đ</p>`;
        });
        strsp += "</tbody> </table>"
        dssp = dssp + strsp;  
        var voucher = "";
        if (order.costVoucher>0) 
        voucher = `<h3 style='font-weight:normal'><b>Giảm giá (voucher): </b>${formatCurrency(order.costVoucher)}đ</h3>`
        let donhang =
        "<h2><b>THÔNG TIN ĐƠN HÀNG</b></h2>" +
        "<h3 style='font-weight:normal'><b>Đơn hàng của anh/chị:</b> "+order.fullname+"- SDT:"+order.phonenumber+"</h3>"+
        `<h3 style='font-weight:normal'><b>Tổng tiền sản phẩm:</b> ${formatCurrency(order.sumproductcost)};</h3>`+
        `<h3>Địa chỉ nhận hàng: ${order.address}</h3>`+
        `<h3>Địa chỉ kho hàng: Số 01, Võ Văn Ngân, Thủ Đức, Hồ Chí Minh</h3>`+
        `<h3>Khoảng cách vận chuyển: 123</h3>`+
        `<h3 style='font-weight:normal'><b>Phí vận chuyển:</b> ${formatCurrency(order.sumshipcost)};</h3>`+ voucher+
        `<h3 style='font-weight:normal'><b>Tổng tiền đơn hàng:</b> ${formatCurrency(order.sumproductcost + order.sumshipcost-order.costVoucher)};</h3>`+
        `<h3>DANH SÁCH SẢN PHẨM:</h3>`;
        let numberRandom = randomInt(100000,9999999);
        let linkXacNhan = "<h4>Link xác nhận đơn hàng: http://localhost:3000/confirm/"+txtTo+"/"+numberRandom+"</h4>";
        //Luu vao databse;
        Order.findOneAndUpdate({_id:id},{$set:{code:numberRandom, time: getCurrentDayTime(), timestamp: parseInt(Date.now().toString())}},function(err,data){
            let txtContent = donhang+dssp+linkXacNhan;
            sendmail(txtTo,txtSubject,txtContent,function(err,data){
                if (err){
                    console.log(err);
                    res.send({err:1})
                } else {
                    res.send({err:0})
                }
            });
            res.send("Gửi thành công!");
        });
    });
    const nexmo = new Nexmo({
        apiKey: "89d03306",
        apiSecret: "kP0cq3PjO49r8ht2"
      }, {debug:true});
    app.post("/sendSMS",parser,(req,res)=>{
        const number = req.body.phone;
        const order = JSON.parse(req.body.order);
        const ship = req.body.ship;
        const id = req.body.id;
        const sum = parseInt(order.sumproductcost)+parseInt(ship)-parseInt(order.costVoucher);
        Order.find({},{code:1,_id:0},function(err,data){
            if (err){
                console.log(err);
            } else {
                let numberRandom = randomInt(100000,9999999);
                while (data.findIndex(item => item.code===numberRandom)!=-1){
                    numberRandom = randomInt(100000,9999999);
                }
                let message = `Tong tien san pham: ${formatCurrency(order.sumproductcost)}, Tong tien van chuyen: ${formatCurrency(ship)}, 
                Voucher su dung: ${formatCurrency(order.costVoucher)}, Tong: ${sum}đ. MA XAC NHAN DON HANG CUA BAN: ${numberRandom}`
                console.log(message);
                Order.findOneAndUpdate({_id:id},{$set:{code:numberRandom, 
                    time: getCurrentDayTime(), timestamp: parseInt(Date.now().toString())}},function(err,data){
                        if (err){
                            console.log(err);
                        } else {
                            res.send({err:0, code:numberRandom});
                        }
                })
            }
        })
        // nexmo.message.sendSms('84359627733',number,message,{type:"unicode"},
        // (err,responseData) =>{
        //     if (err){
        //         console.log(err);
        //         res.send({err:1})
        //     } else {
        //         console.log(responseData);
        //         res.send({err:0})
        //     }
        // })
        
    });
    app.get("/confirm/:email/:code",(req,res)=>{
        Order.findOne({code: req.params.code }, function (err, order) {
            if (err){
                console.log(err);
            } else {
                if (order && order.status == "unconfirmed") { 
                    res.redirect("/ordersuccess/"+req.params.email+"/"+req.params.code)
                } else {
                    res.redirect("/ordersuccess/"+"confirmed"+"/"+req.params.code);
                }
            }
        })
    })
    app.get("/check/:code",(req,res)=>{
        let code = req.params.code;
        var arrErrorProduct = [];
        console.log(code);
        Order.findOne({code:code},function(err,data){
            if (err){
                console.log(err);
            } else {
                if (data&&data.listproduct.length>0){
                    const forLoop = async _ => {
                        for (var i=0; i<data.listproduct.length; i++){
                        var pOrder = data.listproduct[i];   
                        await Product.findOne({_id:pOrder.id},function(err,product){
                            if (err){
                                console.log(err);
                            } else {
                                let index = product.sizes.findIndex(item => item.size===pOrder.size);
                                if (index!=-1){
                                    let pos = product.sizes[index].colors.findIndex(item => item.color===pOrder.color);
                                    if (product.sizes[index].colors[pos].quanty<pOrder.quanty){
                                        arrErrorProduct.push(pOrder);
                                    }
                                }
                                if (i==data.listproduct.length-1){
                                    res.send(arrErrorProduct);
                                }
                            }
                        });
                    }
                 }
                 forLoop();
                }
            }
        })
    })

    app.get("/checkout/:email/:code",(req,res)=>{
        console.log("vô 1");
        var currentDay = getCurrentDay();
        var dataProduct=[];
        var infor = req.params.email;
        var typeInfor = 'email';
        var phoneno = /^\d{10}$/;
        if (infor[0]=='8'&&infor[1]=='4')  phoneno = /^\d{11}$/;
        if(infor.match(phoneno)) typeInfor="phone";
        Statistic.findOne({ day: currentDay }, function (err, data) {
            if (data) {
                var listOrderToday = data.orderproduct; //Tất cả order trong ngày
                Order.findOne({code: req.params.code }, function (err, order) {
                    if (order && order.status == "unconfirmed") { //nếu trạng thái unconfirmed mới thực hiện cập nhật
                        console.log("vô cập nhật")
                        dataProduct = order.listproduct;
                        var ok;
                        var result = listOrderToday;
                        for (var i = 0; i < dataProduct.length; i++) {
                            ok = false;
                            for (var j = 0; j < listOrderToday.length; j++) {
                                if (dataProduct[i].id.equals(listOrderToday[j].id)) {
                                    ok = true;
                                    var itemresult = listOrderToday[j];
                                    itemresult.count += dataProduct[i].quanty;
                                    result[j] = itemresult;
                                    break;
                                }
                            }
                            if (ok == false) {
                                var itemresult = {
                                    id: dataProduct[i].id,
                                    count: dataProduct[i].quanty
                                }
                                result.push(itemresult);
                            }
                        }

                        for (var i = 0; i < dataProduct.length; ++i) {
                            Product.findOneAndUpdate(
                                { _id: dataProduct[i].id },
                                { $inc: { "sizes.$[filter1].colors.$[filter2].quanty": -dataProduct[i].quanty } },
                                { arrayFilters: [{ 'filter2.color': dataProduct[i].color }, { 'filter1.size': dataProduct[i].size }] },
                                function (err, data) {})
                        }
                        for (var i = 0; i < dataProduct.length; ++i) {
                            Product.findOneAndUpdate({_id: dataProduct[i].id}, {$inc:{quanty: -dataProduct[i].quanty},$inc:{orders:1}}, 
                            function (err, data) {})
                        }
                        if (order.costVoucher>0){
                            User.findOneAndUpdate({$or:[{email:req.params.email},{numberPhone:req.params.email}]},
                                {$pull:{currentVoucher:{value:order.costVoucher}}},{new:true},function(err,data){
                                    if (err) console.log(err); else
                                    console.log(data);
                                })
                        }
                        //cập nhật vào thống kê
                        Statistic.findOneAndUpdate({ day: currentDay }, { $set: { orderproduct: result } }, function (err, data) {
                            if (err) console.log(err); else
                            console.log(data);
                        });
                        //Tăng số lượt đặt hàng của khách hàng --> để thống kê
                        User.findOneAndUpdate({$or:[{email:req.params.email},{numberPhone:req.params.email}]},{$inc:{qorder:1}},{new:true},function(err,data){
                            if (err) console.log(err);
                            else {
                                if (data){
                                    if (data.qorder%5==0){
                                        var value = Math.floor(data.qorder/5)*50000;
                                        User.findOneAndUpdate({$or:[{email:req.params.email},{numberPhone:req.params.email}]},
                                            {$push:{currentVoucher:{value:value}}},{new:true},function(err,data){
                                                if (err) console.log(err);
                                        })
                                    }
                                }
                            }
                        })
                        //Cập nhật trạng thái confirmed
                        Order.update({code: req.params.code }, { $set: { status: "confirmed", time: getCurrentDayTime(), timestamp: parseInt(Date.now().toString()) } }, function (err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                Order.update({code: req.params.code},
                                    {$set:{"listproduct.$[].status":"confirmed"}},function(err,data){
                                        
                                    })
                                if (typeInfor=="email"){
                                    let txtTo = req.params.email;
                                    let txtSubject = "THÔNG BÁO TỪ SHOELG - SHOP BÁN GIÀY ONLINE";
                                    let txtContent = "<h3>Bạn đã xác nhận đơn hàng thành công với mã đơn hàng: " + req.params.code + "</h3>";
                                    sendmail(txtTo, txtSubject, txtContent);
                                }
                                User.findOneAndUpdate({$or:[{email:req.params.email},{numberPhone:req.params.email}]}, { $set: { cart: [] } }, function (err, data) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        res.send("OK");
                                    }
                                })
                            }
                        });
                    } else {
                        res.send("OK");
                    }
                })
            }
        });    
    });
    app.post("/addNewDay",(req,res)=>{
        var day = getCurrentDay();
        Statistic.findOne({day:day},function(err,data){
            if (!data){
                var newDay = {
                    day: getCurrentDay(),
                    viewProduct:[],
                    orderproduct:[],
                    page:0
                }
                Statistic.create(newDay,function(err,data){
                    res.json('Ok');
                });
            } else {
                res.json("");
            }
        })
    })
    app.get("/ordersuccess/:email/:code",(req,res)=>{
        res.render("dathangthanhcong");
    })
    app.get("/ordersuccess",(req,res)=>{
        res.render("dathangthanhcong");
    })
    app.post("/getSingleUser",parser,(req,res)=>{
        const email = req.body.email;
        User.findOne({email:email},function(err,data){
            if (!err&&data){
                res.send(data);
            }
        })
    })
    //get number of user's vouchers
    app.post("/getVoucher",parser,(req,res)=>{
        const email = req.body.email;
        const phone = req.body.phone;
        console.log("email="+email);
        if (!phone) phone=-1;
        User.findOne({$or:[{email:email},{numberPhone:phone}]},function(err,data){
            if (err) console.log(err);
            else {
                if (data){
                    res.json({voucher:data.currentVoucher})
                }
            }
        })
    })
}