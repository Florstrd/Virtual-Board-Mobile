async function logIn(user, password) {
    const response = await fetch("https://virtual-board-v1-dennis.azurewebsites.net/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: user,
            password: password
        })
    });
    const respData = await response.json();
            console.log(respData);
            
            if (respData.jwt) {
                localStorage.setItem("jwt", respData.jwt);
                console.log("Logged in");
                getBoards();
                document.getElementById("login-div").style.display = "none";
                document.getElementById("boards-div").style.display = "block";
                document.getElementById("login-fail").style.display = "none";
                document.getElementById("login-success").style.display = "block";
            } else {
                document.getElementById("login-fail").style.display = "block";
            }
            
}

async function saveNote(noteId, note, style) {
    const jwt = localStorage.getItem("jwt");
    const boardId = localStorage.getItem("boardId");
    try {
        console.log(jwt);
        console.log(boardId);
        const response = await fetch(`https://virtual-board-v1-dennis.azurewebsites.net/notes/${noteId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}` },
            body: JSON.stringify({
                boardId: boardId,
                note: note,
                style: style
            })
        });
        const respData = await response.json();
        console.log(respData);
        if (respData.msg === "Note edited!") {
            document.getElementById("note-saved").style.display = "block";
            setTimeout(closePopup, 2000);
        }
    } catch (error) {
        const response = await fetch("https://virtual-board-v1-dennis.azurewebsites.net/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}` },
            body: JSON.stringify({
                boardId: boardId,
                note: note,
                style: style
            })
        });
        const respData = await response.json();
        console.log(respData);
        if (respData.msg === "Note edited!") {
            document.getElementById("note-saved").style.display = "block";
            setTimeout(closePopup, 2000);
        }
    }
    
}

async function deleteNote(noteId) {
    const jwt = localStorage.getItem("jwt");
    const boardId = localStorage.getItem("boardId");
    const boardName = localStorage.getItem("boardName");
    const response = await fetch(`https://virtual-board-v1-dennis.azurewebsites.net/notes/${noteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}` }
    });
    const respData = await response.json();
    console.log(respData);
    document.getElementById("board").innerHTML="";
    printBoard(boardId, boardName);
    getNotes(boardId);
}

async function getBoards() {
    const jwt = localStorage.getItem("jwt");
    const response = await fetch("https://virtual-board-v1-dennis.azurewebsites.net/boards", {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
         }
    });
    const respData = await response.json();
    console.log(respData);

    document.getElementById("boards-menu").innerHTML = '<li><a class="dropdown-item" id="new-board">Create new board +</a></li>';

    for (let i in respData) {
        console.log(respData[i].name);
        document.getElementById("boards-menu").innerHTML +=`
        <li><a class="dropdown-item" name="${respData[i].name}" id="${respData[i].id}">${respData[i].name}</a></li>`;
    }
    ws();
}

async function getNotes(boardId) {
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(`https://virtual-board-v1-dennis.azurewebsites.net/boards/${boardId}`, {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
         }
    });
    const respData = await response.json();

    for (let i in respData) {
        document.getElementById("board").innerHTML+=`
        <div class="note draggable" style="${respData[i].style}" id="${respData[i].id}">
            <div id="note-header" noteId="${respData[i].id}">
                <button func="delete" class="btn">X</button>
                <button color="yellowgreen" class="btn">
                    <img src="./images/green.png" alt="">
                </button>
                <button color="firebrick" class="btn">
                    <img src="./images/red.png" alt="">
                </button>
                <button color="royalblue" class="btn">
                    <img src="./images/blue.png" alt="">
                </button>
                <button func=save class="btn">Save</button>
            </div>
            <div class="container" id="note-field">
                <textarea>${respData[i].note}</textarea>
            </div>
        </div>`;
    }
}

async function saveNewBoard(name) {
    const jwt = localStorage.getItem("jwt");
    const response = await fetch("https://virtual-board-v1-dennis.azurewebsites.net/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}` },
        body: JSON.stringify({
            name: name
        })
    });
    const respData = await response.json();
    console.log(respData);

    getBoards();
}

