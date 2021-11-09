'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var videoContainer = document.getElementsByClassName('video-container')[0];
var searchButton = document.getElementById('searchButton');
var searchBar = document.getElementById('searchBar');
var videoPlayer = document.querySelector('.video-js');


var stompClient = null;
var username = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();
    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');


        var socket = new SockJS('/websocket');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
    document.body.style.background = "black";
}

searchButton.onclick = function()
{  
    var vid =  videojs(videoPlayer);
    vid.src({
        src: searchBar.value,
        type: 'video/mp4'
      });
     
    videoContainer.classList.remove('hidden');
    
    
    

};

function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);


    // Tell your username to the server
    stompClient.send("/app/chat.register",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');

}


function onError(error) {
    connectingElement.textContent = 'It was not possible to connect! Try again.';
    connectingElement.style.color = 'red';
}


function send(event) {
    var messageContent = messageInput.value.trim();

    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function onStop(){
    var vid =  videojs(videoPlayer);
    console.log(vid.currentTime())
    var chatMessage = {
        sender: username,
        content: vid.currentTime(),
        type: 'PAUSE',
        timeStamp: vid.currentTime()
    }

            stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
            messageInput.value = '';
}

function onPlay(){
    var vid =  videojs(videoPlayer);
    console.log(videoContainer.currentTime)
    var chatMessage = {
        sender: username,
        content: vid.currentTime(),
        type: 'PLAY',
        timeStamp: vid.currentTime()
    }

            stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
            messageInput.value = '';
}



function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var vid =  videojs(videoPlayer);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    }
    else if(message.type === 'CHAT') {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);


    }
    if(message.type === 'PLAY' || message.type === 'PAUSE'){
    }else{
    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
    }
            if(message.type === 'PLAY' && vid.paused()){
                vid.currentTime(message.timeStamp);
                playVid();
            }else if(message.type === 'PAUSE' && !vid.paused()){
                vid.currentTime(message.timeStamp);
                pauseVid();
            }
}

function playVid() {
    var vid =  videojs(videoPlayer);
    vid.play();
    console.log("video played!")
}

function pauseVid() {
    var vid =  videojs(videoPlayer);
    vid.pause();
    console.log("video paused!")

}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', send, true)