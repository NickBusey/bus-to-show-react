// Packages
import React, { Component } from 'react';
import { BrowserRouter } from "react-router-dom"
import Validator from 'validator'
import MediaQuery from 'react-responsive';

// Styling
import './App.css';

// Components
import Header from './Components/Header'
import ShowList from './Components/Shows/ShowList'
import Loading from './Components/Loading'
import LoginView from './Components/LoginView/LoginView'
// import Footer from './Components/Footer'
import SponsorBox from './Components/SponsorBox'
import DetailCartView from './Components/DetailCartView'
import BannerRotator from './Components/BannerRotator'

//////***** COMMENTED OUT URLS ON THE FOLLOWING LINES, USE TO SWITCH BETWEEN LOCALHOST or HEROKU:
//////***** App.js: LINES 74/75, 79/80, 86/87, 109/110, 254/255, 290/291
//////***** Stripe_Checkout.js: LINES 6/7

class App extends Component {
  // Please keep sorted alphabetically so we don't duplicate keys :) Thanks!
  state = {
    artistDescription: null,
    artistIcon: false,
    cartToSend: {
      eventId: null,
      pickupLocationId: null,
      firstName: '',
      lastName: '',
      email: '',
      willCallFirstName: '',
      willCallLastName: '',
      ticketQuantity: 0,
      totalCost: 0,
      discountCode: ''
    },
    checked: false,
    dateIcon: true,
    displayAddBtn: false,
    displayBorder: false,
    displayCart: false,
    displayDetailCartView: false,
    displayShow: null,
    displayStripe: false,
    displaySuccess: false,
    displayWarning: false,
    displayQuantity: false,
    filterString: '',
    inCart: [],
    pickupLocationId: null,
    purchasePending: false,
    purchaseSuccessful: false,
    loginView: false,
    ticketsAvailable: [],
    ticketQuantity: null,
    totalCost: 0,
    validated: false,
    validatedElements: {
      fName: null,
      lName: null,
      email: null,
      wCFName: null,
      wCLName: null
    }
  }


  async componentDidMount() {
    const response = await fetch('https://something-innocuous.herokuapp.com/events')
    // const response = await fetch('http://localhost:3000/events')
    const shows = await response.json()
    this.setState({shows:shows})

    let newState = this.state.shows.sort((show1, show2) => {
        let a = new Date(show1.date)
        let b = new Date(show2.date)
        return a - b
      })

    this.setState({ shows:newState })

    const allEvents = await fetch('https://something-innocuous.herokuapp.com/events')
    // const allEvents = await fetch('http://localhost:3000/events')
    const eventsList = await allEvents.json()
    const eventsListIds = []
    for (let i = 0; i < eventsList.length; i++) {
      eventsListIds.push(eventsList[i].id)
    }

    const pickups = await fetch('https://something-innocuous.herokuapp.com/pickup_locations')
    // const pickups = await fetch('http://localhost:3000/pickup_locations')
    const pickupLocations = await pickups.json()
    this.setState({ pickupLocations })

    const getPickupParties = await fetch('https://something-innocuous.herokuapp.com/pickup_parties')
    const pickupParties = await getPickupParties.json()
    this.setState({ pickupParties })
  }

  selectPickupLocationId = async (event) => {
    const newState = { ...this.state }
    newState.pickupLocationId = event.target.value
    if (event.target.value) {
      newState.displayQuantity = true
    }
    else {
      newState.displayQuantity = false
    }
    this.setState(newState)

    const response = await fetch('https://something-innocuous.herokuapp.com/pickup_parties')
    // const response = await fetch('http://localhost:3000/pickup_parties')
    const locations = await response.json()
    const statePickupId = parseInt(this.state.pickupLocationId)
    const stateEventId = parseInt(this.state.displayShow.id)

    const matchedLocation = locations.find(location => (parseInt(location.pickupLocationId) === statePickupId) && (parseInt(location.eventId) === stateEventId))

    let numArray = []
    if (matchedLocation) {
      const capacityLessInCart = parseInt(matchedLocation.capacity) - parseInt(matchedLocation.inCart)
      numArray = [...Array(capacityLessInCart).keys()].map(i => i + 1)
      newState.ticketsAvailable = numArray
    }
    else {
      console.log('Error!!')
    }

    this.setState({ ticketsAvailable: newState.ticketsAvailable })
  }

