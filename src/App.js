// Packages
import React, { Component } from 'react'
// import { BrowserRouter } from "react-router-dom"
import Validator from 'validator'
import MediaQuery from 'react-responsive'
import moment, { locale } from 'moment'
// import socketIo from 'socket.io-client'

// Styling
import './App.css';

// Components
import AdminView from './Components/Admin/adminView'
import Aboutus from './Components/Aboutus/Aboutus'
import Header from './Components/Header'
import ShowList from './Components/Shows/ShowList'
import LoginView from './Components/LoginView/LoginView'
import Loading from './Components/Loading'
import SponsorBox from './Components/SponsorBox'
import DetailCartView from './Components/DetailCartView'
import BannerRotator from './Components/BannerRotator'
import ReactGA from 'react-ga';
ReactGA.initialize('UA-17782248-2');
ReactGA.pageview('/app');
// { email: "jake136@yahoo.com",
// firstName: "Jake",
// id: 105,
// isAdmin: true,
// isDeactivated: false,
// isDriver: true,
// isStaff: true,
// isWaiverSigned: false,
// lastName: "Mosher",
// preferredLocation: "" }
// userID: "10102849492705992"

const fetchUrl = `http://localhost:3000`
// const fetchUrl = `https://bts-test-backend.herokuapp.com`

