import React from 'react'
import ReactDOM from 'react-dom'
import HeaderTop from '../common/header-top'
import HeaderMiddle from '../common/header-middle'
import MainMenu from '../common/main-menu'
import CompanyFacality from '../common/company-facality'
import Footer from '../common/footer'
import CopyRight from '../common/copyright'
var {Provider} = require("react-redux");
var store = require("../../store");
import {connect} from 'react-redux'
import ReactGA from 'react-ga'
function initizeAnalytics(){
    ReactGA.initialize("UA-155099372-1");
    ReactGA.pageview(window.location.pathname + window.location.search);
}
class RowOrder extends React.Component{
    constructor(props){
        super(props);
    }
    render()
    {
        return(<tr className="text-center">
        <td className="text-center">{this.props.stt}</td>
        <td className="text-center">{this.props.name}</td>
        <td className="text-center"><img src={this.props.image} width="100px" height="100px"/></td>
        <td className="text-center">{this.props.time}</td>
        <td className="text-center"><button className="btn btn-warning">{this.props.status}</button></td>
      </tr>)
    }
}
class TableOrder extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            listorder : [],
            permission:0,
            curpage:1
        }   
        this.goLogin = this.goLogin.bind(this); 
        this.changePage = this.changePage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
    }
    componentDidMount(){
        var that = this;
        var token = localStorage.getItem('token');
        if (!token) {
            this.setState({ permission: 0 });
        }
        $.get("/api", { token: token }, function (data) {
            if (data.success == 1) {
                that.setState({ permission: 1 });
                $.post("/getOrder",{email:localStorage.getItem('email')},function(data){
                    that.setState({listorder:data});
                })
            }
        })
    }
    goLogin(){
        window.location.replace('/login');
    }
    changePage(value, event) {
        this.setState({ curpage: value });
    }
    previousPage(){
        if (this.state.curpage>1)
              this.setState({curpage:this.state.curpage-1});
    }
    nextPage(){
        var length = this.state.listorder.length;
        var perpage = 5;
        if (this.state.curpage<Math.ceil(length / perpage))
              this.setState({curpage:this.state.curpage+1});
    }
    render()
    {
        if (this.state.permission == 0) {
            return (<div className="text-center">
                <br />
                <h3>Để thực hiện chức năng này bạn phải đăng nhập!</h3>
                <button className="btn btn-primary" onClick={this.goLogin} style={{ marginTop: '10px' }}>Đi đến trang đăng nhập</button>
            </div>)
        } else {
            var page = "";
            var lCurOrder = [];
            var length = this.state.listorder.length;
            if (length!=0){
                page = [];
                var perpage = 5;
                var start = (this.state.curpage - 1) * perpage;
                var finish = (start+perpage);
                if (finish>length) finish=length;
                lCurOrder = this.state.listorder.slice(start, start + perpage);
                var numberpage = Math.ceil(length / perpage);
                for (var i = 1; i <= numberpage; i++) {
                    if (this.state.curpage == i) {
                        page.push(<li class='active'><a onClick={this.changePage.bind(this, i)} style={{ cursor: 'pointer' }}>{i}</a></li>);
                    } else {
                        page.push(<li><a onClick={this.changePage.bind(this, i)} style={{ cursor: 'pointer' }}>{i}</a></li>)
                    }
                }
            }
            return (<div><table className="table table-hover text-center">
                <thead>
                    <tr>
                        <th className="text-center">STT</th>
                        <th className="text-center">Tên sản phẩm</th>
                        <th className="text-center">Hình ảnh</th>
                        <th className="text-center">Ngày đặt hàng</th>
                        <th className="text-center">Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {lCurOrder.map(function (order, index) {
                        return <RowOrder key={index} name={order.product.name}
                            status={order.status} stt={start+index + 1} time={order.time} image={order.product.image} />
                    })}
                </tbody>
            </table>
                <div class='panel-footer'>
                    <ul class='pagination pagination-sm'>
                        <li>
                            <a style={{ cursor: 'pointer' }} onClick={this.previousPage}>«</a>
                        </li>
                        {page}
                        <li>
                            <a style={{ cursor: 'pointer' }} onClick={this.nextPage}>»</a>
                        </li>
                    </ul>
                    <div class='pull-right'>
                        Hiển thị từ {start + 1} đến {finish} trên {this.state.listorder.length} sản phẩm
                </div>
                </div>
            </div>)
        }
    }
}
class ItemHistory extends React.Component{
    constructor(props){
        super(props);
        this.getDetail = this.getDetail.bind(this);
    }
    getDetail(){
		localStorage.setItem("curproduct",this.props.id);
		window.location.assign("/detailproduct")
    }
    render()
    {
        return (<div className="col-md-3 col-sm-4 col-xs-12">
            <div className="wishlists-single-item">
                <div className="wishlist-image">
                    <a onClick={this.getDetail} style={{cursor:'pointer'}}><img src={this.props.image} alt="" /></a>
                </div>
                <div className="wishlist-title">
                <a onClick={this.getDetail} style={{cursor:'pointer'}}><p>{this.props.name}</p></a>
                </div>
            </div>
        </div>)
    }
}
class ListHistory extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            listHis : [],
            curpage:1
        }
        this.changePage = this.changePage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.delHistory = this.delHistory.bind(this);
    }
    changePage(value, event) {
        this.setState({ curpage: value });
    }
    previousPage(){
        if (this.state.curpage>1)
              this.setState({curpage:this.state.curpage-1});
    }
    nextPage(){
        var length = this.state.listHis.length;
        var perpage = 4;
        if (this.state.curpage<Math.ceil(length / perpage))
              this.setState({curpage:this.state.curpage+1});
    }
    componentDidMount(){
        var that = this;
        var token = localStorage.getItem('token');
        if (token){
            $.get("/api", { token: token }, function (data) {
                if (data.success == 1) {
                    $.post("/productHistory",{email:localStorage.getItem('email')},function(data){
                        that.setState({listHis:data});
                    }) 
                }
            })
        }
    }

    delHistory(){
        var that = this;
        $.post("/delHistory",{email:localStorage.getItem('email')},function(data){
            that.setState({listHis:data});
        })
    }
    render()
    {
        var page = "";
        var lCurHis = [];
        var length = this.state.listHis.length;
        if (length != 0) {
            page = [];
            var perpage = 4;
            var start = (this.state.curpage - 1) * perpage;
            var finish = (start + perpage);
            if (finish > length) finish = length;
            lCurHis = this.state.listHis.slice(start, start + perpage);
            var numberpage = Math.ceil(length / perpage);
            for (var i = 1; i <= numberpage; i++) {
                if (this.state.curpage == i) {
                    page.push(<li class='active'><a onClick={this.changePage.bind(this, i)} style={{ cursor: 'pointer' }}>{i}</a></li>);
                } else {
                    page.push(<li><a onClick={this.changePage.bind(this, i)} style={{ cursor: 'pointer' }}>{i}</a></li>)
                }
            }
        }
        return (<div>
            <div className="row">
            <h3><b>Các sản phẩm đã xem</b></h3>
            <button class="btn btn-danger" style={{ display: 'inline', marginTop: '20px' }} onClick={this.delHistory}>
                Xóa lịch sử xem sản phẩm</button>
            
                <div style={{ paddingTop: '20px' }}>
                    {lCurHis.map(function (pro, index) {
                        return <ItemHistory key={index} name={pro.name} image={pro.image.image1} id={pro._id} />
                    })}
                </div>
            </div>
            <div class='panel-footer'>
                <ul class='pagination pagination-sm'>
                    <li>
                        <a style={{ cursor: 'pointer' }} onClick={this.previousPage}>«</a>
                    </li>
                    {page}
                    <li>
                        <a style={{ cursor: 'pointer' }} onClick={this.nextPage}>»</a>
                    </li>
                </ul>
                <div class='pull-right'>
                    Hiển thị từ {start + 1} đến {finish} trên {this.state.listHis.length} sản phẩm
                </div>
            </div>
        </div> )
    }
}
class HistoryOrder extends React.Component{
    constructor(props){
        super(props);
    }