  selectTicketQuantity = (event) => {
    const newState = { ...this.state }
    if (event.target.value) {
      newState.displayAddBtn = true
    }
    else {
      newState.displayAddBtn = false
    }
    newState.ticketQuantity = event.target.value
    const pickupLocation = newState.pickupLocations.filter(location => parseInt(location.id) === parseInt(this.state.pickupLocationId))[0]
    const subTotal = (Number(pickupLocation.basePrice) * Number(event.target.value))
    const total = ((Number(subTotal) * .1) + Number(subTotal)).toFixed(2)
    newState.totalCost = total
    this.setState(newState)
  }

  updateDiscountCode = (event) => {
    console.log(event.target.value)
    const newState = { ...this.State }
    newState.discountCode = event.target.value
    this.setState(newState)
    console.log('discountCode set::: ', newState.discountCode)

  }


  findDiscountCode = async () =>{
    console.log ("hey, how bout that?")
    //console.log ('currentCode inside findDiscountCode:::', this.state.discountCode)
    const eventId = this.state.inCart[0].id
    const response = await fetch(`http://localhost:3000/discount_codes/${this.state.discountCode}`)
    const json = await response.json()
    //const newState = { ...this.state }
    //this.setState(newState)
    console.log('what is the event ID from state right now?', eventId)
    console.log('findDiscountCode json:::: ', json)
    const result = json.filter((discountObj) => discountObj.eventsId === eventId)[0]
    console.log('filter result', result)
    if(!result){
      console.log('no match!')
      return "no match"
    }
    if(result.remainingUses <= 0){
      console.log ('this code is all used up.')
    }

    const expiration = Date.parse(result.expiresOn.toLocaleString('en-US'))
    console.log('expiration::::', result.expiresOn)

    const today = Date.parse(new Date().toLocaleString('en-US', {timeZone: 'America/Denver'}))
    console.log('today:::', today)
    if (expiration < today){
    console.log('this code is expired')
  } else {
    console.log('this is a valid code that is not expired')
  }
      // X result.discountCode: "MetallicaConcert"
      // X result.eventsId: 36500124
      // result.expiresOn: "2019-06-06T06:00:00.000Z"
      // result.percentage: 40
      // result.remainingUses: 190
    }



  // Header Functions
  loginClick = () => {
    const newState = { ...this.state }
    newState.loginView = true
    this.setState(newState)
  }

  returnHome = () => {
    const newState = { ...this.state }
    newState.loginView = false
    this.setState(newState)
  }

  searchShows = (event) => {
    const newState = { ...this.state }
    newState.filterString = event.target.value
    this.setState({ filterString: newState.filterString })
  }

  // Tab Functions
  tabClicked = (event) => {
    const newState = { ...this.state }
    if (event.target.id === 'cart-tab') {
      newState.displayCart = true
    }
    else {
      newState.displayCart = false
    }

    this.setState(newState)
  }

  // Show Functions
  showsExpandClick = async (event) => {
    const newState = { ...this.state }
    newState.displayQuantity = false
    const clickedShow = newState.shows.find(show => (parseInt(show.id) === parseInt(event.target.id)))
    newState.displayDetailCartView = true
    newState.displaySuccess = false
    newState.displayShow = clickedShow
    this.setState(newState)
    if(document.querySelector('#departureLocation')){
      document.querySelector('#departureLocation').value = "Select a Departure Location..."
    }
  }

  returnToShows = () => {
    const newState = { ...this.state }
    newState.displayShow = null
    newState.displaySuccess = false
    this.setState(newState)
  }

