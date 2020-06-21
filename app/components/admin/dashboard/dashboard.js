import React from 'react'
import ReactDOM from 'react-dom'
import Navbar from '../common/navbar'
import Sidebar from '../common/sidebar'
import Tool from '../common/tool'
import $ from 'jquery'
import { Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import Dropdown from 'react-dropdown';
import { CSVLink} from "react-csv";
import io from 'socket.io-client'
const socket = io('http://localhost:3000');
var main;
const options = [
  'today', 'yesterday', 'last7days', 'last28days'
];
const defaultOption = options[2];
var viewClass, orderClass;
function formatCurrency(cost){
  return cost.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
}
class TopViewProduct extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      topView : []
    }
    viewClass = this;
  }
  componentDidMount(){
    var that = this;
    $.get("/topview",function(data){
        that.setState({topView:data});
    })
  }
  render(){
    if (this.state.topView.length!=0){
      return (<div class="row">   
      <div class="col-xs-10 col-sm-10 col-md-10 col-lg-10 col-md-push-1">
      <Bar
        data={{
          labels: this.state.topView.map(pro => pro.product.name),
          datasets: [
            {
              label: "View",
              backgroundColor: [
                "#3e95cd",
                "#8e5ea2",
                "#3cba9f",
                "#e8c3b9",
                "#c45850",
                "#5f55f2",
                "#ed64e4",
                "#fcb944",
                "#56d91a",
                "#38e8cb"
              ],
              data: this.state.topView.map(pro => pro.view)
            }
          ]
        }}
        options={{
          legend: { display: false },
          title: {
            display: true,
            text: "TOP VIEWED PRODUCTS"
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }}
      />
      </div>
    </div>)} else return(
      <div class="row">
        <div class="col-xs-10 col-sm-10 col-md-10 col-lg-10 col-md-push-1 text-center">
          <h3>NO INFORMATION</h3>
        </div>
      </div>)
    
  }
}
class TopOrderProduct extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      topOrder : []
    }
    orderClass = this;
  }
  componentDidMount(){
    var that = this;
    $.get("/toporder",function(data){
        that.setState({topOrder:data});
    })
  }
  render(){
    if (this.state.topOrder.length != 0) {
      return (<div class="row">
        <div class="col-xs-10 col-sm-10 col-md-10 col-lg-10 col-md-push-1">
          <Bar
            data={{
              labels: this.state.topOrder.map(pro => pro.product.name),
              datasets: [
                {
                  label: "Time(s)",
                  backgroundColor: [
                    "#3e95cd",
                    "#8e5ea2",
                    "#3cba9f",
                    "#e8c3b9",
                    "#c45850",
                    "#5f55f2",
                    "#ed64e4",
                    "#fcb944",
                    "#56d91a",
                    "#38e8cb"
                  ],
                  data: this.state.topOrder.map(pro => pro.view)
                }
              ]
            }}
            options={{
              legend: { display: false },
              title: {
                display: true,
                text: "TOP ORDERED PRODUCTS"
              },
              scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true
                  }
                }]
              }
            }}
          />
        </div>
      </div>)
    } else { return(
      <div class="row">
        <div class="col-xs-10 col-sm-10 col-md-10 col-lg-10 col-md-push-1 text-center">
          <h3>NO INFORMATION</h3>
        </div>
      </div>)}
  }
}
const headersView = [
  { label: "Mã sản phẩm", key: "idproduct" },
  { label: "Tên sản phẩm", key: "nameproduct" },
  { label: "Số lượt xem", key: "view" }
];
const headersOrder = [
  { label: "Mã sản phẩm", key: "idproduct" },
  { label: "Tên sản phẩm", key: "nameproduct" },
  { label: "Số lượt đặt hàng", key: "order" }
];
var optionDisplay = "all", date="", optionSort="descending";
class Dashboard extends React.Component{
    constructor(props){
        super(props);
        this.state = {
          arrMetrics: [0,0,0,0],
          arrUsers: [],
          arrUsersBefore: [],
          activeUsers:0,
          timeOption: options[2],
          timeOption1: options[0],
          processing: false,
          processing1:false,
          permission: false,
          dataView: [],
          dataOrder: [],
          lDataCustomers:[],
          btnCurrent: 0,
          dataSellingProduct: []
        }
        main=this;
        this._onSelect = this._onSelect.bind(this);
        this._onSelect1 = this._onSelect1.bind(this);
        this.closeCustomers = this.closeCustomers.bind(this);
        this.visitFrequently = this.visitFrequently.bind(this);
        this.notOrder = this.notOrder.bind(this);
    }
    componentDidMount(){
      var that = this;
      $.post("/getMetrics",{option:"last7days"},function(data){
        that.setState({arrMetrics:data.metrics, arrUsers:data.users, arrUsersBefore: data.usersBefore,
        activeUsers: data.countUser});
      });
      this.setState({btnCurrent:0});
      $.get("/getCloseCustomers",function(data){
        that.setState({lDataCustomers:data});
      })
      $.post("/getAllSellingProduct",{optionSort:"descending"},function(data){
        that.setState({dataSellingProduct: data});
      })
      socket.on("update-view-product", function (data) {
        $.post("/getMetricProduct", { option: that.state.timeOption1 }, function (data) {
          viewClass.setState({ topView: data.view });
          that.setState({ timeOption1: selectedOption.value});
          var dataView = [];
          for (var i = 0; i < data.view.length; i++) {
            var product = data.view[i].product;
            dataView.push({ idproduct: product._id, nameproduct: product.name, view: data.view[i].view })
          }
          that.setState({ dataView: dataView})
        })
      });
      socket.on("update-order-product",function(data){
        $.post("/getMetricProduct", { option: that.state.timeOption1 }, function (data) {
          orderClass.setState({ topOrder: data.order });
          that.setState({ timeOption1: selectedOption.value });
          var dataOrder = [];
          for (var i = 0; i < data.order.length; i++) {
            var product = data.order[i].product;
            dataOrder.push({ idproduct: product._id, nameproduct: product.name, order: data.order[i].view })
          }
          that.setState({dataOrder: dataOrder })
        })
      })
    }
    _onSelect(selectedOption){
      var that = this;
      this.setState({processing:true});
      $.post("/getMetrics",{option:selectedOption.value},function(data){
        that.setState({arrMetrics:data.metrics, arrUsers:data.users, arrUsersBefore: data.usersBefore,
        activeUsers: data.countUser, timeOption: selectedOption.value,processing:false});
      })
    }
    _onSelect1(selectedOption){
      var that = this;
      this.setState({processing1:true});
      $.post("/getMetricProduct",{option:selectedOption.value},function(data){
        viewClass.setState({topView: data.view});
        orderClass.setState({topOrder:data.order});
        that.setState({timeOption1: selectedOption.value, processing1:false});
        var dataView = [];
        for (var i=0; i<data.view.length; i++){
          var product= data.view[i].product;
          dataView.push({idproduct:product._id,nameproduct:product.name,view:data.view[i].view})
        }
        var dataOrder=[];
        for (var i=0; i<data.order.length; i++){
          var product= data.order[i].product;
          dataOrder.push({idproduct:product._id,nameproduct:product.name,order:data.order[i].view})
        }
        that.setState({dataView:dataView,dataOrder:dataOrder})
      })
    }
    componentWillMount(){
      var that = this;
        const token = localStorage.getItem('tokenad');
        if (!token){
          this.setState({permission:false})
        }
        $.get("/admin",{token:token},function(data){
          if (data.success==0){
            localStorage.removeItem('emailad');
            localStorage.removeItem('usernamead');
            that.setState({permission:false})
          } else {
            that.setState({permission:true})
          }
        })
    }
    closeCustomers(){
      var that = this;
      this.setState({btnCurrent:0});
      $.get("/getCloseCustomers",function(data){
        that.setState({lDataCustomers:data});
      })
    }
    visitFrequently(){
      var that = this;
      this.setState({btnCurrent:1});
      $.get("/getVisitFrequently",function(data){
        that.setState({lDataCustomers:data});
      })
    }
    notOrder(){
      var that = this;
      this.setState({btnCurrent:2});
      $.get("/getNotOrder",function(data){
        that.setState({lDataCustomers:data});
      })
    }
    changeOptionDisplay(e){
      optionDisplay = e.target.value;
      var that = this;
      if (optionDisplay == "all"){
        $.post("/getAllSellingProduct",{optionSort:optionSort},function(data){
          that.setState({dataSellingProduct: data});
        })
      } else {
        if (date!=""){
          $.post("/getSpecificDateSaleProduct",{date:date,optionSort:optionSort},function(data){
            that.setState({dataSellingProduct:data});
          })
        }
      }
    }
    changeDate(e){
      var that = this;
      date = e.target.value;
      if (optionDisplay == "specific"){
        $.post("/getSpecificDateSaleProduct",{date:date,optionSort:optionSort},function(data){
          that.setState({dataSellingProduct:data});
        })
      }
    }
    sortProduct(e){
      var that = this;
      optionSort = e.target.value;
      if (optionDisplay=="all"){
        $.post("/getAllSellingProduct",{optionSort:optionSort},function(data){
          that.setState({dataSellingProduct: data});
        })
      } else {
        if (date!=""){
          $.post("/getSpecificDateSaleProduct",{date:date,optionSort:optionSort},function(data){
            that.setState({dataSellingProduct:data});
          })
        }
      }
    }
    render(){
        return (
          <div id="content">
            <div class="panel panel-default">
              <div class="panel-heading">
                <i class="icon-beer icon-large"></i>
                Dashboard!
                <div class="panel-tools">
                  <div class="btn-group">
                    <a class="btn" href="#">
                    </a>
                    <a
                      class="btn"
                      data-toggle="toolbar-tooltip"
                      href="#"
                      title="Toggle"
                    >
                      <i class="icon-chevron-down"></i>
                    </a>
                  </div>
                </div>
              </div>
              {this.state.permission == false ? (
                <div className="text-center notification">
                  <br />
                  <h3>
                    Not permitted. Please access the following link to login!
                  </h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => window.location.replace("/login")}
                    style={{ marginTop: "10px", width: "auto" }}
                  >
                    Đi đến trang đăng nhập
                  </button>
                </div>
              ) : (
                <div class="panel-body">
                  <div class="progress"></div>
                  <div>
                    <Dropdown
                      options={options}
                      onChange={this._onSelect}
                      value={this.state.timeOption}
                      placeholder="Select an option"
                    />
                  </div>
                  {this.state.processing == true ? (
                    <div class="loader text-center"></div>) : ("")}
                  <div class="row">
                    <div class="fourMetrics">
                      <div class="col-xs-12 col-sm-6 col-md-3 col-lg-3">
                        <div class="card card-stats">
                          <div class="card-body">
                            <div class="row rowb">
                              <div class="col">
                                <h5 class="card-title text-uppercase text-muted mb-0">
                                  Users
                                </h5>
                                <span class="h2 font-weight-bold mb-0">
                                  {this.state.arrMetrics[0]}
                                </span>
                              </div>
                              <div class="col-auto">
                                <div class="icon icon-shape bg-gradient-red text-white rounded-circle shadow">
                                  <i class="ni ni-user-run"></i>
                                </div>
                              </div>
                            </div>
                            {/* <p class="mt-3 mb-0 text-sm">
                        <span class="text-success mr-2"><i class="fa fa-arrow-up"></i> 3.48%</span>
                        <span class="text-nowrap">Since last month</span>
                      </p> */}
                          </div>
                        </div>
                      </div>
                      <div class="col-xs-12 col-sm-6 col-md-3 col-lg-3">
                        <div class="card card-stats">
                          <div class="card-body">
                            <div class="row rowb">
                              <div class="col">
                                <h5 class="card-title text-uppercase text-muted mb-0">
                                  Sessions
                                </h5>
                                <span class="h2 font-weight-bold mb-0">
                                  {this.state.arrMetrics[1]}
                                </span>
                              </div>
                              <div class="col-auto">
                                <div class="icon icon-shape bg-gradient-orange text-white rounded-circle shadow">
                                  <i class="ni ni-time-alarm"></i>
                                </div>
                              </div>
                            </div>
                            {/* <p class="mt-3 mb-0 text-sm">
                        <span class="text-success mr-2"><i class="fa fa-arrow-up"></i> 3.48%</span>
                        <span class="text-nowrap">Since last month</span>
                      </p> */}
                          </div>
                        </div>
                      </div>
                      <div class="col-xs-12 col-sm-6 col-md-3 col-lg-3">
                        <div class="card card-stats">
                          <div class="card-body">
                            <div class="row rowb">
                              <div class="col">
                                <h5 class="card-title text-uppercase text-muted mb-0">
                                  Bounce Rate
                                </h5>
                                <span class="h2 font-weight-bold mb-0">
                                  {this.state.arrMetrics[2]}%
                                </span>
                              </div>
                              <div class="col-auto">
                                <div class="icon icon-shape bg-gradient-green text-white rounded-circle shadow">
                                  <i class="ni ni-chart-pie-35"></i>
                                </div>
                              </div>
                            </div>
                            {/* <p class="mt-3 mb-0 text-sm">
                        <span class="text-success mr-2"><i class="fa fa-arrow-up"></i> 3.48%</span>
                        <span class="text-nowrap">Since last month</span>
                      </p> */}
                          </div>
                        </div>
                      </div>
                      <div class="col-xs-12 col-sm-6 col-md-3 col-lg-3">
                        <div class="card card-stats">
                          <div class="card-body">
                            <div class="row rowb">
                              <div class="col">
                                <h5 class="card-title text-uppercase text-muted mb-0">
                                  Session Duration
                                </h5>
                                <span class="h2 font-weight-bold mb-0">
                                  {this.state.arrMetrics[3]}s
                                </span>
                              </div>
                              <div class="col-auto">
                                <div class="icon icon-shape bg-gradient-info text-white rounded-circle shadow">
                                  <i class="ni ni-watch-time"></i>
                                </div>
                              </div>
                            </div>
                            {/* <p class="mt-3 mb-0 text-sm">
                        <span class="text-success mr-2"><i class="fa fa-arrow-up"></i> 3.48%</span>
                        <span class="text-nowrap">Since last month</span>
                      </p> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class=" row metrics">
                    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                      <Line
                        data={{
                          labels: this.state.arrUsers.map(
                            (element) => element[0]
                          ),
                          datasets: [
                            {
                              data: this.state.arrUsers.map(
                                (element) => element[1]
                              ),
                              label: this.state.timeOption,
                              borderColor: "#3e95cd",
                              fill: false,
                            },
                            {
                              data: this.state.arrUsersBefore.map(
                                (element) => element[1]
                              ),
                              label: "Previous period",
                              borderColor: "#8e5ea2",
                              fill: false,
                              borderDash: [5, 15],
                            },
                          ],
                        }}
                        options={{
                          title: {
                            display: true,
                            text: "The numbers of users",
                          },
                          legend: {
                            display: true,
                            position: "bottom",
                          },
                        }}
                      />
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 activeUser">
                      <div>
                        <h3>Active Users right now</h3>
                      </div>
                      <div>
                        <h1>{this.state.activeUsers}</h1>
                      </div>
                    </div>
                  </div>
                  <div class="page-header">
                    <h4>Customers</h4>
                    <div>
                      <div class="row text-center">
                        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 btnCustomer">
                          <button
                            class={
                              this.state.btnCurrent == 0
                                ? "btn btn-choose currentBtn"
                                : "btn btn-choose"
                            }
                            onClick={this.closeCustomers}
                          >
                            Close Customers
                          </button>
                          <button
                            class={
                              this.state.btnCurrent == 1
                                ? "btn btn-choose currentBtn"
                                : "btn btn-choose"
                            }
                            style={{ marginLeft: "5px" }}
                            onClick={this.visitFrequently}
                          >
                            Visit Website Frequently
                          </button>
                          <button
                            class={
                              this.state.btnCurrent == 2
                                ? "btn btn-choose currentBtn"
                                : "btn btn-choose"
                            }
                            style={{ marginLeft: "5px" }}
                            onClick={this.notOrder}
                          >
                            Have not ordered
                          </button>
                        </div>
                        <table class="table">
                          <thead>
                            <tr>
                              <th class="text-center">#</th>
                              <th class="text-center">First Name</th>
                              <th class="text-center">Last Name</th>
                              <th class="text-center">Email</th>
                              <th class="text-center">Phone</th>
                              <th class="text-center">
                                {this.state.btnCurrent == 0
                                  ? "Number Of Orders"
                                  : "Number of Visits"}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.lDataCustomers.map(function (
                              customer,
                              index
                            ) {
                              return (
                                <tr key={index}>
                                  <td class="text-center">{index + 1}</td>
                                  <td class="text-center">
                                    {customer.firstName}
                                  </td>
                                  <td class="text-center">
                                    {customer.lastName}
                                  </td>
                                  <td class="text-center">{customer.email}</td>
                                  <td class="text-center">
                                    {customer.numberPhone}
                                  </td>
                                  <td class="text-center">
                                    {main.state.btnCurrent == 0
                                      ? customer.qorder
                                      : customer.qvisit}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div class="page-header">
                    <h4>Trending products</h4>
                  </div>
                  <div>
                    <Dropdown
                      options={options}
                      onChange={this._onSelect1}
                      value={this.state.timeOption1}
                      placeholder="Select an option"
                    />
                    ;
                  </div>
                  {this.state.processing1 == true ? (
                    <div class="loader text-center"></div>) : ("")}
                  <div class="row text-center">
                    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                      <h3 style={{ color: "#0c967a" }}>
                        <b>TOP VIEWED PRODUCTS</b>
                      </h3>
                      <TopViewProduct />
                      <CSVLink
                        data={this.state.dataView}
                        headers={headersView}
                        filename={"TopView-" + Date.now().toString() + ".csv"}
                      >
                        <i class="icon-download-alt"></i> Download CSV File
                      </CSVLink>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                      <h3 style={{ color: "#0c967a" }}>
                        <b>TOP ORDERED PRODUCTS</b>
                      </h3>
                      <TopOrderProduct />
                      <CSVLink
                        data={this.state.dataOrder}
                        headers={headersOrder}
                        filename={"TopOrder-" + Date.now().toString() + ".csv"}
                      >
                        <i class="icon-download-alt"></i> Download CSV File
                      </CSVLink>
                    </div>
                  </div>
                  <div class="page-header">
                    <h4>Information About Selling Product</h4>
                  </div>
                  <div>
                    <div class="radio classOption" onChange={this.changeOptionDisplay.bind(this)}>
                      <h5><b>Option Date:</b></h5>
                      <input type="radio" name="date" value="all" defaultChecked="true"/><label>All</label><br/>
                      <input type="radio" name="date" value="specific"  id="changeDate"/><label>Specific Date: </label>
                      <input type="date" name="specificDate" ref="specificDate" onChange={this.changeDate.bind(this)}/>
                    </div>
                    <div class="radio classOption" onChange={this.sortProduct.bind(this)}>
                      <h5><b>Option Sort:</b></h5>
                      <input type="radio" name="sort" value="descending" defaultChecked="true"/><label>Descending</label><br/>
                      <input type="radio" name="sort" value="ascending" /><label>Ascending</label>
                    </div>
                  </div>
                  <div>
                    <table class="table">
                      <thead>
                        <tr>
                          <th class="text-center">#</th>
                          <th class="text-center">Name</th>
                          <th class="text-center">Image</th>
                          <th class="text-center">Cost</th>
                          <th class="text-center">Number Of Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.dataSellingProduct.map(function (product,index) {
                          return (
                            <tr key={index} class="active">
                              <td class="text-center">{index + 1}</td>
                              <td class="text-center">{product.name}</td>
                              <td class="text-center"><img src={product.image.image1} width="120px"/></td>
                              <td class="text-center">{formatCurrency(product.costs[product.costs.length-1].cost)}</td>
                              <td class="text-center">{product.orders}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
}
ReactDOM.render(
    <div>
        <Navbar/>
        <div id="wrapper">
            <Sidebar active={1}/>
            <Tool curpage="Dashboard"/>
            <Dashboard/>
        </div>
    </div>,document.getElementById("dashboard")
)