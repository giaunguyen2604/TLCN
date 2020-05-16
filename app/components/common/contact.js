import React from 'react'
import ReactDOM from 'react-dom'
import HeaderTop from '../common/header-top'
import HeaderMiddle from '../common/header-middle'
import MainMenu from '../common/main-menu'
import CompanyFacality from '../common/company-facality'
import Footer from '../common/footer'
import CopyRight from '../common/copyright'
import {connect} from 'react-redux'
import $ from 'jquery'
var {Provider} = require("react-redux");
var store = require("../../store");

class ContactForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            statusSend: -1
        }
        this.sendInfor = this.sendInfor.bind(this);
    }
    sendInfor(){
        this.setState({statusSend:-1});
        const name = this.refs.name.value;
        const email = this.refs.email.value;
        const title = this.refs.title.value;
        const content = this.refs.content.value;
        if (!name || !email || !title || !content){
            this.setState({statusSend:0})
        } else {
            var that = this;
            $.post("/sendInfor",{name:name,email:email,title:title,content:content},function(data){
                if (data.success==1){
                    that.setState({statusSend:1})
                }
            })
        }
    }
    render(){
        var htmlStatus = <div></div>;
        if (this.state.statusSend==1){
            htmlStatus = <div class="alert alert-success responseInfor">
            <strong>Gửi thành công! Chúng tôi sẽ phản hồi sớm qua email của bạn. Cảm ơn</strong>
          </div>
        } else if (this.state.statusSend==0){
            htmlStatus = <div class="alert alert-danger responseInfor">
            <strong>Bạn chưa điền đầy đủ thông tin!</strong>
          </div>
        }
        return (<section class="main-content-section">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div class="bstore-breadcrumb">
                            <a href="/">Trang chủ</a>
                            <span> <i class="fa fa-caret-right"> </i> </span>
                            <span>Liên hệ</span>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="map-wrap" style={{width:"100%", height: "400px"}}>
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.476514028973!2d106.75338911431085!3d10.851315392270699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527bd80c66b4f%3A0x1243c8a70dc5d2e0!2zMSBWw7UgVsSDbiBOZ8OibiwgTGluaCBDaGnhu4N1LCBUaOG7pyDEkOG7qWMsIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1554906364167!5m2!1svi!2s" width="100%" height="450" frameborder="0" style={{border:"0"}} allowfullscreen></iframe>
                    </div>
                    <div class="mb-4" style={{paddingTop:'120px'}}>
                        <h2 class="h1-responsive font-weight-bold text-center my-4">LIÊN HỆ CHÚNG TÔI</h2>
                        <div class="row">
                            <div class="col-md-9 mb-md-0 mb-5">
                                <form id="contact-form" name="contact-form" action="mail.php" method="POST">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="md-form mb-0">
                                                <label for="name" class="">Họ tên</label>
                                                <input type="text" id="name" name="name" class="form-control" ref="name" required/>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="md-form mb-0">
                                                <label for="email" class="">Địa chỉ email</label>
                                                <input type="text" id="email" name="email" class="form-control" ref="email" required/>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="md-form mb-0">
                                                <label for="subject" class="">Tiêu đề</label>
                                                <input type="text" id="subject" name="subject" class="form-control" ref="title"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="md-form">
                                                <label for="message">Nội dung</label>
                                                <textarea type="text" id="message" name="message" rows="5" class="form-control md-textarea" ref="content"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                <div class="text-center text-md-left btnSend">
                                    <a class="btn btn-primary" onClick={this.sendInfor}>Gửi</a>
                                </div>
                                {htmlStatus}
                            </div>
                            <div class="col-md-3 text-center">
                                <h3 className="text-center"><b>Thông tin liên hệ</b></h3>
                                <ul class="list-unstyled mb-0">
                                    <li><i class="fa fa-map-marker fa-2x"></i>
                                        <p>Số 1, Võ Văn Ngân, Thủ Đức, TP.HCM</p>
                                    </li>

                                    <li><i class="fa fa-phone mt-4 fa-2x"></i>
                                        <p>0359627733</p>
                                    </li>

                                    <li><i class="fa fa-envelope mt-4 fa-2x"></i>
                                        <p>shoelg98@gmail.com</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>)
    }
}
class ContactPage extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        $.post("/addNewDay",function(data){     
        })
        return(
            <div>
                <HeaderTop />
                <HeaderMiddle />
                <MainMenu />
                <ContactForm />
                <CompanyFacality />
                <Footer />
                <CopyRight />
            </div>
        )
    }
}

const Page = connect(function(state){  
})(ContactPage)

ReactDOM.render(
    <Provider store={store}>
        <Page/>
    </Provider>, document.getElementById('contact')
)