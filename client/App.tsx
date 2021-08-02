import React from 'react';
import './App.scss';
import {createApiClient, Order, Item,Items } from './api'
//import Modal from 'react-modal';
//import ReactDOM from 'react-dom';
//Modal.setAppElement('#root');


export type AppState = {
	orders?: Order[],
	search: string;
}


const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: ''
	};

	searchDebounce: any = null;

	async componentDidMount() {
		this.setState({
			orders: await api.getOrders()
		});
	}

	
	onSearch = async (value: string, newPage?: number) => {

		clearTimeout(this.searchDebounce);
console.log('hi')
		this.searchDebounce = setTimeout(async () => {
		//	this.setState({
		//		search: value

		//	});
		
		}, 300);
	};

	render() {
		const {orders} = this.state;
		return (
			<main>
				<h1>Orders</h1>
				<header>
					<input type="search" placeholder="Search" onChange={(e) => this.onSearch(e.target.value)}/>
				</header>
				{orders ? <div className='results'>Showing {orders.length} results</div> : null}
				{orders ? this.renderOrders(orders) : <h2>Loading...</h2>}

			</main>
		)
	}
    async changeStatus(order: Order){
        const orderIndex = this.state.orders?.findIndex(o => o.id === order.id);
        if(orderIndex === undefined || orderIndex === -1) return;
        if(order.fulfillmentStatus === "fulfilled") order.fulfillmentStatus = "not-fulfilled";
        else order.fulfillmentStatus = "fulfilled";
        if(this.state.orders) {
            let orders = [...this.state.orders];
            let orderToUpdate = orders[orderIndex];
            orderToUpdate.fulfillmentStatus = order.fulfillmentStatus;
            orders[orderIndex] = orderToUpdate;
            this.setState({orders});
        }
    }

	
	 async itemsStatus(items: Items[], order: Order){
		
		 console.log(order.createdDate)
	for (let index = 0; index < items.length; index++) {
			const x= await api.getItem(items[index].id)
			console.log (x.name,x.image,items[index].quantity );
			}
		}
	
		



	renderOrders = (orders: Order[]) => {
		const filteredOrders = orders
			.filter((order) => (order.customer.name.toLowerCase() + order.id).includes(this.state.search.toLowerCase()));

		return (
			<div className='orders'>
				{filteredOrders.map((order) => (
					<div key={order.id} className={'orderCard'}>
						<div className={'generalData'}>
							<h6>{order.id}</h6>
							<h4>{order.customer.name}</h4>
							<h5>Order Placed: {new Date(order.createdDate).toLocaleDateString()}</h5>
						</div>
						<div className={'fulfillmentData'}>
							<h4>{order.itemQuantity} Items</h4>
							<img src={App.getAssetByStatus(order.fulfillmentStatus)}/>
							{order.fulfillmentStatus !== 'canceled' &&
								<a onClick={()=>this.changeStatus(order)}>Mark as {order.fulfillmentStatus === 'fulfilled' ? 'Not Delivered' : 'Delivered'}</a>
							}
						</div>
						<div className={'itemData'}>
						<a onClick={()=>this.itemsStatus(order.items, order)}>Order Details </a>
							
						</div>
						<div className={'paymentData'}>
							<h4>{order.price.formattedTotalPrice}</h4>
							<img src={App.getAssetByStatus(order.billingInfo.status)}/>
						</div>
					</div>
				))}
			</div>
		)
	};

	static getAssetByStatus(status: string) {
		switch (status) {
			case 'fulfilled':
				return require('./assets/package.png');
			case 'not-fulfilled':
				return require('./assets/pending.png');
			case 'canceled':
				return require('./assets/cancel.png');
			case 'paid':
				return require('./assets/paid.png');
			case 'not-paid':
				return require('./assets/not-paid.png');
			case 'refunded':
				return require('./assets/refunded.png');
		}
	}
}

export default App;



