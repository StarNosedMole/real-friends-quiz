import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import UserContainer from './UserContainer.js';
import RoomSurvey from './RoomSurvey.js';
import Timer from './Timer.js';

let socket;

class Game extends Component {
    constructor(props){
        super(props);

        this.collapseUsers = this.collapseUsers.bind(this);
        this.emitAnswer = this.emitAnswer.bind(this);
        this.nextQuestion = this.nextQuestion.bind(this);
        this.oneSecond = this.oneSecond.bind(this);
        this.startGame = this.startGame.bind(this);

        socket = io.connect();
        socket.on('roomfull', data => {
            if (data)
                this.props.exitGame();
        })
        socket.on('joinedroom', data => {
            this.setState({...this.state, users: data.users, survey: data.survey.questions, questionNum: 0, answered: false});
        });
        socket.on('startgame', data => {
            setInterval(() => this.oneSecond(), 1000);
            this.setState({...this.state, started: true})
        });
        socket.on('nextquestion', data => {
            console.log(`were moving onto the next question!`);
            this.nextQuestion(data);
        });
        
        this.state={socket, users: [], showUsers: true, counter: 30, started: false};
    }

    collapseUsers(){
        this.setState({...this.state, showUsers: !this.state.showUsers});
    }

    startGame(){
        const data = {
            id: this.state.socket.id,
            room: this.props.room,
        }

        socket.emit('ready', data);
    }

    emitAnswer(answer){
        const isCorrect = (answer === this.state.survey[this.state.questionNum].answer);
        const data = {id: this.state.socket.id, room: this.props.room, isCorrect}
        socket.emit('submitanswer', data);

        this.setState({...this.state, answered: true});
    }

    nextQuestion(data){
        const newQuestionNum = this.state.questionNum + 1;
        this.setState({...this.state, users: data, questionNum: newQuestionNum, answered: false, counter: 30});
    }

    oneSecond(){
        const newTime = this.state.counter - 1;

        if (newTime <= 0) this.nextQuestion(this.state.users);
        else this.setState({...this.state, counter: newTime});
    }

    componentDidMount(){

        if(!this.props.room)
            this.props.exitGame();

        const roomCheck = {
            id: socket.id,
            room: this.props.room,
        }
        
        socket.emit('checkoccupancy', roomCheck);

        const root = document.getElementById('root');
        root.style.width = '100%';
        root.style.backgroundColor = 'black';

        this.setState({socket});

        const data = {
            room: this.props.room,
            name: this.props.username,
        }

        socket.emit('joinroom', data);
    }

    render(){

        const users = this.state.showUsers ? <UserContainer users={this.state.users} room={this.props.room} /> : <div></div>;
        const nextquestion = this.state.survey && this.state.started ? (
            <div>
                <RoomSurvey question={this.state.survey[this.state.questionNum].question} answered={this.state.answered} clickEvent={this.emitAnswer} />
            </div>) : <div></div>;
        const startbutton = this.state.started ? <div></div> : (
            <div id='startbtn'>
                <button onClick={this.startGame}>Start Game</button>
            </div>);

        const results = 'hi';

        return(
            <div>
                <button id='collapsebtn' onClick={this.collapseUsers} style={this.state.showUsers ? {marginLeft: '18%'} : {marginLeft: '0%'} } >{this.state.showUsers ? '<' : '>'}</button>
                <button id='leavegamebtn' onClick={this.props.exitGame} >Leave Game</button>
                {users}
                {nextquestion}
                {startbutton}
                <Timer time={this.state.counter} />
            </div>
        )
    }
}
export default withRouter(Game);