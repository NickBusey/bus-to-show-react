import React from 'react'
import '../../App.css';
import moment from 'moment'
// import MediaQuery from 'react-responsive';
import logo from '../../Images/Logos/bts-logo-gray.png'


const ShowReservation = (props) => {

  console.log('props.userReservations in ShowReservation', props.userReservations)

  const createArrayOfDates = props.userReservations.map(show => show.date ).sort()
  console.log('createArrayOfDates', createArrayOfDates)

  let qtyArr = []
  let countObj = {}
  for(let ii = 0; ii < createArrayOfDates.length; ii++){
    let count = 1;
    for(let jj = 0; jj < createArrayOfDates.length; jj++){
        if(createArrayOfDates[ii] == createArrayOfDates[jj])
            countObj[createArrayOfDates[ii]] = count++;
        }
      qtyArr.push(countObj)
    }
    console.log('qtyArr', qtyArr)


  //const ticketQty = (props.userReservations, value) => props.userReservations.filter((show) => show.date === value).length

  // const reservationsByEvent = props.userReservations.map((accum, i, arr) =>{
  //   let monkey = 0
  //   arr.map(show=>{
  //     if(show.date == arr[i].date){
  //       monkey += 1
  //     }
  //     return monkey
  //   })
  //   console.log('here is what i is:', i)
  //   console.log('here is what arr is', arr)
  //   console.log('here is what arr[i].date is', arr[i].date)
  //   //console.log('here is what show.date is', show.date)
  //
  //   console.log('accumulator for monkey', monkey)
  //
  //
  // })
//
//     city: "Denver"
// date: "04/13/2019"
// firstBusLoadTime: null
// headliner: "Flatbush Zombies"
// headlinerBio: "Flatbush Zombies is a hip-hop group consisting of Meechy Darko, Zombie Juice, and producer/rapper Erick Arc Elliott. They are located in the Brooklyn neighborhood of Flatbush in New York City. They have released two mixtapes titled "D.R.U.G.S". and "BetterOffDEAD" as well as several music videos.↵ <a href="https://www.last.fm/music/Flatbush+ZOMBiES">Read more on Last.fm</a>. User-contributed text is available under the Creative Commons By-SA License; additional terms may apply."
// headlinerImgLink: "https://lastfm-img2.akamaized.net/i/u/174s/5be80317bab524a3af11c21e3196f2c6.png"
// lastBusDepartureTime: "16:00"
// locationName: "Denver - DU Illegal Pete's"
// orderId: 82
// orderedByEmail: "larry@curb.com"
// orderedByFirstName: "Larry"
// orderedByLastName: "David"
// status: 1
// streetAddress: "1744 E Evans Ave, Denver, CO"
// support1: "Joey Bada$$"
// support2: "The Underachievers"
// support3: "Kirk Knight"
// userId: 8
// venue: "Red Rocks Amphitheatre"
// willCallFirstName: "Larry"
// willCallLastName: "David"
//   }


  //get Ticket Quantity for Each Pickup Party

  return (
    <div>
      {!props.userReservations.length > 0 ? ''
      : props.userReservations.map(show =>
        <li className="px-4 py-2 list-item" key={show.id} id={show.id}>
          <div className="row border-top border-left border-right border-secondary bg-light p-2" id={show.id}>
            <div className="col-lg-12 cart-item-font pl-0">{props.ticketQuantity} Roundtrip Bus Spot(s) on {moment(show.date, "MM-DD-YYYY").format("dddd")}, {show.date}
            </div>
            <div className="col-lg-12 cart-item-font" id={show.id}>
              <div className="row">For: {show.headliner} at {show.venue.split(' Amphitheatre')[0]}
              </div>
              <div className="row" id={show.id}>Departing From: {show.locationName} <br />{show.streetAddress}
              </div>
            </div>

          </div>
          <div className="row border-left border-right border-bottom border-secondary bg-light">
            {show.firstBusLoadTime ?
            <div className="col-lg-12 cart-item-font pl-0">
             {`First bus loads around: ${show.firstBusLoadTime}`}
            </div>
            : ''}
            <div className="col-lg-12 cart-item-font red-text pl-0 mt-1">
              Last bus departs at: {show.lastBusDepartureTime}
            </div>
          </div>

        </li>)

    }
</div>


    // <div className='Shows container'>
    //
    //     {props.userReservations.length > 0 ? props.userReservations.map(show =>
    //       <div className="list-group-item highlightOnHover show-list-item" key={show.id} id={show.orderId}>
    //         <div className="row" id={show.orderId}>
    //         <div className="col-md-12 list-item-font" id={show.orderId}>1 Tix For: {show.willCallFirstName} {show.willCallLastName}</div>
    //           <div className="col-md-12 list-item-font" id={show.orderId}>On: {moment(show.date, "MM-DD-YYYY").format("dddd")} <strong>{show.date}</strong>
    //           </div>
    //           <div className="col-md-12 list-item-font" id={show.orderId}>
    //             Event: <strong>{show.headliner}</strong> <br />
    //             Venue: {show.venue}
    //           </div>
    //           <div className="col-md-12 list-item-font" id={show.orderId}>Departing From: {show.locationName} by: {show.lastBusDepartureTime}</div>
    //
    //         </div>
    //         </div>
    //       ) :
    //       <li className="list-group-item ">
    //         <div className="row justify-content-center" style={{ textAlign: "center" }}>
    //           <div className="col-12 ">
    //             <h5 className='black-text'>No reservations for this user.</h5>
    //             <img
    //               className='nothing-in-cart-image'
    //               src={logo}
    //               alt="bts-logo"
    //               width="50" />
    //           </div>
    //         </div>
    //       </li>}
    //
    // </div>
  )
}

export default ShowReservation;
