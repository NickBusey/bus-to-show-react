import React from 'react'
import '../../App.css';
import CartItem from './CartItem'

const Cart = (props) => {

  const itemsInCart = props.events.filter(event => event.inCart).length

  return (
    <div className='Cart'>
      <h2>Shopping Cart</h2>
      <div className="list-group">
        <div className="list-group-item">
          <div className="row">
            <div className="col-md-4">Event</div>
            <div className="col-md-4">Location</div>
            <div className="col-md-2">Date</div>
            <div className="col-md-2">Quantity</div>
          </div>
        </div>
        <ul className="list-group">

          <CartItem events={props.events} />
        </ul>
       {itemsInCart ? <div className="list-group-item">
          <div className='row'>
            <button type="button" onClick={props.returnToEvents} className="btn btn-outline-danger return-btn ml-2 float-right">Cancel</button>
            <button type="button" onClick={props.addToCart} className="btn btn-outline-success return-btn ml-2 float-right">Purchase</button>
          </div>
        </div> : ''}
      </div>
    </div>
  )
}

export default Cart;