function printBoard(boardId, boardName) {
    document.getElementById("board").innerHTML=`<button class="btn btn-primary position-absolute end-0" id="new-note-btn">New note</button>
    <h2 id="${boardId}">${boardName}</h2>`;
}

function ws() {
WS_TOKEN = localStorage.getItem('jwt');
const socket = new WebSocket(`wss://virtual-board-v1-ws-dennis.azurewebsites.net/?token=${WS_TOKEN}`);
    
    
socket.onopen = function (event) {
    console.log('Connected to WebSocket server');
};

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const message = JSON.parse(data.msg);
    console.log('Received message:', message);
    if (data.status == 0) {
        document.getElementById(`${message.id}`).setAttribute("style", message.style);
        document.getElementById(`${message.id}`).children[1].children[0].value = message.note;
    } else {
        
    }
    
};

document.querySelector('#board').addEventListener("touchend" , (evt) => {
    if (evt.target.classList.contains("note")) {
        message = {
            id: evt.target.id,
            style: evt.target.getAttribute("style"),
            note: evt.target.children[1].children[0].value
        }
        console.log(message);
        socket.send(JSON.stringify(message));
    }

});

socket.onclose = function (event) {
    console.log('Connection closed');
};
}

document.querySelector('#btn-login').addEventListener('click', () => {
    const user = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    logIn(user, password);
});

// Change board from menu
document.querySelector("#boards-menu").addEventListener("click", (e) => {
    document.getElementById("login-success").style.display = "none";
    console.log(e.target.classList);
    let boardId = e.target.id;
    let boardName = e.target.name;
    if (e.target.id === "new-board") {
        boardName = prompt("Enter name for new board:");
        console.log(boardName);
        if (boardName === "" || boardName === null) {
            return;
        }
        saveNewBoard(boardName);
        return;
    }
    printBoard(boardId, boardName);
    getNotes(boardId);
    localStorage.setItem("boardId", boardId);
    localStorage.setItem("boardName", boardName);
});


document.addEventListener("click", (evt) => {
    
    if (evt.target.tagName === "IMG") {
        if (evt.target.parentElement.parentElement.id === "note-header") {
            if (evt.target.parentElement.hasAttribute("color")) {
                evt.target.parentElement.parentElement.parentElement.style.backgroundColor = evt.target.parentElement.getAttribute("color");
            }
        }  
    } 
    if (evt.target.parentElement.id === "note-header") {
        if (evt.target.hasAttribute("color")) {
            evt.target.parentElement.parentElement.style.backgroundColor = evt.target.getAttribute("color");
        }
        if (evt.target.getAttribute("func") === "save") {
            console.log("Save this note");
            let noteId = evt.target.parentElement.getAttribute("noteid");
            let note = evt.target.parentElement.parentElement.children[1].children[0].value;
            let style = evt.target.parentElement.parentElement.getAttribute("style");
            saveNote(noteId, note, style);
        }
        if (evt.target.getAttribute("func") === "delete") {
            console.log("Delete this note");
            let noteId = evt.target.parentElement.getAttribute("noteid");
            deleteNote(noteId);
        }
        
    }
    if (evt.target.id === "new-note-btn") {
        createNewNote();
        console.log("New note");
    }
});



async function createNewNote() {
    const jwt = localStorage.getItem("jwt");
    const boardId = localStorage.getItem("boardId");
    const response = await fetch("https://virtual-board-v1-dennis.azurewebsites.net/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}` },
        body: JSON.stringify({
            boardId: boardId,
            note: "",
            style: ""
        })
    });
    const respData = await response.json();
    console.log(respData);
    getNotes(boardId);
  }

async function closePopup() {
    document.getElementById("note-saved").style.display = "none";
}

  interact('.draggable')
  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      })
    ],
    // enable autoScroll
    autoScroll: true,

    listeners: {
      // call this function on every dragmove event
      move: dragMoveListener,

      // call this function on every dragend event
      end (event) {
    
      }
    }
  })

  function dragMoveListener (event) {
    var target = event.target
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
  
    // translate the element
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
  
    // update the posiion attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
  }

  window.dragMoveListener = dragMoveListener
  
