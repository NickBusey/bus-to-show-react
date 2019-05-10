import React from 'react'
import '../../App.css'
import CartItem from './CartItem'
import Checkout from './Stripe_Checkout'
import MediaQuery from 'react-responsive'
import logo from '../../Images/Logos/bts-logo-gray.png'
import moment from 'moment'

const Cart = (props) => {

  let cTSendId;

  if (props.cartToSend) {
    cTSendId = props.cartToSend.eventId
  }

  const showInfo = props.shows.find(show => parseInt(show.id) === parseInt(cTSendId))

  let savings = Number(props.afterDiscountObj.totalSavings)
  let totalSavings = savings.toFixed(2)
  let cost = Number(props.totalCost - savings)
  let totalCost = cost.toFixed(2)

  const pickupTime = props.lastDepartureTime
  const firstBusLoad = props.firstBusLoad
  const pickupLocation = props.pickupLocations.find(location => parseInt(location.id) === parseInt(props.pickupLocationId))
  //const pickupSpot= pickupLocation[0]

  let time1 = pickupTime.split(':')
  let time2 = time1[1].split(' PM')[0] - 15
  let time3 = time1[0].concat(time2)
  if (time2 < 0) {
    time2 = 45
    time3 = [(time3.split('-')[0] - 1)].concat(time2).join('')
  }

  const defaultFirstBus = moment(time3, 'hmm').format('h:mm')


  // const receiptDescription = `${props.ticketQuantity} Roundtrip Bus Spot(s) on ${moment(props.showsInCart[0].date, "MM-DD-YYYY").format("dddd")}, ${props.showsInCart[0].date} For: ${props.showsInCart[0].headliner} at ${props.showsInCart[0].venue.split(' Amphitheatre')[0]} Departing From: ${pickupLocation.locationName} ${pickupLocation.streetAddress} with last call currently scheduled at ${pickupTime} (check website for most recent time updates.)`

  return (
    <div className='Cart'>
      {/* Desktop View */}
      <MediaQuery minWidth={8}>
        <React.Fragment>
          {props.inCart.length === 0 ?
            <div className="nothing-in-cart">
              <div className="row container nothing-in-cart-text">
                <div className="col-md-12 mt-3">
                  {props.purchaseSuccessful ?
                    <div>
                      <h2>Thank you for your purchase to {showInfo.headliner} on {showInfo.date}!</h2>
                      <h4>You should receive a confirmation email shortly</h4>
                      <MediaQuery maxWidth={799}>
                        <button
                          id='backToCalendar'
                          onClick={props.backToCalendar}
                          type="button"
                          className='btn detail-btn my-4 col-md-2'>Back to Calendar</button>
                      </MediaQuery>
                    </div>
                    : <h1>Nothing in Cart!</h1>}
                </div>
                <div className="col-md-12 mt-3">
                  <img
                    className='nothing-in-cart-image'
                    src={logo}
                    alt="bts-logo"
                    width="233"
                    height="100" />
                </div>
              </div>
            </div>
            :
            <div className="list-group">
              {props.displayWarning || props.purchasePending || props.purchaseSuccessful || props.displayConfirmRemove ?
                <div className="row">
                  <div className="col-md-12">
                    {props.displayWarning ? <div className="alert alert-warning mb-2" role="alert">
                      <h6 className="warning-text">
                        We are currently only able to process orders for one event at a time.  Please either complete your reservation for this event, or click “cancel order”  to change qty or start over with a different event.
                      </h6>
                      <div className="warning-btns">
                        <button onClick={props.removeFromCart} type="button" className="btn btn-sm btn-danger mr-2">Cancel & Start Over</button>
                        <button onClick={props.closeAlert} type="button" className="btn btn-sm btn-success">Continue With Order</button>
                      </div>
                    </div> : ''}
                    {(props.purchasePending && !props.purchaseFailed) ?
                    <div className="alert alert-primary" role="alert"> Purchase Pending... </div>
                    :
                    (props.purchasePending && props.purchaseFailed ?
                      <div className="alert alert-danger" role="alert"> Payment Declined, Please Try Another Card </div> : '')}
                    {props.displayConfirmRemove ? <div className="alert alert-danger" role="alert">
                      Are you sure you want to remove item from cart?
                    <button onClick={props.confirmedRemove} type="button" className="btn btn-danger ml-1">Remove</button>
                      <button onClick={props.closeAlert} type="button" className="btn btn-outline-secondary ml-1">Continue Order</button>
                    </div> : ''}
                  </div>
                </div>
                : ''}

              <div className="row">
                <div className="col-md-12">
                  <CartItem
                    afterDiscountObj={props.afterDiscountObj}
                    closeAlert={props.closeAlert}
                    confirmedRemove={props.confirmedRemove}
                    confirmRemove={props.confirmRemove}
                    displayConfirmRemove={props.displayConfirmRemove}
                    firstBusLoad={props.firstBusLoad}
                    getPickupParty={props.getPickupParty}
                    lastDepartureTime={props.lastDepartureTime}
                    pickupLocationId={props.pickupLocationId}
                    pickupLocations={props.pickupLocations}
                    pickupParties={props.pickupParties}
                    quantityChange={props.quantityChange}
                    removeFromCart={props.removeFromCart}
                    shows={props.shows}
                    showsInCart={props.showsInCart}
                    ticketPrice={props.ticketPrice}
                    ticketQuantity={props.ticketQuantity}
                    totalCost={Number(props.totalCost).toFixed(2)} />
                </div>
              </div>
              <div className="alert alert-warning">Cart will reset in 10 minutes</div>
              {props.showsInCart ?
                <div className="list-group-item" >
                  <div className="row">
                    <div className="col-md-12">
                      <form className="needs-validation" onSubmit={props.handleSubmit}>
                        <div className="form-row">
                          <div className="col-md-4 mb-3">
                            <label htmlFor="firstName">First Name</label>
                            <input
                              onChange={props.updatePurchaseField}
                              type="text"
                              className={`form-control ${props.validatedElements.firstName ? 'is-valid' : ''}`}
                              id="firstName"
                              placeholder="First Name"
                              required />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                              onChange={props.updatePurchaseField}
                              type="text"
                              className={`form-control ${props.validatedElements.lastName ? 'is-valid' : ''}`}
                              id="lastName"
                              placeholder="Last Name"
                              required />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="col-md-8 mb-3">
                            <label htmlFor="email">Email</label>
                            <input
                              onChange={props.updatePurchaseField}
                              type="email"
                              className={`form-control ${props.validatedElements.email ? 'is-valid' : ''}`}
                              id="email"
                              placeholder="Email address"
                              required />
                            <div className="invalid-feedback">
                              Please provide a valid email.
                            </div>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="col-md-8 mb-3">
                            <label htmlFor="phone">Phone</label>
                            <input
                              onChange={props.updatePurchaseField}
                              type="phone"
                              className={`form-control ${props.validatedElements.phone ? 'is-valid' : ''}`}
                              id="phone"
                              placeholder="Format: XXX-XXX-XXXX"
                              required />
                            <div className="invalid-feedback">
                              Please provide a valid phone number.
                            </div>
                          </div>
                        </div>

                        {/* Ternary to display will call name fields or button to show fields */}
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
                                className="btn btn-outline-primary">Reserving for someone else?</button>
                            </div>
                          </div>}
                        <div className="form-row">
                          <div className="col-md-4 mb-3">
                            <input
                              onChange={props.updateDiscountCode}
                              type="text"
                              className='form-control'
                              id="discountCode"
                              placeholder="Discount Code" />
                          </div>
                          <div className="col-md-4 mb-3">
                            <button type="button" onClick={props.findDiscountCode} className="btn btn-outline-secondary">Apply</button>
                          </div>
                        </div>

                        <div className='row display-flex'>
                          {savings ?
                            <div className="col-4">
                              <h5>Total savings:
                          <span className="badge badge-secondary ml-1">{`$${savings.toFixed(2)}`}</span>
                              </h5>
                            </div>
                            : ""
                          }
                        </div>
                        <div className='form-row cart-flex'>
                          <div>
                          <MediaQuery maxWidth={799}>
                            <button onClick={props.confirmedRemove} type="button" className="btn btn-outline-danger mr-1">Cancel</button>
                          </MediaQuery>
                          <MediaQuery minWidth={800}>
                            <button onClick={props.removeFromCart} type="button" className="btn btn-outline-danger mr-1">Cancel</button>
                          </MediaQuery>
                            <Checkout
                              cartToSend={props.cartToSend}
                              makePurchase={props.makePurchase}
                              purchasePending={props.purchasePending}
                              validated={props.validated}
                              purchase={props.purchase}
                              afterDiscountObj={props.afterDiscountObj}
                              totalCost={totalCost}
                              showsInCart={props.showsInCart}>
                            </Checkout>
                          </div>
                          <div className="cartTotal">
                            <h3>Cart Total:
                                <span className="badge badge-success">{`$${totalCost}`}</span>
                            </h3>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div> : ''}
            </div>}
        </React.Fragment>
      </MediaQuery>
      {/* End Desktop View */}

    </div >

  )
}

export default Cart;
