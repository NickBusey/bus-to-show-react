import React from 'react'
import '../../App.css';
import UserCheckin from './userCheckin'
import PickupsList from './PickupsList';
import ReservationsList from './ReservationsList';
import AdminEdit from './Edit/AdminEdit'


class AdminView extends React.Component {
  //child of App.js

  state = {
    displayEditEvent: false,
    displayUserCheckin: false,
    displayList: 'ShowList',
    allFutureShowsEvenHidden: null,
    eventId: null,
    filterString: '',
    pickupLocationId: null,
    pickupLocations: null,
    pickupParties: null,
    reservations: [],
    thisShow: null,
    thisPickup: null,
    theseParties: [],
    theseLocations: []

  }
  // { shows, pickupLocations, pickupParties, searchItems, userDetails } = this.props

  async componentDidMount(){
    console.log('pickupLocations on Mount', this.props.pickupLocations)
    console.log('PICKUPPARTIES on Mount', this.props.pickupParties)
    const response = await fetch(`https://bts-test-backend.herokuapp.com/events/`)
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
    const futureShows = allShows.filter(dateCheck)

    this.setState({ allFutureShowsEvenHidden: futureShows })

    const sortedFutureShows = this.state.allFutureShowsEvenHidden.sort((show1, show2) => {
      const a = new Date(show1.date)
      const b = new Date(show2.date)
      return a - b
    })

    this.setState({
      allFutureShowsEvenHidden: sortedFutureShows,
      pickupLocations: this.props.pickupLocations,
      pickupParties: this.props.pickupParties
    })
  }

  searchItems = event => {
    const newState = { ...this.state }
    newState.filterString = event.target.value
    this.setState({ filterString: newState.filterString })
  }

  toggleProperty = async (property) => {
    let newState = {...this.state}
    newState.filterString = ''
    console.log('property inside toggleProperty', property)
    if (property === 'displayUserCheckin') {
    newState.displayUserCheckin = !newState.displayUserCheckin
    newState.displayList = 'ShowList'
    await this.setState(newState)}
    else if (property === 'displayAdminPanel'){
      newState.displayList = 'EditShowList'
      newState.displayAdminPanel = true
      await this.setState(newState)
    }
    else if (property === 'EditShow'){
      newState.displayList = 'EditShowPanel'
      await this.setState(newState)
    }
    else {
      newState.displayList = property
      await this.setState(newState)
    }
  }

  makeSelection = async (target, targetId, next) => {
    console.log('next inside makeSelection::: ', next, 'targetId', targetId)
    this.setState({filterString: ''})
    let newState = {...this.state}
    newState[target] = targetId
    newState.filterString = ''
    await this.setState(newState)
    this.toggleProperty(next)
    if (next === 'PickupsList') {
      //targetId === eventId
      this.findShow(targetId)
      this.findParties(targetId)
    }
    else if (next === 'ReservationsList') {
      this.getReservations()
      this.findPickup(targetId)
      this.refreshReservations()
    }
    else if (next === 'EditShow'){
      this.getEventToEdit(targetId)
      this.findParties(targetId)
    }
  }

  getEventToEdit = async (targetId) => {
    let thisShow = this.state.allFutureShowsEvenHidden.filter(show=>{
      if (show.id === targetId) return show
      else return null
    })[0]
    this.setState({thisShow})
    console.log('this.state.thisShow' , this.state.thisShow)
  }

