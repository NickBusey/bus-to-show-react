import React from 'react';
import '../../App.css';
import CartItem from './CartItem';
import Checkout from './Stripe_Checkout';

const Cart = (props) => {
  // console.log('Cart', props)

  let cost = Number(props.totalCost)
  let totalCost = cost.toFixed(2)

  return (
    <div className='Cart'>
      <React.Fragment>
        <div className="list-group">
          <div className="list-group-item">
            <div className="row">
              <div className="col-md-2">Show</div>
              <div className="col-md-4">Departure Location</div>
              <div className="col-md-2">Date</div>
              <div className="col-md-2">Quantity</div>
            </div>
          </div>
          <ul className="list-group">
            <CartItem
              pickupLocations={props.pickupLocations}
              quantityChange={props.quantityChange}
              removeFromCart={props.removeFromCart}
              rideId={props.rideId}
              showsInCart={props.showsInCart}
              ticketPrice={props.ticketPrice}
              ticketQuantity={props.ticketQuantity} />
          </ul>

          {props.showsInCart ?
            <div className="list-group-item" >
              <div className="row">
                <div className="col-md-12">

                  <form className="needs-validation" onSubmit={props.handleSubmit} noValidate>
                    <div className="form-row">
                      <div className="col-md-4 mb-3">
                        <label htmlFor="firstName">First Name</label>
                        <input
                          onChange={props.updatePurchaseField}
                          type="text"
                          className={`form-control ${props.validatedElements.fName ? 'is-valid' : 'is-invalid'}`}
                          id="firstName"
                          placeholder="First Name"
                          required />
                      </div>

                      <div className="col-md-4 mb-3">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          onChange={props.updatePurchaseField}
                          type="text"
                          className={`form-control ${props.validatedElements.lName ? 'is-valid' : 'is-invalid'}`}
                          id="lastName"
                          placeholder="Last Name"
                          required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email">Email</label>
                        <input
                          onChange={props.updatePurchaseField}
                          type="email"
                          className={`form-control ${props.validatedElements.email ? 'is-valid' : 'is-invalid'}`}
                          id="email"
                          placeholder="Email address"
                          required />
                        <div className="invalid-feedback">
                          Please provide a valid email.
                        </div>
                      </div>
                    </div>

                    {/* Terinary to display will call name fields or button to show fields */}
                    {props.checked ?
                      <div className="form-row">
                        <div className="col-md-4 mb-3">
                          <label htmlFor="willCallFirstName">Will Call First Name</label>
                          <input
                            onChange={props.updatePurchaseField}
                            type="text"
                            className='form-control'
                            id="willCallFirstName"
                            placeholder="First Name" />
                        </div>

                        <div className="col-md-4 mb-3">
                          <label htmlFor="willCallLastName">Will Call Last Name</label>
                          <input
                            onChange={props.updatePurchaseField}
                            type="text"
                            className='form-control'
                            id="willCallLastName"
                            placeholder="Last Name" />
                        </div>
                      </div>
                      :
                      <div className="form-row">
                        <div className="col-md-4 mb-3">
                          <button
                            onClick={props.handleCheck}
                            type="button"
                            className="btn btn-outline-primary">Click if tickets are for someone else!</button>
                        </div>
                      </div>}

                    <div className="form-row">
                      <div className="col-md-4 mb-3">
                        <input
                          onChange={props.updatePurchaseField}
                          type="text"
                          className='form-control'
                          id="discountCode"
                          placeholder="Discount Code" />
                      </div>
                    </div>


                    <div className='form-row'>
                      
                      <Checkout
                        validated={props.validated}
                        purchase={props.purchase}
                        totalCost={totalCost}
                        showsInCart={props.showsInCart}>
                      </Checkout>

                      <h4>Cart Total:
                            <span className="badge badge-secondary">{`$${totalCost}`}</span>
                      </h4>
                      
                    </div>
                  </form>



                </div>
              </div>
            </div> : ''}
        </div>
      </React.Fragment>

    </div>
  )
}

export default Cart;