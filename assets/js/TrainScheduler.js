'use strict';

const config = {
    apiKey: "AIzaSyDXKUqp98KcPEz9mZ73yN-JeVt9tKhIy3Y",
    authDomain: "bootcampfb-540310.firebaseapp.com",
    databaseURL: "https://bootcampfb-540310.firebaseio.com",
    projectId: "bootcampfb-540310",
    storageBucket: "bootcampfb-540310.appspot.com",
    messagingSenderId: "802837114116"
};

firebase.initializeApp(config);
const trainRef = firebase.database().ref('TrainSchedule');

var tbodyTrains;
var formDiv = {};
var submitBtn;
var myModal;

trainRef.orderByChild('dateAdded').on("child_added",
    function(snap) {
        const trainData = snap.val();
        const timeNow = moment();
        var nextArrival;
        var minutesAway;
        //console.log(trainData);
        var diffTime= timeNow.diff(moment(trainData.firsttime,"HH:mm"),"minutes");

        if (diffTime < 0) {
            diffTime += 24 * 60;
        }
        minutesAway = trainData.frequency-(diffTime%trainData.frequency);
        nextArrival = moment(timeNow).add(minutesAway,"minutes").format("HH:mm");

        tbodyTrains.append(
            $('<tr>').addClass('well')
            .append($('<td>').text(trainData.name))
            .append($('<td>').text(trainData.destination))
            .append($('<td>').text(trainData.frequency))
            .append($('<td>').text(trainData.firsttime))
            .append($('<td>').text(nextArrival))
            .append($('<td>').text(minutesAway))

        );
    },
    function(err) {
        console.log("Error: ", err.code);
    }
);

function scrubWhiteSpace(S){
    return S.trim().replace(/\s+/g, ' ')
}

function toUpperLower(S) {
    return S.substr(0, 1).toUpperCase() + S.substr(1).toLowerCase();
}

function prettifyName(S) {
    return S.split(' ').map(toUpperLower).join(' ');
}

function splitIntOnColon(S){
    return S.split(':').map(X=>parseInt(X));
}

function padLeft(S,L,P){
    S=S.toString();
    if( S.length >= L){
        return S;
    }
    return P.toString().repeat(L-S.length)+S;
}

function toHHMM(A){
    return A.map(I=>padLeft(I,2,'0')).join(':');
}

function checkHHMM(T){
    if( /^\d+\s*:\s*\d+$/.exec(T)==null ) {
        return '';
    }

    let HHMM=splitIntOnColon(T);
    if( HHMM[0] > 24 || HHMM[1] > 60 ){
        return '';
    }

    return toHHMM(HHMM);
}

$('#main-form').on('submit', function(event) {
    event.preventDefault();
    var errorMsg;
    let trainData = {};

    for (let index in formDiv) {
        let trainDataItem = scrubWhiteSpace(formDiv[index].val());

        if( trainDataItem == '' ) {
            switch(index){
            case 'name':
                errorMsg='Train Name';
                break;
            case 'firsttime':
                errorMsg='First Train Time'
                break;
            default:
                errorMsg=toUpperLower(index);
                break;
            }
            
            errorMsg=`<strong>${errorMsg}</strong> may not be empty.<br>Please correct and resubmit`;
            $("#input-error").html(errorMsg);
            myModal.modal();
            return;
        }

        switch(index){
        case 'name':
        case 'destination':
            trainDataItem = prettifyName(trainDataItem);
            break;
        case 'firsttime':
            trainDataItem=checkHHMM(trainDataItem);
            if( trainDataItem == '') {
                errorMsg="<strong>First Train Time</strong> is not correctly formatted.<br>Please correct and resubmit";
                $("#input-error").html(errorMsg);
                myModal.modal();
                return;
            }
            if( trainDataItem.length!=5 ){
                trainDataItem='0'+trainDataItem;
            }
            break;
        case 'frequency':
            if( trainDataItem <= 0){
                errorMsg="<strong>Frequency</strong> must be greater than 0.<br>Please correct and resubmit";
                $("#input-error").html(errorMsg);
                myModal.modal();
                return;
            }
        }

        trainData[index]=trainDataItem;
    }

    //console.log(trainData);

    trainData.addedDate = firebase.database.ServerValue.TIMESTAMP;
    trainRef.push(trainData);
});

$(document).ready(function() {
    formDiv = {
        name: $('#train-name'),
        destination: $('#train-destination'),
        firsttime: $('#train-firsttime'),
        frequency: $('#train-frequency')
    };
    submitBtn = $('#main-form');
    tbodyTrains = $("#tbodyTrains")
    myModal=$("#myModal");
})