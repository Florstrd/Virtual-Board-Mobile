WS_TOKEN = localStorage.getItem('jwt');
const socket = new WebSocket(`ws://localhost:5000?token=${WS_TOKEN}`);
    
    
socket.onopen = function (event) {
    console.log('Connected to WebSocket server');
};

socket.onmessage = function (event) {
    console.log('Received message:', event.data);
    const data = JSON.parse(event.data);
    if (data.status == 0) {
        document.querySelector('#out').innerHTML = data.msg;
        document.querySelector('#err').innerHTML = '';
    } else {
        document.querySelector('#err').innerHTML = data.msg;
    }
    
};

socket.onclose = function (event) {
    console.log('Connection closed');
};

document.querySelector('#in').addEventListener('input', (evt) => {
    socket.send(evt.target.value);
});