  addToCart = async () => {
    const newState = { ...this.state }
    const pickupLocation = newState.pickupLocations.filter(location => parseInt(location.id) === parseInt(this.state.pickupLocationId))[0]
    const basePrice = Number(pickupLocation.basePrice)
    const ticketQuantity = parseInt(this.state.ticketQuantity)
    const processingFee = Number((basePrice * ticketQuantity) * (0.1))
    const cost = ((basePrice * ticketQuantity) + processingFee)

    newState.totalCost = cost.toFixed(2)

    if (newState.inCart.length === 0) {
      newState.inCart.push(newState.displayShow)
      newState.displaySuccess = true
    }
    else {
      newState.displayWarning = true
    }

    this.setState(newState)

    fetch('https://something-innocuous.herokuapp.com/pickup_parties', {
      // fetch('http://localhost:3000/pickup_parties', {
      method: 'PATCH',
      body: JSON.stringify({
        pickupLocationId: this.state.pickupLocationId,
        eventId: this.state.inCart[0].id,
        ticketQuantity: parseInt(this.state.ticketQuantity),
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    setTimeout(fetch('https://something-innocuous.herokuapp.com/pickup_parties', {
      // setTimeout(fetch('http://localhost:3000/pickup_parties', {
      method: 'PATCH',
      body: JSON.stringify({
        pickupLocationId: this.state.pickupLocationId,
        eventId: this.state.inCart[0].id,
        ticketQuantity: parseInt(this.state.ticketQuantity) * -1,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }), 600000)
  }

  // Cart Functions
  handleCheck = () => {
    const newState = { ...this.state }
    newState.checked = true
    this.setState(newState)
  }

  getPickupParty = (thisEventId, pickupLocId) => {
    pickupLocId = parseInt(pickupLocId)
    let allPickupParties = this.state.pickupParties
    let thisPickupParty = allPickupParties.filter(pickupParty => pickupParty.eventId === thisEventId && pickupParty.pickupLocationId === pickupLocId)[0]
    console.log(allPickupParties)
    console.log(thisEventId, pickupLocId)
    console.log(thisPickupParty)
    let hours = Number(thisPickupParty.lastBusDepartureTime.split(':')[0])
    let minutes = thisPickupParty.lastBusDepartureTime.split(':')[1]
    let amPm = ''
    if (hours < 11) {
      amPm = 'AM'
    }
    if (hours === 12) {
      amPm = 'PM'
    }
    if (hours > 12) {
      amPm = 'PM'
      hours -= 12
    }
    let pickupTime = `${hours}:${minutes} ${amPm}`
    return pickupTime
  }

  purchase = async () => {
    const cartObj = this.state.cartToSend
    fetch('https://something-innocuous.herokuapp.com/orders', {
      // fetch('http://localhost:3000/orders', {
      method: 'POST',
      body: JSON.stringify(cartObj),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setState({ purchaseSuccessful: true, purchasePending: false })
  }

  updatePurchaseField = (event) => {
    const newState = { ...this.state }
    const updateField = event.target.id
    const value = event.target.value
    const vE = newState.validatedElements
    let discountCode = ''

    // Checks fields via npm package validator
    if (updateField === 'email' && Validator.isEmail(value) && !Validator.isEmpty(value)) {
      vE.email = value
    }
    else if (updateField === 'firstName' && Validator.isAlpha(value) && !Validator.isEmpty(value)) {
      vE.fName = value
    }
    else if (updateField === 'lastName' && Validator.isAlpha(value) && !Validator.isEmpty(value)) {
      vE.lName = value
    }
    else if (updateField === 'willCallFirstName' && Validator.isAlpha(value)) {
      vE.wCFName = value
    }
    else if (updateField === 'willCallLastName' && Validator.isAlpha(value)) {
      vE.wCLName = value
    }
    else if (updateField === 'discountCode') {
      discountCode = value
    }
    else {
      return 'Please input valid items'
    }

    this.setState({ validatedElement: newState.validatedElements })

    // Populates cartToSend
    if (this.state.validatedElements.fName
      && this.state.validatedElements.lName
      && this.state.validatedElements.email) {

      const cTS = newState.cartToSend
      // newState.validated = true

      cTS.firstName = this.state.validatedElements.fName
      cTS.lastName = this.state.validatedElements.lName
      cTS.email = this.state.validatedElements.email
      cTS.eventId = this.state.inCart[0].id
      cTS.ticketQuantity = parseInt(this.state.ticketQuantity)
      cTS.pickupLocationId = parseInt(this.state.pickupLocationId)
      cTS.totalCost = Number(this.state.totalCost)
      cTS.discountCode = discountCode

      if (this.state.validatedElements.wCFName) {
        cTS.willCallFirstName = this.state.validatedElements.wCFName
      }
      else {
        cTS.willCallFirstName = this.state.validatedElements.fName
      }

      if (this.state.validatedElements.wCLName) {
        cTS.willCallLastName = this.state.validatedElements.wCLName
      }
      else {
        cTS.willCallLastName = this.state.validatedElements.lName
      }

      this.setState({ cartToSend: newState.cartToSend })
      this.setState({ validated: newState.validated })
    }
    else {
      console.log('ERROR!')
    }
  }

  removeFromCart = () => {
    const newState = { ...this.state }
    newState.inCart = []
    newState.displaySuccess = false
    this.setState(newState)
  }

  quantityChange = (event) => {
    const newState = { ...this.state }
    newState.ticketQuantity = event.target.value

    const pickupLocation = this.state.pickupLocations.filter(location => location.id == this.state.pickupLocationId)[0]
    const basePrice = Number(pickupLocation.basePrice)
    const ticketQuantity = parseInt(newState.ticketQuantity)
    const processingFee = Number((basePrice * ticketQuantity) * (0.1))
    const cost = ((basePrice * ticketQuantity) + processingFee)
    newState.totalCost = cost.toFixed(2)
    this.setState(newState)
  }

  addBorder = () => {
    const newState = { ...this.state }
    newState.displayBorder = true
    this.setState(newState)

    setTimeout(() => {
      const newState = { ...this.state }
      newState.displayBorder = false
      this.setState(newState)
    }, 500)
  }

  sortByArtist = () => {
    let newState = this.state.shows.sort((show1, show2) => {
      let a = show1.headliner.toLowerCase().split(" ").join("")
      let b = show2.headliner.toLowerCase().split(" ").join("")
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    })
    this.setState({ shows: newState, artistIcon: true, dateIcon: false })
  }

  sortByDate = () => {
    let newState = this.state.shows.sort((show1, show2) => {
      let a = new Date(show1.date)
      let b = new Date(show2.date)
      return a - b

    })
    this.setState({ shows: newState, artistIcon: false, dateIcon: true })
  }


  makePurchase = () => {
    this.setState({ purchasePending: true })
  }

  render() {
    return (
      <BrowserRouter>
        <div className="App">
          {this.state.loginView ?
            <LoginView
              returnHome={this.returnHome} /> :
            this.state.shows ?
              <React.Fragment>
                <Header
                  loginClick={this.loginClick} />
                <div className='content-section pt-4'>
                  <div className='col-md-6 float-right' >
                    <MediaQuery minWidth={768}>
                      <BannerRotator />
                      {this.state.displayCart || this.state.displayShow ?
                        (<DetailCartView
                          shows={this.state.shows}
                          makePurchase={this.makePurchase}
                          purchasePending={this.state.purchasePending}
                          purchaseSuccessful={this.state.purchaseSuccessful}
                          addToCart={this.addToCart}
                          checked={this.state.checked}
                          displayAddBtn={this.state.displayAddBtn}
                          displayBorder={this.state.displayBorder}
                          displayCart={this.state.displayCart}
                          displayQuantity={this.state.displayQuantity}
                          displayShow={this.state.displayShow}
                          displaySuccess={this.state.displaySuccess}
                          displayWarning={this.state.displayWarning}
                          indDiscountCode={this.findDiscountCode}
                          getPickupParty={this.getPickupParty}
                          handleCheck={this.handleCheck}
                          handleSubmit={this.handleSubmit}
                          inCart={this.state.inCart}
                          pickupLocations={this.state.pickupLocations}
                          pickupLocationId={this.state.pickupLocationId}
                          purchase={this.purchase}
                          purchaseClick={this.purchaseClick}
                          quantityChange={this.quantityChange}
                          removeFromCart={this.removeFromCart}
                          returnToShows={this.returnToShows}
                          selectPickupLocationId={this.selectPickupLocationId}
                          selectTicketQuantity={this.selectTicketQuantity}
                          showsExpandClick={this.showsExpandClick}
                          showsInCart={this.state.inCart}
                          tabClicked={this.tabClicked}
                          ticketsAvailable={this.state.ticketsAvailable}
                          ticketQuantity={this.state.ticketQuantity}
                          updateDiscountCode={this.updateDiscountCode}
                          timeLeftInCart={this.state.timeLeftInCart}
                          totalCost={this.state.totalCost}
                          updatePurchaseField={this.updatePurchaseField}
                          validated={this.state.validated}
                          validatedElements={this.state.validatedElements} />
                        )
                        :
                        <SponsorBox />}
                    </MediaQuery>
                    <MediaQuery maxWidth={767}>
                      <BannerRotator />
                      {this.state.displayCart || this.state.displayShow ?
                        <DetailCartView
                          shows={this.state.shows}
                          addToCart={this.addToCart}
                          addBorder={this.addBorder}
                          checked={this.state.checked}
                          displayAddBtn={this.state.displayAddBtn}
                          displayBorder={this.state.displayBorder}
                          displayCart={this.state.displayCart}
                          displayQuantity={this.state.displayQuantity}
                          displayShow={this.state.displayShow}
                          displaySuccess={this.state.displaySuccess}
                          filterString={this.state.filterString}
                          findDiscountCode={this.findDiscountCode}
                          handleCheck={this.handleCheck}
                          handleSubmit={this.handleSubmit}
                          inCart={this.state.inCart}
                          pickupLocations={this.state.pickupLocations}
                          pickupLocationId={this.state.pickupLocationId}
                          purchase={this.purchase}
                          purchaseClick={this.purchaseClick}
                          quantityChange={this.quantityChange}
                          removeFromCart={this.removeFromCart}
                          returnToShows={this.returnToShows}
                          pickupLocationId={this.state.pickupLocationId}
                          selectPickupLocationId={this.selectPickupLocationId}
                          selectTicketQuantity={this.selectTicketQuantity}
                          shows={this.state.shows}
                          showsExpandClick={this.showsExpandClick}
                          showsInCart={this.state.inCart}
                          tabClicked={this.tabClicked}
                          ticketsAvailable={this.state.ticketsAvailable}
                          ticketQuantity={this.state.ticketQuantity}
                          totalCost={this.state.totalCost}
                          updatePurchaseField={this.updatePurchaseField}
                          validated={this.state.validated}
                          validatedElements={this.state.validatedElements} />
                        :

                        <ShowList
                          addBorder={this.addBorder}
                          displayShow={this.state.displayShow}
                          filterString={this.state.filterString}
                          searchShows={this.searchShows}
                          shows={this.state.shows}
                          showsExpandClick={this.showsExpandClick}
                          sortByArtist={this.sortByArtist}
                          sortByDate={this.sortByDate}
                          sortedByArtist={this.state.artistIcon}
                          sortedByDate={this.state.dateIcon}
                          ticketsAvailable={this.state.ticketsAvailable} />}
                    </MediaQuery>
                  </div>
                  <div className='col-md-6 float-left'>
                    <MediaQuery minWidth={768}>
                      <ShowList
                        addBorder={this.addBorder}
                        displayShow={this.state.displayShow}
                        filterString={this.state.filterString}
                        searchShows={this.searchShows}
                        shows={this.state.shows}
                        showsExpandClick={this.showsExpandClick}
                        sortByArtist={this.sortByArtist}
                        sortByDate={this.sortByDate}
                        sortedByArtist={this.state.artistIcon}
                        sortedByDate={this.state.dateIcon}
                        ticketsAvailable={this.state.ticketsAvailable} />
                    </MediaQuery>
                  </div>
                </div>
              </React.Fragment> : <Loading />
          }
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
