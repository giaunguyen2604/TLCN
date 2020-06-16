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

var main;
function formatCurrency(cost){
	return cost.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
}
class RequireAuthentication extends React.Component{
	constructor(props){
		super(props);
		this.goAuthen = this.goAuthen.bind(this);
	}
	goAuthen(){
		window.location.replace("/login");
	}
	render(){
		return(<div id="modal-authen" class="modal fade" role="dialog">
		<div class="modal-dialog">
		  <div class="modal-content">
			<div class="modal-header">
			  <button type="button" class="close" data-dismiss="modal">&times;</button>
			  <h4 class="modal-title">Thông báo</h4>
			</div>
			<div class="modal-body text-center">
			  <p>Bạn chưa đăng nhập?</p>
			  <p>Hãy click vào nút bên dưới để đi đến trang đăng nhập!</p>
			  <button class="btn btn-primary" onClick={this.goAuthen}>ĐI ĐẾN TRANG ĐĂNG NHẬP</button>
			</div>
			<div class="modal-footer">
			  <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
			</div>
		  </div>
		</div>
	  </div>)
	}
}
class Product extends React.Component{ 
	constructor(props){
		super(props);
		this.getDetail = this.getDetail.bind(this);
		this.addToCart = this.addToCart.bind(this);
		this.handleFavorite = this.handleFavorite.bind(this);
		this.state = {
			isFavorite:false
		}
	}
	getDetail(){
		localStorage.setItem("curproduct",this.props.id);
		window.location.assign("/detailproduct")
	}
	addToCart(){
		const token = localStorage.getItem('token');
		if (!token){
			$("#modal-authen").modal('show');
		} else {
			var ok = false;
			var thisSize, thisColor;
			for (var i=0; i<this.props.size.length; i++){
				if (ok) break;
				for (var j=0; j<this.props.size[i].colors.length; j++){
					var sColor = this.props.size[i].colors[j];
					if (sColor.quanty>0){
						thisSize = this.props.size[i].size;
						thisColor = sColor.color;
						ok=true;
						break;
					}
				}
			}
			$.post("/addToCart",{id:this.props.id,email:localStorage.getItem('email'),
			color: thisColor, size:thisSize},function(data){
				var {dispatch} = main.props;
				dispatch({type:"UPDATE_PRODUCT",newcart:data});
			})
		}
	}
	handleFavorite(){
		const token = localStorage.getItem('token');
		var that = this;
		if (!token) {
			$("#modal-authen").modal('show');
		} else {
			if (this.state.isFavorite == false)
			{
				$.post("/addToFavorite", {id:this.props.id, email: localStorage.getItem('email') }, function (data) {
					that.setState({isFavorite:true});
				})
			} else {
				$.post("/deleteFav",{idDel:this.props.id,email:localStorage.getItem('email')},function(data){
					that.setState({isFavorite:false});
				})
			}	
		}
	}
	componentDidMount(){
		const email = localStorage.getItem('email');
		var that = this;
		if (email) {
			$.post("/checkFavorite", { idProduct: this.props.id, email: email }, function (data) {
				if (data == 1) {
					that.setState({ isFavorite: true });
				}
			})
		}
	}
	render(){
		var htmlFavorite;
		if (this.state.isFavorite==true){
			htmlFavorite=<li><a title="Xóa khỏi favorite list" style={{cursor:'pointer'}} onClick={this.handleFavorite}><span className="fa-stack"><i className="fa fa-heart-o" style={{color:'#daf309'}}></i></span></a></li>
		} else {
			htmlFavorite=<li><a title="Thêm vào favorite list" style={{cursor:'pointer'}} onClick={this.handleFavorite}><span className="fa-stack"><i className="fa fa-heart-o"></i></span></a></li>
		}
		var cost = formatCurrency(this.props.costs[this.props.costs.length-1].cost)
		return (<div className="col-xs-6 col-sm-4 col-md-2 col-lg-2">
			<div className="item">
				<div className="single-product-item">
					<div className="product-image">
						<a onClick={this.getDetail} style={{cursor:'pointer'}}><img src={this.props.image} alt="product-image" /></a>
						<a href="#" className="new-mark-box">new</a>
						<div className="overlay-content">
							<ul>
								<li><a title="Xem sản phẩm" style={{ cursor: 'pointer' }} onClick={this.getDetail}><i className="fa fa-search"></i></a></li>
								<li><a title="Thêm vào giỏ hàng" style={{ cursor: 'pointer' }} onClick={this.addToCart}><i className="fa fa-shopping-cart"></i></a></li>
								<li><a title="Quick view" style={{ cursor: 'pointer' }}><i className="fa fa-retweet"></i></a></li>
								{htmlFavorite}
							</ul>
						</div>
					</div>
					<div className="product-info">
						<div className="customar-comments-box">
							<div className="rating-box">
								<i className="fa fa-star"></i>
								<i className="fa fa-star"></i>
								<i className="fa fa-star"></i>
								<i className="fa fa-star"></i>
								<i className="fa fa-star-half-empty"></i>
							</div>
							<div className="review-box">
							{this.props.comments.length>0?<span>{this.props.comments.length} bình luận</span> :<span></span>}
							</div>
						</div>
						<a onClick={this.getDetail} style={{cursor:'pointer'}}>{this.props.name}</a>
						<div className="price-box">
							<span className="price">{cost}</span>
						</div>
					</div>
					<RequireAuthentication/>
				</div>
			</div></div>)
	}
}
class SearchProduct extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			listSearch:[]
		}
		main = this;
	}
	componentDidMount(){
        var that = this;
        var keysearch = localStorage.getItem('keysearch');
		$.post("/itemSearch",{keysearch:keysearch},function(data){
			that.setState({listSearch:data});
		})
	}
	render(){
        return (<div className="container">
            <div className="row">
                <div className="col-xs-12">
                    <div className="featured-products-area">
                        <div className="left-title-area">
                            <h2 className="left-title">Tìm kiếm được {this.state.listSearch.length} sản phẩm với từ khóa "{localStorage.getItem('keysearch')}"</h2>
                        </div>
                        <div className="row">
                            <div className="feartured-carousel">
                                {this.state.listSearch.map(function (item, index) {
									var comment = [];
									if (item.comments) 
									   if (item.comments.length>0) comment = item.comments;
                                    return <Product key={index} name={item.name} costs={item.costs}
                                        image={item.image.image1} id={item._id} size={item.sizes} 
										comments={comment}/>
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
	}
}

const Search = connect(function(state){  
})(SearchProduct)

ReactDOM.render(
    <Provider store={store}>
        <HeaderTop />
        <HeaderMiddle />
        <MainMenu />
        <Search/>
        <CompanyFacality />
        <Footer />
        <CopyRight />
    </Provider>, document.getElementById("searchpage")
)