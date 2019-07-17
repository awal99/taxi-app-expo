
import firebase from '../../utils/firebase';



async function calculateFare(ride, time,distance){

    if(ride == 'single'){
        let basefare = 0;
        let perminute = 0;
        let wifi = 0;
        let fare = [];

        let ref = "";
        if(time <= 20){
            ref="single125";
        }
        if(time > 20 && time <= 40){
            ref="single2040";
        }
        if(time >40 && time <= 60){
            ref="single4060";
        }
        if(time > 60){
            ref="single4060";
        }
            try{
            await firebase.database().ref('prices/'+ref).once("value").then(snapshot=>{
            var result = snapshot.val();
            basefare = result.basefare;
            perminute = result.perminute;
            booking = result.bookingfee;
            wifi = result.wifi;
            var totalTimeFare = perminute*time;
            let totalEstimated = basefare+wifi+totalTimeFare+booking;
            //console.log(totalEstimated);
            fare.push(totalEstimated)
            // return totalEstimated;
            })
            return fare;
        }catch(e){
            console.log(e)
        }
            
    }

    if(ride == 'shared'){
        //console.log('shared');
        let basefare = 0;
        let perminute = 0;
        let booking = 0;
        let wifi = 0;
        let fare = []; 

        let ref = "";
        if(time <= 20){
            ref="shared120";
        }
        if(time >40 && time <= 60){
            ref="shared2060";
        }
        if(time > 60){
            ref="shared2060";
        }
        
        try{
            await firebase.database().ref('prices/'+ref).once("value").then(snapshot=>{
            var result = snapshot.val();
            basefare = result.basefare;
            perminute = result.perminute;
            booking = result.bookingfee;
            wifi = result.wifi;
            var totalTimeFare = perminute*time;
            let totalEstimated = basefare+wifi+totalTimeFare+booking;
            //console.log(totalEstimated);
            fare.push(totalEstimated)
            // return totalEstimated;
            })
            return fare;
        }catch(e){
            console.log(e)
        }
            
    }
    if(ride == 'booksingle'){
        //console.log('shared');
        let basefare = 0;
        let permile = 0;
        let wifi = 0;
        let bookfee = 0;
        let fare = [];
        
            firebase.database().ref('prices/single2040').once("value").then(snapshot=>{
            var result = snapshot.val();
            basefare = result.basefare;
            permile = result.permile;
            bookfee = result.bookingfee;
            wifi = result.wifi;
            //console.log(distance);
            var totalMileFare = permile*(distance*0.000621371);
            let totalEstimated = bookfee+basefare+wifi+totalMileFare;
           // console.log(totalEstimated);
            fare.push(totalEstimated)
            }) 
            return fare;
    }

    if(ride == 'bookshared'){
        //console.log('shared');
        let basefare = 0;
        let perminute = 0;
        let wifi = 0;
        let fare = []; 
        
            firebase.database().ref('prices/shared120').once("value").then(snapshot=>{
            var result = snapshot.val();
            basefare = result.basefare;
            perminute = result.perminute;
            wifi = result.wifi;
            //console.log(distance);
            var totalMileFare = perminute*10;
            let totalEstimated = basefare+wifi+totalMileFare;
           // console.log(totalEstimated);
            fare.push(totalEstimated)
            })
            return fare;
    }

};

export default calculateFare;