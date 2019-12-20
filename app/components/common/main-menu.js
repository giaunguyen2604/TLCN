import React from 'react'
import $ from 'jquery'
import {connect} from 'react-redux'
var main;
class Product extends React.Component{
	constructor(props){
		super(props);
		this.removeFromCart = this.removeFromCart.bind(this);
	}
	removeFromCart(){
		$.post("/removeFromCart",{email:localStorage.getItem('email'),id:this.props.id},function(data){
			console.log(data);
			var {dispatch} = main.props;
        	dispatch({type:"UPDATE_PRODUCT",newcart:data});
		})
	}
	render(){
		return(<div className="shipping-item">
		<span className="cross-icon"><i className="fa fa-times-circle" onClick={this.removeFromCart}></i></span>
		<div className="shipping-item-image">
			<a href="#"><img src={this.props.image} alt="shopping image" width="80px" height="80px" /></a>
		</div>
		<div className="shipping-item-text">
			<span>{this.props.quanty}<span className="pro-quan-x">x</span> <a href="#" className="pro-cat">{this.props.name}</a></span>
			<span className="pro-quality"><a href="#">{this.props.size},{this.props.color}</a></span>
			<p>{this.props.costs[this.props.costs.length-1].cost}</p>
		</div>
	</div>)
	}
}
class Cart extends React.Component{
	constructor(props){
		super(props);
		this.handleCheckout = this.handleCheckout.bind(this);
	}
	componentDidMount(){
		const email = localStorage.getItem("email");
		var {dispatch} = main.props;
		if (!email){
        	dispatch({type:"UPDATE_PRODUCT",newcart:[]});
		} else {
			$.post("/cart",{email:localStorage.getItem("email")},function(data){
				if (!data){
					data = [];
				} else {
					dispatch({type:"UPDATE_PRODUCT",newcart:data});
				}
			})
		}
	}
	handleCheckout(){
		const token = localStorage.getItem('token');
		window.location.assign("/api/checkout/?token="+token);
	}
	render(){
		var sum =0,maxShip=0;
		if (main.props.cart){
			main.props.cart.forEach(e => {
				sum+=e.product.costs[e.product.costs.length-1].cost;
				if (e.product.shipcost > maxShip){
					maxShip = e.product.shipcost;
				}
			});
		}
		sum+=maxShip;
		return(<div className="col-lg-3 col-md-3 col-sm-12 col-xs-12 pull-right shopingcartarea ">
		<div className="shopping-cart-out pull-right">
			<div className="shopping-cart">
				<a className="shop-link" href="cart.html" title="View my shopping cart">
					<i className="fa fa-shopping-cart cart-icon"></i>
					<b>Giỏ hàng</b>
					<span className="ajax-cart-quantity">{main.props.cart.length}</span>
				</a>
				<div className="shipping-cart-overly">
					{main.props.cart.map(function(pro,index){
						return <Product key={index} image={pro.product.image.image1} 
						name ={pro.product.name} size={pro.size} color={pro.color}
						quanty={pro.quanty} costs ={pro.product.costs} id={pro.product._id}/>
					})}
					<div className="shipping-total-bill">
						<div className="cart-prices">
							<span className="shipping-cost">{maxShip}đ</span>
							<span>Phí Ship</span>
						</div>
						<div className="total-shipping-prices">
							<span className="shipping-total">{sum}đ</span>
							<span>Tổng</span>
						</div>										
					</div>
					<div className="shipping-checkout-btn">
						<a onClick={this.handleCheckout} style={{cursor:'pointer'}}>Thanh toán <i className="fa fa-chevron-right"></i></a>
					</div>
				</div>
			</div>
		</div>
	</div>)
	}
}
class MainMenu extends React.Component{
    constructor(props){
		super(props);
		main = this;
		this.getMenCategory = this.getMenCategory.bind(this);
		this.getGirlCategory = this.getGirlCategory.bind(this);
		this.getKidCategory = this.getKidCategory.bind(this);
	}
	getMenCategory(){
		localStorage.setItem("curcategory","Men Product");
		window.location.assign("/categoryProduct");
	}
	getGirlCategory(){
		localStorage.setItem("curcategory","Girl Product");
		window.location.assign("/categoryProduct");
	}
	getKidCategory(){
		localStorage.setItem("curcategory","Kid Product");
		window.location.assign("/categoryProduct");
	}
    render(){
        return(
            <div className="main-menu-area thanhmenu">
			<div className="container">
				<div className="row" >
					<Cart/>	
					<div className="col-lg-9 col-md-9 col-sm-12 col-xs-12 no-padding-right menuarea">
						<div className="mainmenu">
							<nav className="">
								<ul className="list-inline mega-menu">
									<li className="active"><a href="/">Trang chủ</a>										
									</li>
									<li>
										<a style={{cursor:'pointer'}} onClick={this.getMenCategory}>Giày nam</a>
									</li>
									<li>
										<a style={{cursor:'pointer'}} onClick={this.getGirlCategory}>Giày nữ</a>
									</li>
									<li>
										<a style={{cursor:'pointer'}} onClick={this.getKidCategory}>Trẻ em</a>
									</li>
									<li><a href="about-us.html">Liên hệ</a></li>
								</ul>
							</nav>
						</div>
					</div>
					
				</div>
				<div className="row">
					
					<div className="col-sm-12 mobile-menu-area">
						<div className="mobile-menu hidden-md hidden-lg" id="mob-menu">
							<span className="mobile-menu-title">MENU</span>
							<nav>
								<ul>
									<li><a href="index-2.html">Trang chủ</a>														
									</li>								
									<li><a href="shop-gird.html">Giày nam</a>
										<ul>
											<li><a href="shop-gird.html">Tops</a>
												<ul>
													<li><a href="shop-gird.html">T-Shirts</a></li>
													<li><a href="shop-gird.html">Blouses</a></li>
												</ul>													
											</li>
											<li><a href="shop-gird.html">Dresses</a>
												<ul>
													<li><a href="shop-gird.html">Casual Dresses</a></li>
													<li><a href="shop-gird.html">Summer Dresses</a></li>
													<li><a href="shop-gird.html">Evening Dresses</a></li>	
												</ul>	
											</li>

										</ul>
									</li>
									<li><a href="shop-gird.html">Giày nữ</a>
										<ul>											
											<li><a href="shop-gird.html">Tops</a>
												<ul>
													<li><a href="shop-gird.html">Sports</a></li>
													<li><a href="shop-gird.html">Day</a></li>
													<li><a href="shop-gird.html">Evening</a></li>
												</ul>														
											</li>
											<li><a href="shop-gird.html">Blouses</a>
												<ul>
													<li><a href="shop-gird.html">Handbag</a></li>
													<li><a href="shop-gird.html">Headphone</a></li>
													<li><a href="shop-gird.html">Houseware</a></li>
												</ul>														
											</li>
											<li><a href="shop-gird.html">Accessories</a>
												<ul>
													<li><a href="shop-gird.html">Houseware</a></li>
													<li><a href="shop-gird.html">Home</a></li>
													<li><a href="shop-gird.html">Health & Beauty</a></li>
												</ul>														
											</li>
										</ul>										
									</li>
									<li><a href="shop-gird.html">Trẻ em</a></li>
									<li><a href="shop-gird.html">Phổ biến</a></li>
									<li><a href="shop-gird.html">Sản phẩm mới</a></li>
									<li><a href="about-us.html">Liên hệ</a></li>
								</ul>
							</nav>
						</div>						
					</div>
					
				</div>				
			</div>
		</div>)
    }
}
export default connect(function(state){
    return {
        cart:state.cart
    }
})(MainMenu);
