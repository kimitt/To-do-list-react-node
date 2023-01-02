const express = require('express');
const app = express();
const PORT = 4000;
//client & server 도메인 간의 데이터 전송을 허용하기 위해 http, cors 라이브러리 가져옴
const http = require('http').Server(app);
const cors = require('cors');
//socket.io 추가 - 실시간 연결 만들기
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

let todoList = [];

socketIO.on('connection', (socket) => {
    console.log(`😎: ${socket.id} user just connected!!`);

    socket.on("addTodo", (todo) => {
        console.log(todo);

        todoList.unshift(todo);

        socket.emit("todos", todoList)
    });

    socket.on("viewComments", (id) => {
        for (let i = 0; i < todoList.length; i++) {
          if (id === todoList[i].id) {
            socket.emit("commentsReceived", todoList[i]);
          }
        }
      });

    //할일 목록에서 id 값을 받아와서 삭제
    socket.on("deleteTodo", (id) => {
        console.log(id)
        todoList = todoList.filter((todo) => todo.id !== id);
        socket.emit("todos", todoList);
    });
    //코멘트 모달에 댓글 입력
    socket.on("updateComment", (data) => {
        const { user, todoID, comment } = data;

        for (let i = 0; i < todoList.length; i++) {
            if (todoID === todoList[i].id) {
                todoList[i].comments.push({ name: user, text: comment });
                socket.emit("commentsReceived", todoList[i]);
            } 
        }
    })

    socket.on('disconnect', () => {
        socket.disconnect()
        console.log("🫥DISCONNECTED!!!!!!!!");
    });
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.use(cors());

app.get('/api', (req, res) => {
    res.json(todoList);
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

//express를 사용해 node.js 서버 설정
//http://localhost:4000/api 브라우저 방문시 json 객체 반환