    render()
    {
        initizeAnalytics();
        $.post("/addNewDay",function(data){
            
        })
        return(<section className="main-content-section">
        <div className="container">
            <div className="row">
                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    
                    <div className="bstore-breadcrumb">
                        <a href="/">Trang chủ<span><i className="fa fa-caret-right"></i> </span> </a>
                        <a href="/manageaccount">QL Tài khoản<span><i className="fa fa-caret-right"></i></span></a>
                        <span>Danh sách đơn hàng</span>
                    </div>
                   
                </div>
            </div>
            <div className="row">					
                <div className="col-lg-8 col-md-8 col-sm-10 col-xs-12 col-md-push-2">
                    <h2 className="page-title text-center">DANH SÁCH ĐƠN HÀNG</h2>
                    <div className="wishlists-chart table-responsive">
                        <TableOrder/>
                    </div>	       
                    <div className="wishlists-item">
                        <div className="wishlists-all-item">
                            <ListHistory/>                 
                            <div className="wish-back-link">
                               
                            </div>                     
                        </div>
                    </div>	             
                </div>
            </div>
        </div>
    </section>)
    }
}

const History = connect(function(state){  
})(HistoryOrder)


ReactDOM.render(
    <Provider store={store}>
        <HeaderTop />
        <HeaderMiddle />
        <MainMenu />
        <History/>
        <CompanyFacality />
        <Footer />
        <CopyRight />
    </Provider>, document.getElementById("historyorder")
)