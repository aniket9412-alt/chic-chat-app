import React, { useEffect, useState } from 'react';

import Amplify from '@aws-amplify/core';
import API, { graphqlOperation } from '@aws-amplify/api';
import '@aws-amplify/pubsub';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { createMessage, createChat } from './graphql/mutations';
import { onCreateMessage } from './graphql/subscriptions';
import { messagesByChannelID, listUsers } from './graphql/queries';
import { InputGroup, Button, FormControl, CloseButton } from 'react-bootstrap'
import Avatar from '@mui/material/Avatar';
import Dhoni from './assets/dhoni.jpg'
import Ms from './assets/ms.webp'
import SendIcon from '@mui/icons-material/Send';
import MoodIcon from '@mui/icons-material/Mood';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CloseIcon from '@mui/icons-material/Close';
import awsExports from './aws-exports';
import { userLoginByUsernamePassword, listChats } from "./graphql/queries"

import './App.css';
import Login from './Login';

Amplify.configure(awsExports);

// const client = new ApolloClient({
//   uri: "https://48p1r2roz4.sse.codesandbox.io"
// });

function App() {
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [login, setLogin] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('')
  const [userListData, setUserListData] = useState([]);
  const [chatId, setChatId] = useState('');

  const handleSubmitLogin = (e, email, password) => {
    // e.preventDefault();
    // console.log(email);
    // console.log(password);

    const pass = {
      eq: password
    }
    API
      .graphql(graphqlOperation(userLoginByUsernamePassword, {
        userName: email,
        password: pass
      }))
      .then((response) => {
        const items = response?.data?.userLoginByUsernamePassword?.items[0];
        setUserId(items.id);
        setUserName(items.name);
      })
    handleLogin();
    // console.log(res)
  }
  console.log(userId)
  console.log(userName)
  useEffect(() => {
    if (login) {
      API
        .graphql(graphqlOperation(listUsers))
        .then((response) => {
          const userList = response?.data?.listUsers?.items;
          console.log(userList)
          setUserListData(userList)

        })
    }
  }, [login])
  console.log(userListData)

  useEffect(() => {
    API
      .graphql(graphqlOperation(messagesByChannelID, {
        channelID: chatId,
        sortDirection: 'ASC'
      }))
      .then((response) => {
        const items = response?.data?.messagesByChannelID?.items;

        if (items) {
          setMessages(items);
        }
      })
  }, [chatId]);

  useEffect(() => {
    const subscription = API
      .graphql(graphqlOperation(onCreateMessage))
      .subscribe({
        next: (event) => {
          setMessages([...messages, event.value.data.onCreateMessage]);
        }
      });

    return () => {
      subscription.unsubscribe();
    }
  }, [messages]);

  const handleChange = (event) => {
    setMessageBody(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const input = {
      channelID: chatId,
      author: userId,
      body: messageBody.trim()
    };

    try {
      setMessageBody('');
      await API.graphql(graphqlOperation(createMessage, { input }))
    } catch (error) {
      console.warn(error);
    }
  };

  const handleLogin = () => {
    setLogin(true)
  }
  //mine
  const [newMsg, setNewMsg] = useState()
  const [message, setMessage] = useState([]);
  const [showBox, setShowBox] = useState(false);
  const [shownToggle, setShownToggle] = useState(true);

  const [currentRec, setCurrentRec] = useState(undefined);

  const showBoxs = (i, pid, name) => {
    setCurrentRec(i);
    console.log(`Selected record index: ${i}`);
    setShowBox({ showBox: true }
      //     , () => {
      //     document.addEventListener('click', closeBox);
      // }
    );
    console.log(pid, name)

    API
      .graphql(graphqlOperation(listChats, {
        filter: {
          or: [
            {
              user1: { eq: userId }, user2: { eq: pid }
            },
            {
              user1: { eq: pid }, user2: { eq: userId }
            }
          ]
        }
      }))
      .then((response) => {
        const filterItem = response?.data?.listChats?.items;
        const UserChatId = filterItem[0];
        console.log(UserChatId)
        if(UserChatId !== undefined) {
          setChatId(JSON.stringify(UserChatId.id));
          console.log("Filter chat " + JSON.stringify(UserChatId.id));
        }
        else {
          console.log("there is no id" + filterItem)
         
          const input = {
            user1: userId,
            user2: pid,
          };
      console.log(input)
          try {
             API.graphql(graphqlOperation(createChat, { input }))
            .then((response) => {
              console.log(JSON.stringify(response.data.createChat.id));
              setChatId(JSON.stringify(response.data.createChat.id));
            }) 
          } catch (error) {
            console.warn(error);
          }
        }
       
      })
  }

  const handleMessage = (e) => {
    e.preventDefault();
    console.log(e.target.value)
    setNewMsg(e.target.value);
  }

  const handleSendMessage = (e) => {
    setMessage(message => [...message, newMsg])
    console.log(message[0] + " with send")
    setNewMsg('');
  }
  //    const closeBox = (event) => {
  //         if (dropdownBox.contains(event.target)) {
  //             setShowBox({ showBox: false }
  //                 , () => {
  //                 document.removeEventListener('click', closeBox);
  //             });
  //         }
  //     }
  const toggle = () => {
    setShownToggle({
      shownToggle: !shownToggle
    });
  }

  var hidden = {
    display: shownToggle ? "block" : "none"
  }

  return (
    <>
      {/*  <ApolloProvider client={client}> */}
      {login ?
        <div>
          <center><h3>Welcome {userName}</h3></center>
          <ul style={{ float: "right" }}>
            {userListData.map((person, i) => (userId === person.id ? null :
              <div className="chat-sidebar" key={i}>
                <button onClick={() => showBoxs(i, person.id, person.name)}>Chat with {person.name}</button>
                {showBox ? (
                  <div className="msg_box" style={{ right: '270px' }}>
                    <div className="msg_head"
                    //  onClick={this.toggle.bind(this)}
                    >

                      <div className="one">
                        <b>
                          {currentRec !== undefined &&
                            <div className="modal-body">
                              <span><Avatar alt="Srikanth Ganji" src={Dhoni} /></span>
                              {/* {this.state.data[this.state.currentRec].name} */}

                              {/* ({this.state.data[this.state.currentRec].id}) */}
                            </div>
                          }
                        </b>
                      </div>
                      <div className="two">
                        {currentRec !== undefined &&
                          <div>
                            {userListData[currentRec].name}
                          </div>
                        }
                      </div>
                      <div className="three"><span className="calender"><EventNoteIcon /></span></div>
                      {/* <div ><span className="min" onClick={this.toggle.bind(this)}>_</span></div> */}
                      <div className="four"><span className="closeIcon" ><CloseIcon onClick={() => setShowBox(false)} /></span></div>

                    </div>
                    <div style={hidden} className="msg_wrap"><div className="msg_body">
                      {/* {
                            data.rates.map(({ currency, rate }, i) => (
                                <div className="paraDiv" key={i}>
                                    <p style={{ display: 'flex', marginTop: '20px' }}>
                                        <span style={{ marginRight: '6px' }}>{i % 2 == 0 ? <Avatar alt="Srikanth Ganji" sx={{ width: 30, height: 30 }} src={Dhoni} /> : null}</span>
                                        <span className={i % 2 == 0 ? "text" : "textRight"}> {currency}: {rate} </span>
                                        <span style={{ marginLeft: '6px' }}>{i % 2 == 0 ? null : <Avatar alt="Srikanth Ganji" src={Ms} />}</span>

                                    </p>
                                </div>
                            ))
                        } */}

                      {/* {
                    message.map((message, i) => (
                      <div className="paraDiv" key={i}>
                        <p style={{ display: 'flex', marginTop: '20px' }}>
                          <span style={{ marginRight: '6px' }}>{i % 2 == 0 ? <Avatar alt="Srikanth Ganji" sx={{ width: 30, height: 30 }} src={Dhoni} /> : null}</span>
                          <span className={i % 2 == 0 ? "text" : "textRight"}> {message} </span>
                          <span style={{ marginLeft: '6px' }}>{i % 2 == 0 ? null : <Avatar alt="Srikanth Ganji" src={Ms} />}</span>

                        </p>
                      </div>
                    ))
                  } */}
                      {messages.map((message) => (
                        <div
                          key={message.id}
                        >
                          {/* {message.body} */}
                          <p style={{ display: 'flex', marginTop: '20px' }}>
                            <span style={{ marginRight: '6px' }}>{message.author === userId ? <Avatar alt="Srikanth Ganji" sx={{ width: 30, height: 30 }} src={Dhoni} /> : null}</span>
                            <span className={message.author === userId ? 'text' : 'textRight'}> {message.body} </span>
                            <span style={{ marginLeft: '6px' }}>{message.author === userId ? null : <Avatar alt="Srikanth Ganji" src={Ms} />}</span>

                          </p>
                        </div>
                      ))}
                    </div>
                    </div>
                    <hr />
                    <div className="msgBtm">
                      <InputGroup className="inputGroup">
                        <FormControl
                          className="formControl"
                          placeholder="Type here!"
                          onChange={handleChange}
                          value={messageBody}
                        // aria-label="Recipient's username with two button addons"
                        />
                        <span className="emoji"><MoodIcon /></span>
                        <span className="send"><SendIcon onClick={handleSubmit} style={{ color: 'pink' }} /></span>
                      </InputGroup>
                    </div>
                  </div>) : (null)}
              </div>
            ))}
          </ul>
        </div>
        : <Login handleLogin={handleLogin} handleSubmitLogin={handleSubmitLogin} />}
      {/*   </ApolloProvider> */}
    </>
  );
}

export default App;