  getReservations = async () => {
    console.log('getting reservations');
    await fetch(`https://bts-test-backend.herokuapp.com/pickup_parties/findId`, {
      method: 'PATCH',
      body: JSON.stringify({
        pickupLocationId: this.state.pickupLocationId,
        eventId: this.state.eventId,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(async (response) =>  {
      const thisPickupParty = await response.json()
      const findReservations = await fetch(`https://bts-test-backend.herokuapp.com/reservations/findOrders`, {
        method: 'PATCH',
        body: JSON.stringify({
          pickupPartiesId: thisPickupParty.id,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const reservations = await findReservations.json()
      this.setState({
        reservations,
        thisCapacity: thisPickupParty.capacity})
    })
  }

  refreshReservations = (stop) => {
    if (!stop) {
      console.log('getting')
      let x = 0;
      const reservationsInterval = setInterval(()=>{
        this.getReservations()
        if (++x === 40) {
          console.log('clear')
          clearInterval(reservationsInterval)
        }
      }, 30000)
      this.setState({reservationsInterval})
    }
    else if (stop && this.state.reservationsInterval) {
      console.log('stopping')
      clearInterval(this.state.reservationsInterval)
    }

  }

  toggleCheckedIn = async (isCheckedIn, reservation) => {
    let newStatus = isCheckedIn ? 2 : 1
    await fetch(`https://bts-test-backend.herokuapp.com/reservations/${reservation.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
    })
    this.getReservations()
  }

  findShow = (targetId) => {
    let thisShow = this.props.shows.filter(show=>{
      if (show.id === targetId) return show
      else return null
    })[0]
    this.setState({thisShow})
  }

  findParties = (targetId) => {
    this.setState({
      theseParties: [],
      theseLocations: []
    })
    const newState = { ...this.state }
    //find and set to state the parties that match the event Id
    newState.theseParties = this.props.pickupParties.filter(party =>party.eventId === targetId )

    this.setState({
      theseParties: newState.theseParties
    })
    //find and set to state the pickup Location Object for ONLY the locations that correspond to this Event (aka theseParties).
    this.state.pickupLocations.forEach(location =>{
      newState.theseParties.forEach(party =>{
        if(location.id === party.pickupLocationId){
          newState.theseLocations.push(location)
        }
      })
    })

    this.setState({
      theseLocations: newState.theseLocations
    })
  }


  findPickup = (targetId) => {
    let thisPickup = this.props.pickupParties.filter(pickup=>{
      if (pickup.pickupLocationId === targetId) return pickup
      else return null
    })[0]
    this.setState({thisPickup})
  }

  render (){
    let { isStaff, isAdmin, isDriver } = this.props.userDetails

    return(
      <div className="container AdminView" style={{ Height: '100%' }}>
       {this.state.displayAdminPanel || this.state.displayUserCheckin
        ?
         <div>
            {this.state.displayAdminPanel ?
              <AdminEdit
                eventId={this.state.eventId}
                filterString={this.state.filterString}
                getReservations={this.getReservations}
                displayList={this.state.displayList}
                displayUserCheckin={this.state.displayUserCheckin}
                pickupLocations={this.state.pickupLocations}
                pickupLocationId={this.state.pickupLocationId}
                pickupParties={this.state.pickupParties}
                makeSelection={this.makeSelection}
                reservations={this.state.reservations}
                searchItems={this.searchItems}
                shows={this.state.allFutureShowsEvenHidden}
                stopRefreshing={this.refreshReservations}
                thisShow={this.state.thisShow}
                thisPickup={this.state.thisPickup}
                theseParties={this.state.theseParties}
                theseLocations={this.state.theseLocations}
                thisCapacity={this.state.thisCapacity}
                toggleCheckedIn={this.toggleCheckedIn}
                toggleProperty={this.toggleProperty}
              />
              : ''
            }
            {this.state.displayUserCheckin ?
              <UserCheckin
                eventId={this.state.eventId}
                filterString={this.state.filterString}
                getReservations={this.getReservations}
                displayList={this.state.displayList}
                displayUserCheckin={this.state.displayUserCheckin}
                pickupLocations={this.state.pickupLocations}
                pickupLocationId={this.state.pickupLocationId}
                pickupParties={this.state.pickupParties}
                makeSelection={this.makeSelection}
                reservations={this.state.reservations}
                searchItems={this.searchItems}
                shows={this.props.shows}
                stopRefreshing={this.refreshReservations}
                thisShow={this.state.thisShow}
                thisPickup={this.state.thisPickup}
                theseParties={this.state.theseParties}
                theseLocations={this.state.theseLocations}
                thisCapacity={this.state.thisCapacity}
                toggleCheckedIn={this.toggleCheckedIn}
                toggleProperty={this.toggleProperty}
              />
              : ''
            }
        </div>
      :
          <div className="col mt-2 adminButtons">
            {isAdmin ?
              <button type="button" className="btn bts-orange-bg btn-lg btn-block my-4" onClick={e=>this.toggleProperty('displayAdminPanel')}>Admin Panel</button>
            : ''}
            {isDriver ?
              <button type="button" className="btn bts-orange-bg btn-lg btn-block my-4" onClick={e=>console.log('also click')}>Driver Shifts</button>
            : ''}
            {isStaff ?
              <button type="button" className="btn bts-orange-bg btn-lg btn-block my-4" onClick={e=>this.toggleProperty('displayUserCheckin')}>Rider Check-In</button>
            : ''}
          </div>
      }
      </div>
    )
  }
}

export default AdminView