class App extends Component {
  // Please keep sorted alphabetically so we don't duplicate keys :) Thanks!
  state = {
    adminView: false,
    afterDiscountObj: {
      totalSavings: 0
    },
    artistDescription: null,
    artistIcon: false,
    assignedParties: [],
    basePrice: null,
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
      discountCode: null,
      userId: null,
    },
    checked: false,
    confirmRemove: false,
    dateIcon: true,
    displayAboutus: false,
    displayAddBtn: false,
    displayBios: false,
    displayBorder: false,
    displayBus: true,
    displayCart: false,
    displayConfirmRemove: false,
    displayDetailCartView: false,
    displayEditReservation: false,
    displayEditSuccess: false,
    displayExternalShowDetails: false,
    displayFuture: true,
    displayPast: false,
    displayLoadingScreen: true,
    displayLoginView: false,
    displayReservationDetail: false,
    displayShow: null,
    displayShowDetails: false,
    displayShowList: true,
    displayStripe: false,
    displaySuccess: false,
    displayViewCartBtn: false,
    displayWarning: false,
    displayQuantity: false,
    displayReservations: false,
    displayUserReservationSummary: false,
    displayTimes: false,
    // facebook: {
    //   isLoggedIn: false,
    //   userID: '',
    //   name: '',
    //   email:'',
    //   picture:'',
    //   userDetails: {},
    // },
    facebook: {
      isLoggedIn: true,
      userID: "10156117602853997",
      name: "Jake Mosher",
      email: "jakeypoo@boner.com",
      picture: "",
      userDetails: {
        email: "jakeypoo@boner.com",
        firstName: "Jake",
        lastName: "Mosher",
        id: 105,
        isAdmin: true,
        isDeactivated: false,
        isDriver: false,
        isStaff: true,
        isWaiverSigned: false,
        preferredLocation: ""
      },
    },
    filterString: '',
    firstBusLoad: null,
    googleResponse: null,
    inCart: [],
    pickupLocationId: null,
    pickupPartyId: null,
    purchaseFailed: false,
    purchasePending: false,
    purchaseSuccessful: false,
    reservationDetail: null,
    reservationToEditId: null,
    reservationEditsToSend: [],
    showBios: false,
    spotifyResponse: null,
    startTimer: false,
    ticketTimer: null,
    ticketsAvailable: [],
    ticketQuantity: null,
    totalCost: 0,
    userDetails: {},
    userReservations: [],
    validated: false,
    validatedElements: {
      fName: null,
      lName: null,
      email: null,
      wCFName: null,
      wCLName: null
    },
    oldStuff: [],
    willCallEdits: {},
  }

  async componentDidMount() {
    const response = await fetch(`${fetchUrl}/events`)
    const allShows = await response.json()
    //filters out expired shows and shows that don't meet criteria, and shows that are denied.
    const dateCheck = (show) => {
      const showDate = Date.parse(show.date)
      const today = new Date()
      const yesterday = today.setDate(today.getDate() - 1)

      if (showDate < yesterday) {
        return false
      } else {
        return true
      }
    }
    const currentShows = allShows.filter(dateCheck)
    const shows = currentShows.filter(show => show.meetsCriteria === true && show.isDenied === false)

    this.setState({ shows: shows })

    const newState = this.state.shows.sort((show1, show2) => {
      const a = new Date(show1.date)
      const b = new Date(show2.date)
      return a - b
    })

    this.setState({ shows: newState })
    const pickups = await fetch(`${fetchUrl}/pickup_locations`)
    const pickupLocations = await pickups.json()
    this.setState({ pickupLocations })

    // const getPickupParties = await fetch(`${fetchUrl}/pickup_parties`)
    // const pickupParties = await getPickupParties.json()
    // this.setState({ pickupParties })
  }

  //status: over-ridden by onclick event in the "ride with us button" where called in "loading.js"
  onLoad = () => {

    const newState = { ...this.state }
    newState.displayLoadingScreen = false
    this.setState({ displayLoadingScreen: newState.displayLoadingScreen })
  }

  //status: in progress.  where: called in "loading.js".  why: adding interactive animation so that buses fly away on click.
  handleBus = event => {

    if (event.target.id === 'bus1') {
      const newState = { ...this.state }
      newState.displayBus = !newState.displayBus
      this.setState({ displayBus: newState.displayBus })
    }
  }

  getPickupParties = async (eventId) => {
    const response = await fetch(`${fetchUrl}/pickup_parties/findParties`, {
      method: 'PATCH',
      body: JSON.stringify({ eventId }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

  let result = await response.json()
  result = result.sort( (a, b) => {
    return a.id - b.id
  })
  return result
  }

  refreshPickupParty = async (pickupId) => {
    const response = await fetch(`${fetchUrl}/pickup_parties/${pickupId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

  const result = await response.json()
  return result
  }

  //status: active.  where: called in showDetails.  why:  requires selection of location before corresponding times and quantities are displayed.
  selectPickupLocationId = async event => {
    const newState = { ...this.state }
    if (parseInt(event.target.value) !== newState.pickupPartyId) {
      newState.ticketQuantity = null
      newState.displayQuantity = false
      newState.displayAddBtn = false
      this.setState({
        ticketQuantity: newState.ticketQuantity,
        displayQuantity: newState.displayQuantity,
        displayAddBtn: newState.displayAddBtn
      })
    }

    if (parseInt(event.target.value)) {
      newState.pickupPartyId = event.target.value
      newState.displayQuantity = true
    }
    else {
      newState.displayQuantity = false
      newState.displayAddBtn = false
    }
    
    const statePickupPartyId = parseInt(newState.pickupPartyId)
    const stateEventId = parseInt(newState.displayShow.id)

    const parties = newState.assignedParties
    let matchedParty = await parties.find(party => (parseInt(party.id) === statePickupPartyId) && (parseInt(party.eventId) === stateEventId))
    newState.pickupLocationId = matchedParty.pickupLocationId
    if (matchedParty.firstBusLoadTime) {
      newState.firstBusLoad = moment(matchedParty.firstBusLoadTime, 'LT').format('h:mm A')
    }
    newState.lastDepartureTime = moment(matchedParty.lastBusDepartureTime, 'LT').format('h:mm A')

    let numArray = []

    if (matchedParty) {
      matchedParty = await this.refreshPickupParty(matchedParty.id)
      const currentReservations = await fetch(`${fetchUrl}/reservations/findOrders`, {
        method: 'PATCH',
        body: JSON.stringify({
          pickupPartiesId: matchedParty.id,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const reservations = await currentReservations.json()
      console.log('res', reservations.length, 'cap', matchedParty.capacity, 'cart', matchedParty.inCart)

      const availableTickets = parseInt(matchedParty.capacity) - parseInt(reservations.length) - parseInt(matchedParty.inCart)
      if (availableTickets < 1) newState.ticketsAvailable = []
      else if (availableTickets >= 1) {
        numArray = [...Array(availableTickets).keys()].map(i => i + 1)
        newState.ticketsAvailable = numArray
      }
    }
    else {
      // console.log('Error!! No MatchedParty in selectPickupLocationId')
    }
    this.setState({
      ticketsAvailable: newState.ticketsAvailable,
      pickupLocationId: newState.pickupLocationId,
      pickupPartyId: newState.pickupPartyId,
      firstBusLoad: newState.firstBusLoad,
      lastDepartureTime: newState.lastDepartureTime,
      displayQuantity: newState.displayQuantity,
      displayAddBtn: newState.displayAddBtn
    })
  }

  selectTicketQuantity = event => {

    const newState = { ...this.state }
    if (event.target.value) {
      newState.displayAddBtn = true
    }
    else {
      newState.displayAddBtn = false
    }
    newState.ticketQuantity = event.target.value
    // const sPickupId = parseInt(this.state.pickupLocationId)
    // const sEventId = parseInt(this.state.displayShow.id)
    // const pickupParty = this.state.pickupParties.find(party => party.pickupLocationId === sPickupId && party.eventId === sEventId)
    const pickupLocation = newState.pickupLocations.filter(location => parseInt(location.id) === parseInt(this.state.pickupLocationId))[0]
    const subTotal = (Number(pickupLocation.basePrice) * Number(event.target.value))
    const total = ((Number(subTotal) * .1) + Number(subTotal)).toFixed(2)
    newState.totalCost = total
    this.setState({
      displayAddBtn: newState.displayAddBtn,
      ticketQuantity: newState.ticketQuantity,
      totalCost: newState.totalCost
    })
  }

  updateDiscountCode = event => {
    const newState = { ...this.State }
    newState.discountCode = event.target.value
    this.setState({ discountCode: newState.discountCode })
  }

  getReservations = async () => {
    const userId = this.state.facebook.userDetails.id
    // console.log('userId inside getReservations:::: ', userId)
    if (userId) {
      const reservations = await fetch(`${fetchUrl}/orders/${userId}`)
      const userReservations = await reservations.json()
      const newState = { ...this.State }
      //newState.userId = userId
      newState.userReservations = await userReservations
      await this.setState({ userReservations: newState.userReservations })
      // await console.log('userReservations', this.state.userReservations)
    }
  }

  expandReservationDetailsClick = (e) =>{
    const newState = { ...this.state }
    newState.displayUserReservationSummary = true
    newState.reservationDetail = newState.userReservations.find(show => (parseInt(show.eventsId) === parseInt(e.target.id)))
    newState.displayReservationDetail = true

    this.setState({
      displayUserReservationSummary: newState.displayUserReservationSummary,
      reservationDetail: newState.reservationDetail,
      displayReservationDetail: newState.displayReservationDetail
    })
  }

  findDiscountCode = async () => {

    const ticketQuantity = this.state.ticketQuantity
    const eventId = this.state.cartToSend.eventId
    const response = await fetch(`${fetchUrl}/discount_codes/${this.state.discountCode}`)
    const json = await response.json()

    const result = json.filter((discountObj) => discountObj.eventsId === eventId)[0]
    const newState = { ...this.State }
    if (!result) {
      return "no match"
    }
    if (result.remainingUses <= 0) {
      return 'this code is all used up!'
    }
    const expiration = Date.parse(result.expiresOn.toLocaleString('en-US'))
    const today = Date.parse(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }))

    if (expiration < today) {

      return 'this code is expired'
    } else {

      let priceWithoutFeesPerTicket = this.state.totalCost * 10 / 11 / ticketQuantity
      let effectiveRate = (100 - result.percentage) / 100
      const afterDiscountObj = {}

      if (result.remainingUses >= ticketQuantity) {
        afterDiscountObj.timesUsed = ticketQuantity * 1
        afterDiscountObj.totalPriceAfterDiscount = priceWithoutFeesPerTicket * ticketQuantity * effectiveRate * 1.10
        afterDiscountObj.totalSavings = this.state.totalCost - priceWithoutFeesPerTicket * ticketQuantity * effectiveRate * 1.10
        afterDiscountObj.newRemainingUses = result.remainingUses - ticketQuantity

        newState.afterDiscountObj = afterDiscountObj
        newState.totalSavings = afterDiscountObj.totalSavings
        this.setState({ afterDiscountObj: newState.afterDiscountObj, totalSavings: newState.totalSavings })
      }
      if (result.remainingUses < ticketQuantity) {
        afterDiscountObj.timesUsed = result.remainingUses
        afterDiscountObj.totalSavings = this.state.totalCost - (priceWithoutFeesPerTicket * (ticketQuantity - result.remainingUses) + priceWithoutFeesPerTicket * effectiveRate * result.remainingUses) * 1.10
        afterDiscountObj.totalPriceAfterDiscount = (priceWithoutFeesPerTicket * (ticketQuantity - result.remainingUses) + priceWithoutFeesPerTicket * effectiveRate * result.remainingUses) * 1.10
        afterDiscountObj.newRemainingUses = 0

        newState.afterDiscountObj = afterDiscountObj
        this.setState({ afterDiscountObj: newState.afterDiscountObj })
      }
    }
  }

  // Header Functions
  userDashboard = () => {
    const newState = { ...this.state }
    newState.displayReservations = !this.state.displayReservations
    this.setState({ displayReservations: newState.displayReservations })
  }

  returnHome = () => {
    const newState = { ...this.state }
    newState.displayReservations = false
    this.setState({ displayReservations: newState.displayReservations })
  }

  searchShows = event => {
    const newState = { ...this.state }
    newState.filterString = event.target.value
    this.setState({ filterString: newState.filterString })
  }

  toggleReservationView = (e) => {
    //console.log('click on toggleReservationView', e.target.id)
    const newState = { ...this.state }
    //displayReservationDetail
    this.getReservations()
    newState.displayFuture = true
    newState.displayPast = false
    newState.displayUserReservationSummary = true
    if(!newState.reservationDetail){
      newState.displayReservations = !newState.displayReservations
    }
    if(e.target.id==='dashboard' || e.target.id==='summary'){
      // console.log("did we get inside dashboard?")
      newState.displayReservationDetail = false
      newState.reservationDetail = null
      newState.displayUserReservationSummary = false
    }
    if(e.target.id === 'detail' || e.target.id === 'edit'){
      newState.displayReservations = true
      newState.displayEditReservation = false
      newState.displayReservationDetail = true
      newState.displayUserReservationSummary = false
    }
    this.setState({
      displayReservations: newState.displayReservations,
      reservationDetail: newState.reservationDetail,
      displayUserReservationSummary: newState.displayUserReservationSummary,
      displayReservationDetail: newState.displayReservationDetail,
      displayFuture: newState.displayFuture,
      displayPast:newState.displayPast,
      displayEditReservation: newState.displayEditReservation
    })
  }

  toggleFuturePast = (e) => {
    // console.log('this is this:', e.target.id)
    const newState = { ...this.state }
    if(e.target.id==='future'){
      newState.displayPast = false
      newState.displayFuture = true
    } else if(e.target.id==='past'){
      newState.displayPast = true
      newState.displayFuture = false
    }
      this.setState({
        displayPast: newState.displayPast,
        displayFuture: newState.displayFuture
      } )
  }

  toggleEditReservation = (e) =>{
    // console.log('click on:: toggleEditREservation ', e.target.id)
    const newState = { ...this.state }
    newState.displayEditReservation = !newState.displayEditReservation
    newState.reservationToEditId = parseInt(e.target.id)
    this.setState({
      displayEditReservation: newState.displayEditReservation,
      reservationToEditId: newState.reservationToEditId
    })
    console.log('reservationsId ', this.state.reservationToEditId)
  }

  reservationEditField = (e) => {
    //this.setState({[e.target.name]: e.target.value})
      this.setState({
        ...this.state,
          willCallEdits: {
          ...this.state.willCallEdits,
          [e.target.name]: e.target.value,
          id: e.target.id
        }
    })
    // console.log('rETS', this.state.reservationEditsToSend)
  }

  submitReservationForm = (e) => {
    e.preventDefault()
    // console.log('submit e target id', e.target.id)
    // console.log('this.state.willCallEdits::: ' , this.state.willCallEdits)
    let newRETS = [ ...this.state.reservationEditsToSend ]
    let newDisplayEditSuccess = this.state.displayEditSuccess
    newDisplayEditSuccess = !newDisplayEditSuccess
    newRETS.push(this.state.willCallEdits)
    this.setState({
      reservationEditsToSend: newRETS,
      displayEditSuccess:newDisplayEditSuccess
    })
    this.handleEditSend(newRETS)
  }

  handleEditSend= async(newRETS)=>{
    // console.log('newRETS:::: ', newRETS)
    newRETS.map(async(reservation)=>{
      // console.log('reservation inside patch map:::', reservation)
      const editReservationResponse = await fetch(`${fetchUrl}/reservations`, {
        method: 'PATCH',
        body: JSON.stringify({
          id: parseInt(reservation.id),
          willCallFirstName: reservation.willCallFirstName,
          willCallLastName: reservation.willCallLastName,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .catch()

      const json = await editReservationResponse.json()
      // await console.log('editReservationResponse.json', json)
      const e = {target: {id: "edit"}}

      await this.toggleReservationView(e)
      if(editReservationResponse.status === 200){
        // console.log('editReservationResponse', editReservationResponse.status)
      }
    })
}

  toggleEditSuccess=()=>{
    let newStateDisplayEditSuccess = {...this.state.displayEditSuccess}
    newStateDisplayEditSuccess=!newStateDisplayEditSuccess
    this.setState({displayEditSuccess: newStateDisplayEditSuccess})
  }

  toggleLoggedIn = (boolean) => {
    if (boolean === false){
      this.setState({
        ...this.state,
        facebook: {
          isLoggedIn: false,
          userID: '',
          name: '',
          email:'',
          picture:'',
          userDetails: {},
        }
      })
    } else {
      this.setState({
        ...this.state,
          facebook: {
          ...this.state.facebook,
          isLoggedIn: boolean,
        }
      })
    }
  }

  profileClick = () => {
    // this.getHeadliners()
    const newState = { ...this.state }
    newState.displayLoginView = !newState.displayLoginView

    if (newState.adminView) {
      newState.adminView = !newState.adminView
      this.setState({
        adminView: newState.adminView
      })
    }
    else {
      this.setState({
        displayLoginView: newState.displayLoginView
      })
    }
  }

  continueAsGuest = () => {
    this.setState({
      ...this.state,
        facebook: {
          isLoggedIn: false,
          userID: '',
          name: '',
          email:'',
          picture:'',
          userDetails: {},
        }
    })
  }


  responseFacebook = async (response) => {
    // console.log('searching for onLoad response facbook', response)

      this.setState({
        ...this.state,
          //isLoggedIn: true,
          facebook: {
            ...this.state.facebook,
            userID: response.id,
            name: response.name,
            email:response.email,
            picture:response.picture.data.url
          }

      })
      this.toggleLoggedIn(true)
      this.onLoad()
      const usersInfo = await fetch(`${fetchUrl}/users`, {
        body: JSON.stringify({
            firstName: response.name.split(" ")[0],
            lastName: response.name.split(" ")[1],
            email: response.email,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
      })
      const userObj = await usersInfo.json()
      const newState = { ...this.State }
      newState.userDetails = userObj
      this.setState({
        ...this.state,
        facebook: {
          ...this.state.facebook,
          userDetails: newState.userDetails
        }
      })
      // console.log('userObj response to work with', userObj)
      // console.log('this.state.facebook.userDetails::::', this.state.facebook.userDetails)
      //this.props.getReservations(json.id)
  }

  responseGoogle = response => {
    const newState = { ...this.state }
    newState.googleResponse = response.profileObj
    newState.displayLoginView = false
    this.setState({ googleResponse: newState.googleResponse, displayLoginView: newState.displayLoginView })
  }

  responseSpotify = response => {
    // console.log(response)
    const newState = { ...this.state }
    newState.spotifyResponse = response
    newState.displayLoginView = false
    this.setState({ googleResponse: newState.googleResponse, displayLoginView: newState.displayLoginView })
  }

  logout = () => {
    const newState = { ...this.state }
    newState.googleResponse = null
    newState.spotifyReponse = null
    this.setState({ googleResponse: newState.googleResponse, spotifyReponse: newState.spotifyReponse })
  }

  // Tab Functions
  tabClicked = event => {

    const newState = { ...this.state }
    if (event.target.id === 'cart-tab' && newState.inCart.length > 0) {
      newState.displayCart = true
    }
    if (event.target.innerHTML === 'Details' && newState.inCart.length === 0) {
      newState.displayCart = false
    }
    if (!newState.inCart.length > 0 && event.target.id === 'showDetails-tab') {
      newState.displayCart = false
    }
    if (newState.inCart.length > 0 && event.target.id === 'showDetails-tab') {
      newState.displayWarning = true
    }

    newState.displaySuccess = false
    this.setState({
      displaySuccess: newState.displaySuccess,
      displayCart: newState.displayCart,
      displayWarning: newState.displayWarning
    })
  }

  backToCalendar = event => {
    const newState = { ...this.state }
    // console.log('back to calendar');
    newState.displayExternalShowDetails = false
    newState.displayDetailCartView = false
    newState.displayShow = null
    newState.displaySuccess = false
    newState.displayShowList = true
    newState.displayShowDetails = false
    newState.displayCart = false
    this.setState({
      displayExternalShowDetails: newState.displayExternalShowDetails,
      displayDetailCartView: newState.displayDetailCartView,
      displayShow: newState.displayShow,
      displaySuccess: newState.displaySuccess,
      displayShowList: newState.displayShowList,
      displayShowDetails: newState.displayShowDetails,
      displayCart: newState.displayCart
    })
  }
  // Show Functions
  showsExpandClick = async (event) => {
    const newState = { ...this.state }
    //immediately clear previously selected pickupPartyId from State.
    newState.pickupPartyId = null
    this.setState({
      pickupPartyId: newState.pickupPartyId
    })
    const clickedShow = newState.shows.find(show => (parseInt(show.id) === parseInt(event.target.id)))
    if(clickedShow.external){
      newState.displayShowDetails = false
      newState.displayExternalShowDetails = true
      newState.displayShowList = false
      newState.displayShow = clickedShow
      this.setState({
        displayShowDetails: newState.displayShowDetails,
        displayExternalShowDetails: newState.displayExternalShowDetails,
        displayShow: newState.displayShow,
        displayShowList: newState.displayShowList
      })


    } else {
      // need to rewrite such that pickup parties aren't grabbed until a pickup location is selected
      //return array of pickupParties assigned to this event
      
      const assignedPickupParties = await this.getPickupParties(clickedShow.id)
      
      const currentPickups = assignedPickupParties.map(party => party.pickupLocationId)
      const pickupLocations = newState.pickupLocations.filter(loc => currentPickups.includes(loc.id))
      
      await assignedPickupParties.map(party => pickupLocations.map(location => {
        if (location.id === party.pickupLocationId) {
          party.LocationName = location.locationName
        }
      })
      )
      //set initial state of show details view
      newState.displayQuantity = false
      newState.displayDetailCartView = true
      newState.displaySuccess = false
      newState.displayShowDetails = true
      newState.displayExternalShowDetails = false
      newState.displayShow = clickedShow
      newState.assignedParties = assignedPickupParties
      newState.displayShowList = false
      this.setState({
        displayQuantity: newState.displayQuantity,
        displayExternalShowDetails: newState.displayExternalShowDetails,
        displayDetailCartView: newState.displayDetailCartView,
        displaySuccess: newState.displaySuccess,
        displayShow: newState.displayShow,
        assignedParties: newState.assignedParties,
        displayShowList: newState.displayShowList
      })
      if (document.querySelector('#departureOption')) {
        document.querySelector('#departureOption').value = "Select a Departure Option..."
      }
    }
  }

  returnToShows = () => {
    const newState = { ...this.state }
    // console.log('return to shows');
    newState.displayShow = null
    newState.displaySuccess = false
    newState.displayShowList = true
    newState.displayShowDetails = false
    newState.displayCart = false
    this.setState({
      displayShow: newState.displayShow,
      displaySuccess: newState.displaySuccess,
      displayShowList: newState.displayShowList,
      displayShowDetails: newState.displayShowDetails,
      displayCart: newState.displayCart
    })
  }

  handleWarning = () => {
    const newState = { ...this.state }
    newState.displayWarning = true
    this.setState({ displayWarning: newState.displayWarning })
  }

  addToCart = async () => {
    const newState = { ...this.state }
  
    const pickupLocation = newState.pickupLocations.filter(location => parseInt(location.id) === parseInt(this.state.pickupLocationId))[0]
    const basePrice = Number(pickupLocation.basePrice)
    const ticketQuantity = parseInt(this.state.ticketQuantity)
    const totalSavings = parseInt(this.state.afterDiscountObj.totalSavings)
    const processingFee = Number((basePrice * ticketQuantity) * (0.1))
    const cost = ((basePrice * ticketQuantity) - totalSavings + processingFee)
    newState.totalCost = cost.toFixed(2)
    
    const sPickupId = parseInt(this.state.pickupLocationId)
    const sEventId = parseInt(this.state.displayShow.id)
    const pickupParty = this.state.assignedParties.find(party => party.pickupLocationId === sPickupId && party.eventId === sEventId)
    const firstBusLoad = pickupParty.firstBusLoadTime
    const lastDepartureTime = moment(pickupParty.lastBusDepartureTime, 'hhmm').format('h:mm')
    newState.cartToSend.eventId = null
    newState.cartToSend.pickupLocationId = null
    newState.cartToSend.firstName = ''
    newState.cartToSend.lastName = ''
    newState.cartToSend.email = ''
    newState.cartToSend.willCallFirstName = ''
    newState.cartToSend.willCallLastName = ''
    newState.cartToSend.ticketQuantity = 0
    newState.cartToSend.totalCost = 0
    newState.cartToSend.discountCode = null
    newState.cartToSend.userId = newState.facebook.userDetails.id
    newState.validatedElements = {
      firstName: null,
      lastName: null,
      email: null,
      phone: null,
      wcFirstName: null,
      wcLastName: null
    }

    this.setState({
      cartToSend: newState.cartToSend,
      validatedElements: newState.validatedElements
    })

    this.setState({ lastDepartureTime, firstBusLoad })

    if (newState.inCart.length === 0) {
      newState.inCart.push(newState.displayShow)
      newState.displaySuccess = true
      newState.displayCart = true
      newState.displayShowDetails = false
      newState.displayShowList = false
    }
    else {
      newState.displayWarning = true
    }
    newState.startTimer = true
    this.setState(newState)
    const pickupPartyId = parseInt(this.state.pickupPartyId)
    const ticketQty = parseInt(this.state.ticketQuantity)
    this.addTicketsInCart(pickupPartyId, ticketQty)
    window.addEventListener("beforeunload", this.clearCartOnClose);
  }

// functions to handle setting and clearing of timer and incart qtys

  ticketTimer = (condition) => {
    let newState = {...this.state}
    // console.log(newState.ticketTimer)
    if (condition) {
      const newTicketTimer = setTimeout(() => {
        this.confirmedRemove()
      }, 20000)
      newState.ticketTimer = newTicketTimer
      this.setState({ ticketTimer: newState.ticketTimer })
    }
    else if (!condition) {
      clearTimeout(this.state.ticketTimer)
      newState.ticketTimer = null
      this.setState({ ticketTimer: newState.ticketTimer })
    }
  }


  addTicketsInCart = (pickupPartyId, ticketQty) => {
    fetch(`${fetchUrl}/pickup_parties/${pickupPartyId}/cartQty`, {
      method: 'PATCH',
      body: JSON.stringify({
        inCart: ticketQty,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    this.ticketTimer(true)
  }

  clearTicketsInCart = (pickupPartyId, ticketQty) => {
    fetch(`${fetchUrl}/pickup_parties/${pickupPartyId}/cartQty`, {
      method: 'PATCH',
      body: JSON.stringify({
        inCart: parseInt(ticketQty) * -1,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    this.ticketTimer(false)
    return
  }

  clearCartOnClose = (ev) => { 
    const pickupPartyId = parseInt(this.state.pickupPartyId)
    const ticketQty = parseInt(this.state.ticketQuantity) 
    // ev.preventDefault();
    this.clearTicketsInCart(pickupPartyId, ticketQty)
    // return ev.returnValue = 'Leaving the page will clear your cart, continue?';
  }

  viewCart = () => {
    const newState = { ...this.state }
    newState.displayCart = true
    this.setState({ displayCart: newState.displayCart })
  }

  // Cart Functions
  handleCheck = () => {
    const newState = { ...this.state }
    newState.checked = true
    this.setState({ checked: newState.checked })
  }

  purchase = async (err) => {
    if (err) return this.setState({purchaseFailed: true})

    const cartObj = this.state.cartToSend
    cartObj.userId = this.state.facebook.userDetails.id
    // console.log('cartObj inside purchase.....', cartObj)
    const ordersResponse = await fetch(`${fetchUrl}/orders`, {
      method: 'POST',
      body: JSON.stringify(cartObj),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setState({ purchaseSuccessful: true, purchasePending: false, inCart: [] })
  }

  updatePurchaseField = event => {
    const newState = { ...this.state }
    const updateField = event.target.id
    const value = event.target.value
    const newValidElems = newState.validatedElements
    let discountCode = ''

    // regex to validate phone number, allowable formats are:
    // xxx-xxx-xxxx / xxx.xxx.xxxx / xxx xxx xxxx

    const phoneNumber = (inputtxt) => {
      var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
      if(inputtxt.match(phoneno)) return true
      else return false
    }

    // Checks fields via npm package validator
    switch (updateField){
      case 'email':
        if (Validator.isEmail(value) && !Validator.isEmpty(value)) {
          newValidElems.email = value
        }
        break;
      case 'firstName':
        if (Validator.isAlpha(value) && !Validator.isEmpty(value)) {
          newValidElems.firstName = value
        }
        break;
      case 'lastName':
        if (Validator.isAlpha(value) && !Validator.isEmpty(value)) {
          newValidElems.lastName = value
        }
        break;
      case 'willCallFirstName':
        if (Validator.isAlpha(value)) {
          newValidElems.wcFirstName = value
        }
        break;
      case 'willCallLastName':
        if (Validator.isAlpha(value)) {
          newValidElems.wcLastName = value
        }
        break;
      case 'phone':
        if (phoneNumber(value) && !Validator.isEmpty(value)) {
          newValidElems.phone = value
        }
        break;
      case 'discountCode':
        discountCode = value
        break;
      default:
        return 'Please input valid items';
    }

    this.setState({ validatedElements: newState.validatedElements })

    // Populates cartToSend
    if (this.state.validatedElements.firstName
      && this.state.validatedElements.lastName
      && this.state.validatedElements.email
      && this.state.validatedElements.phone) {

      const newCart = newState.cartToSend
      newState.validated = true

      newCart.firstName = this.state.validatedElements.firstName
      newCart.lastName = this.state.validatedElements.lastName
      newCart.email = this.state.validatedElements.email
      newCart.phone = this.state.validatedElements.phone
      newCart.eventId = this.state.cartToSend.eventId
      newCart.ticketQuantity = parseInt(this.state.ticketQuantity)
      newCart.pickupLocationId = parseInt(this.state.pickupLocationId)
      newCart.totalCost = Number(this.state.totalCost)
      newCart.discountCode = discountCode
      newCart.userId = newState.facebook.userDetails.userId

      this.state.validatedElements.wCFName ?
        newCart.willCallFirstName = this.state.validatedElements.wcFirstName
      :
        newCart.willCallFirstName = this.state.validatedElements.firstName
      

      this.state.validatedElements.wCLName ?
        newCart.willCallLastName = this.state.validatedElements.wcLastName
      :
        newCart.willCallLastName = this.state.validatedElements.lastName
      

      this.setState({ 
        cartToSend: newState.cartToSend,
        validated: newState.validated          
      })
      // this.setState({ validated: newState.validated })
    }
    else {
      console.log('Please continue to complete the form!')
    }
  }

  // toggleLoggedIn = (boolean) => {
  //   const newState = { ...this.state }
  //   newState.loggedIn = boolean
  //   if (boolean === false) {
  //     newState.myReservationsView = false
  //   }
  //   if (boolean === true && (newState.isStaff || newState.isDriver || newState.isAdmin)) {
  //     console.log('admin')
  //   }
  //   this.setState({ loggedIn: newState.loggedIn, myReservationsView: newState.myReservationsView })
  // }

  removeFromCart = () => {
    const newState = { ...this.state }
    newState.purchaseSuccessful = false
    newState.displayWarning = false
    newState.displayConfirmRemove = true

    this.setState({
      displayConfirmRemove: newState.displayConfirmRemove,
      displayWarning: newState.displayWarning,
      purchaseSuccessful: newState.purchaseSuccessful,
    })
    window.removeEventListener("beforeunload", this.clearCartOnClose)
  }

  confirmedRemove = () => {
    const newState = { ...this.state }
    
    const pickupPartyId = parseInt(newState.pickupPartyId)
    const ticketQty = parseInt(newState.ticketQuantity)
    this.clearTicketsInCart(pickupPartyId, ticketQty)

    newState.inCart = []
    newState.displaySuccess = false
    newState.displayConfirmRemove = false
    newState.displayWarning = false
    newState.displayQuantity = false
    newState.displayAddBtn = false
    newState.startTimer = false

    this.setState({
      inCart: newState.inCart,
      displaySuccess: newState.displaySuccess,
      displayConfirmRemove: newState.displayConfirmRemove,
      displayWarning: newState.displayWarning,
      displayQuantity: newState.displayQuantity,
      displayAddBtn: newState.displayAddBtn,
      startTimer: newState.startTimer
    })
    window.removeEventListener("beforeunload", this.clearCartOnClose)

  }

  closeAlert = () => {
    const newState = { ...this.state }
    newState.displayConfirmRemove = false
    newState.displayWarning = false
    this.setState({ displayConfirmRemove: newState.displayConfirmRemove, displayWarning: newState.displayWarning })
  }

  quantityChange = event => {
    const newState = { ...this.state }
    newState.ticketQuantity = event.target.value

    const pickupLocation = this.state.pickupLocations.filter(location => parseInt(location.id) === parseInt(this.state.pickupLocationId))[0]
    const basePrice = Number(pickupLocation.basePrice)
    const ticketQuantity = parseInt(newState.ticketQuantity)
    const processingFee = Number((basePrice * ticketQuantity) * (0.1))
    const cost = ((basePrice * ticketQuantity) + processingFee)
    newState.totalCost = cost.toFixed(2)
    this.setState({ ticketQuantity: newState.ticketQuantity, totalCost: newState.totalCost })
  }

  // addBorder = () => {
  //   const newState = { ...this.state }
  //   newState.displayBorder = true
  //   this.setState(newState)
  //
  //   setTimeout(() => {
  //     const newState = { ...this.state }
  //     newState.displayBorder = false
  //     this.setState(newState)
  //   }, 500)
  // }

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

  makePurchase = event => {
    const newState = { ...this.state }
    event.preventDefault()

    const wCF = document.querySelector('#willCallFirstName')
    const wCL = document.querySelector('#willCallLastName')

    if (newState.checked && (!wCF.value || !wCL.value)) {
      newState.cartToSend.willCallFirstName = newState.cartToSend.firstName
      newState.cartToSend.willCallLastName = newState.cartToSend.lastName
      this.setState({ cartToSend: newState.cartToSend })
    }
    //console.log('CTS', newState.cartToSend)

    newState.displayQuantity = false
    newState.displayAddBtn = false
    newState.purchasePending = true
    newState.purchaseFailed = false

    this.setState({
      purchaseFailed: newState.purchaseFailed,
      purchasePending: newState.purchasePending,
      displayQuantity: newState.displayQuantity,
      displayAddBtn: newState.displayAddBtn
    })
  }

  dismissBios = () => {
    this.setState({ showBios: false })
  }

  readBios = () => {
    this.setState({ displayBios: true })
  }

  hideAboutus = () => {
    this.setState({ displayAboutus: false })
  }

  showAboutus = () => {
    this.setState({ displayAboutus: true })
  }


  getEventbriteData = async (continuationString, val, previousFuelDataArr) => {
    // console.log('val 1', val )
    // console.log('get Eventbrite Data fired')
    // const response = await fetch(`https://www.eventbriteapi.com/v3/users/me/owned_events/?token=ZMYGPTW7S63LDOZCWVUM&order_by=start_desc&page=${val}&expand=ticket_classes${continuationString}`)
    const response = await fetch(`https://www.eventbriteapi.com/v3/users/me/owned_events/?${continuationString}token=ZMYGPTW7S63LDOZCWVUM&order_by=start_desc&expand=ticket_classes`)


    const fuelData = await response.json()
    const continuation = await fuelData.pagination.continuation
    const fuelDataArr = await fuelData.events
    const newFuelDataArr = await previousFuelDataArr.concat(fuelDataArr).flat()
    continuationString = await `continuation=${continuation}&`
    //let continuationString = ''
    if(fuelData.pagination.has_more_items && val <5 ){
      // console.log('val in if ', val)
      return await this.getEventbriteData(continuationString, val+=1, newFuelDataArr)
    } else {
      // console.log('seeingDoubleArr!!!', newFuelDataArr)
      return newFuelDataArr
    }
  }

  toggleAdminView = () => {
    let adminView = this.state.adminView
    adminView = !adminView
    this.setState({ adminView })
  }

  getHeadliners = async () => {
    const eventsArr = await this.getEventbriteData('', 1, [])

    .then((eventsArr)=> {
      // console.log('chicken')
      //console.log('eventsArr', eventsArr)
    let newEventsArr = []
    for(let ii = 0; ii < eventsArr.length; ii++){
      // console.log('monkey')
      newEventsArr[ii] = {}
      let ticketClasses = []
      ticketClasses = eventsArr[ii].ticket_classes
      //console.log('ticketClasses', ticketClasses)

        let eventTotal = 0
        let departures = {}
        if (ticketClasses){
          for(let jj = 0; jj < ticketClasses.length; jj++){
            // console.log('zebra')
            eventTotal += ticketClasses[jj].quantity_sold
            departures[ticketClasses[jj].name] = ticketClasses[jj].quantity_sold
          }
        }
      newEventsArr[ii].headliner = eventsArr[ii].name.text.substring((0), eventsArr[ii].name.text.indexOf("*")-1)
      newEventsArr[ii].date = eventsArr[ii].start.local.substring(0, 10)
      newEventsArr[ii].venue =  eventsArr[ii].name.text.substring((eventsArr[ii].name.text.lastIndexOf("*")+5), eventsArr[ii].name.text.lastIndexOf("(")-1)
      newEventsArr[ii].totalSales = eventTotal
      newEventsArr[ii].departures = departures
    }
    // console.log('headlinersArr', newEventsArr)
    const newState = { ...this.state }
    newState.oldStuff = newEventsArr
    this.setState({oldStuff: newState.oldStuff})
    return newEventsArr
  })
  }

  postOldData = async () => {
    const newEventsArr = this.state.oldStuff
    // console.log('inSide post old data function', newEventsArr)
    // const response = await fetch('https://localhost:3000/fuel', {
    //   method: 'POST',
    //   body: JSON.stringify(newEventsArr),
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // })
    // console.log('post old data response', response)
  }

  toggleAdminView = () => {
    let adminView = this.state.adminView
    adminView = !adminView
    this.setState({ adminView })
  }
  render() {
    return (

      <React.Fragment>
        <div className="App">
          {/* Desktop View */}
          <MediaQuery minWidth={8}>
            {this.state.displayLoadingScreen && !this.state.facebook.isLoggedIn ?
              <Loading
                onLoad={this.onLoad}
                handleBus={this.handleBus} />
                :
              <div>
              <Header
                getReservations={this.getReservations}
                googleResponse={this.state.googleResponse}
                facebook={this.state.facebook}
                profileClick={this.profileClick}
                logout={this.logout}
                spotifyResponse={this.state.spotifyResponse}
                userDashboard={this.userDashboard}
                adminView={this.state.adminView}
                />

                {this.state.adminView ?
                  <AdminView
                    pickupLocations={this.state.pickupLocations}
                    // pickupParties={this.state.pickupParties}
                    searchShows={this.searchShows}
                    shows={this.state.shows}
                    showsExpandClick={this.showsExpandClick}
                    userDetails={this.state.facebook.userDetails}
                  />
                  :
                  this.state.displayLoginView ?
                  <LoginView
                  displayReservationDetail={this.state.displayReservationDetail}
                  displayReservations={this.state.displayReservations}
                  responseGoogle={this.responseGoogle}
                  responseSpotify={this.responseSpotify}
                  toggleLoggedIn={this.toggleLoggedIn}
                  userDetails={this.state.userDetails}
                  profileClick={this.profileClick}
                  toggleReservationView={this.toggleReservationView}
                  userReservations={this.state.userReservations}
                  addBorder={this.addBorder}
                  displayShow={this.state.displayShow}
                  filterString={this.state.filterString}
                  showsExpandClick={this.showsExpandClick}
                  responseFacebook={this.responseFacebook}
                  continueAsGuest={this.continueAsGuest}
                  facebook={this.state.facebook}
                  toggleAdminView={this.toggleAdminView}
                  expandReservationDetailsClick={this.expandReservationDetailsClick}
                  reservationDetail={this.state.reservationDetail}
                  toggleFuturePast={this.toggleFuturePast}
                  displayFuture={this.state.displayFuture}
                  displayPast={this.state.displayPast}
                  getEventDetails={this.getEventDetails}
                  displayUserReservationSummary={this.state.displayUserReservationSummary}
                  toggleEditReservation={this.toggleEditReservation}
                  displayEditReservation={this.state.displayEditReservation}
                  reservationEditField={this.reservationEditField}
                  submitReservationForm={this.submitReservationForm}
                  reservationToEditId={this.state.reservationToEditId}
                  displayEditSuccess={this.state.displayEditSuccess}
                  toggleEditSuccess={this.toggleEditSuccess}
                />
                  :
                  this.state.displayAboutus ?
                  <Aboutus
                    dismissBios={this.dismissBios}
                    readBios={this.readBios}
                    displayBios={this.state.displayBios}
                    hideAboutus={this.hideAboutus}
                  />
                  :
                  this.state.shows ?
                    <React.Fragment>
                      <div className='content-section pt-4'>
                        <div className='col-md-6 float-right'>
                        {this.state.displayShow ? '' :
                          <BannerRotator displayShow={this.state.displayShow} />}
                        {this.state.displayCart || this.state.displayShow || this.state.displayExternalShowDetails ?
                          <div>
                          <DetailCartView
                            afterDiscountObj={this.state.afterDiscountObj}
                            assignedParties={this.state.assignedParties}
                            backToCalendar={this.backToCalendar}
                            closeAlert={this.closeAlert}
                            addToCart={this.addToCart}
                            checked={this.state.checked}
                            confirmedRemove={this.confirmedRemove}
                            cartToSend={this.state.cartToSend}
                            displayAddBtn={this.state.displayAddBtn}
                            displayBorder={this.state.displayBorder}
                            displayCart={this.state.displayCart}
                            displayConfirmRemove={this.state.displayConfirmRemove}
                            displayExternalShowDetails={this.state.displayExternalShowDetails}
                            displayQuantity={this.state.displayQuantity}
                            displayShow={this.state.displayShow}
                            displaySuccess={this.state.displaySuccess}
                            displayViewCartBtn={this.state.displayViewCartBtn}
                            displayWarning={this.state.displayWarning}
                            filterString={this.state.filterString}
                            findDiscountCode={this.findDiscountCode}
                            firstBusLoad={this.state.firstBusLoad}
                            getPickupParty={this.getPickupParty}
                            handleCheck={this.handleCheck}
                            handleSubmit={this.handleSubmit}
                            inCart={this.state.inCart}
                            lastDepartureTime={this.state.lastDepartureTime}
                            makePurchase={this.makePurchase}
                            pickupLocations={this.state.pickupLocations}
                            pickupLocationId={this.state.pickupLocationId}
                            pickupPartyId={this.state.pickupPartyId}
                            pickupParties={this.state.pickupParties}
                            purchase={this.purchase}
                            purchaseClick={this.purchaseClick}
                            purchaseFailed={this.state.purchaseFailed}
                            purchasePending={this.state.purchasePending}
                            purchaseSuccessful={this.state.purchaseSuccessful}
                            quantityChange={this.quantityChange}
                            removeFromCart={this.removeFromCart}
                            returnToShows={this.returnToShows}
                            selectPickupLocationId={this.selectPickupLocationId}
                            selectTicketQuantity={this.selectTicketQuantity}
                            shows={this.state.shows}
                            showsExpandClick={this.showsExpandClick}
                            showsInCart={this.state.inCart}
                            startTimer={this.state.startTimer}
                            tabClicked={this.tabClicked}
                            ticketsAvailable={this.state.ticketsAvailable}
                            ticketQuantity={this.state.ticketQuantity}
                            timeLeftInCart={this.state.timeLeftInCart}
                            totalCost={this.state.totalCost}
                            updateDiscountCode={this.updateDiscountCode}
                            updatePurchaseField={this.updatePurchaseField}
                            validated={this.state.validated}
                            validatedElements={this.state.validatedElements}
                          />
                          </div>
                          :
                          <SponsorBox
                            showAboutus={this.showAboutus}
                            displayAboutus={this.state.displayAboutus}
                          />}
                      </div>
                        <MediaQuery maxWidth={799}>
                        <div className='col-md-6 float-left'>
                        {this.state.displayExternalShowDetails || this.state.displayDetailCartView ?
                          ""
                        :
                        <ShowList
                          addBorder={this.addBorder}
                          displayShow={this.state.displayShow}
                          filterString={this.state.filterString}
                          handleWarning={this.handleWarning}
                          inCart={this.state.inCart}
                          searchShows={this.searchShows}
                          shows={this.state.shows}
                          showsExpandClick={this.showsExpandClick}
                          sortByArtist={this.sortByArtist}
                          sortByDate={this.sortByDate}
                          sortedByArtist={this.state.artistIcon}
                          sortedByDate={this.state.dateIcon}
                          tabClicked={this.tabClicked}
                          ticketsAvailable={this.state.ticketsAvailable} />
                      }
                        </div>
                      </MediaQuery>
                      <MediaQuery minWidth={800}>
                        <ShowList
                          addBorder={this.addBorder}
                          displayShow={this.state.displayShow}
                          filterString={this.state.filterString}
                          handleWarning={this.handleWarning}
                          inCart={this.state.inCart}
                          searchShows={this.searchShows}
                          shows={this.state.shows}
                          showsExpandClick={this.showsExpandClick}
                          sortByArtist={this.sortByArtist}
                          sortByDate={this.sortByDate}
                          sortedByArtist={this.state.artistIcon}
                          sortedByDate={this.state.dateIcon}
                          tabClicked={this.tabClicked}
                          ticketsAvailable={this.state.ticketsAvailable} />
                      </MediaQuery>

                    </div>
                  </React.Fragment>
                  :
                <Loading
                  responseFacebook={this.responseFacebook}
                />
              }
            </div>
            }
          </MediaQuery>
        </div>
      </React.Fragment>
    )
  }
}

export default App;
