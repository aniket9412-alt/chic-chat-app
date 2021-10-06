import React, { useEffect, useState, useRef } from 'react';

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
import { Typography } from '@mui/material';
import Badge from '@mui/material/Badge';

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
  const [newMsgs, setNewMsgs] = useState([])
  const [comboData, setComboData] = useState([])

  const handleLogin = () => {
    setLogin(true)
  }

  useEffect(() => {
    if (userId.length > 0) {
      setLogin(true)
    }
  }, [userId])

  const handleSubmitLogin = (email, password) => {

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
        console.log("Login")

      })
      .catch((error) => {
        console.log("UserName/Password is Wrong!")
      })
    handleLogin();

  }

  useEffect(() => {
    if (login) {
      API
        .graphql(graphqlOperation(listUsers))
        .then((response) => {
          const userList = response?.data?.listUsers?.items;
          console.log(userList)
          setUserListData(userList)

        })
      console.log(userListData.length)
    }


  }, [login])

  useEffect(() => {
      API
        .graphql(graphqlOperation(listChats, {
          filter: {
            or: [
              {
                user1: { eq: userId }
              },
              {
                user2: { eq: userId }
              }
            ]
          }
        }))
        .then((response) => {
          console.log(response)
          console.log(response?.data?.listChats?.items)
          const ComboObj = response?.data?.listChats?.items;
          const temp = [];
          if (userListData.length > 0) {
            {
             userListData.map((uData) => {
                if (ComboObj.length > 0) {
                  {
                 ComboObj.map((singleObj) => {
                      if (uData.id == singleObj.user1 || uData.id == singleObj.user2) {    
                        if(userId !== uData.id){
                        temp.push({...uData, UChannelId : singleObj.id})
                        }            
                      }
                    })

                  }
                }
              })
              console.log(temp, "comboData")
              setComboData(temp)
              return temp
            }
          }
        
        })
    }, [userListData])
  console.log(comboData)
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
    console.log("Checking Subscription")
    return () => {
      subscription.unsubscribe();
    }
  }, [messages]);

  //for testing
  useEffect(() => {
    setNewMsgs(messages);
  }, [messages])

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
    );

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
        if (UserChatId !== undefined) {
          setChatId(JSON.stringify(UserChatId.id));
        }
        else {

          const input = {
            user1: userId,
            user2: pid,
          };
          console.log(input)
          try {
            API.graphql(graphqlOperation(createChat, { input }))
              .then((response) => {
                setChatId(JSON.stringify(response.data.createChat.id));
              })
          } catch (error) {
            console.warn(error);
          }
        }

      })
  }



  // const toggle = () => {
  //   setShownToggle({
  //     shownToggle: !shownToggle
  //   });
  // }


  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    console.log("ref")
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" })
  }

  // useEffect(() => {
  //   scrollToBottom()
  // }, [messages])

  useEffect(() => {
    scrollToBottom();
    return () => {
      scrollToBottom();
    }
  }, [messages])

  var hidden = {
    display: shownToggle ? "block" : "none"
  }

  console.log(userListData)


  return (
    <>
      {/*  <ApolloProvider client={client}> */}
      {login ?
        <div>
          <center><h3>Welcome {userName}</h3></center>
          <ul style={{ float: "right" }}>
            <div className="chatList">

              <>
                <div className="chatHeader">
                  <div className="chatSection"> Chat </div>
                  {/* <div className="closeIco"><span className="closeIcon" ><CloseIcon onClick={() => setShowBox(false)} /></span></div> */}
                </div>

                <div className="AllChatUsers ">
                  {userListData.map((person, i) => (userId === person.id ? null :
                    <div key={i}>
                      <div className="chat-sidebar" onClick={() => { showBoxs(i, person.id, person.name); scrollToBottom(); }}>
                        {/* {newMsgs.length != 0 ? 
                          <Badge badgeContent={(newMsgs.map((msg, i) => (msg.author == person.id ?  1 : null)))} color="warning" className="userChatAvaster">
                            <Avatar alt="Srikanth Ganji" sx={{ width: 50, height: 50 }} src={Dhoni} />
                          </Badge> 
                      : 
                       <Badge badgeContent={1} color="primary" className="userChatAvaster">
                        <Avatar alt="Srikanth Ganji" sx={{ width: 50, height: 50 }} src={Dhoni} />
                      </Badge> 
                    } */}
                        <Badge badgeContent={1} color="primary" className="userChatAvaster">
                          <Avatar alt="Srikanth Ganji" sx={{ width: 50, height: 50 }} src={Dhoni} />
                        </Badge>
                        <div className="personModel">
                          <h4>{person.name}</h4>
                          <p className="userPara">Des</p>
                          {/* <hr /> */}
                        </div>
                      </div>
                      <hr className="hrForChat" />
                    </div>))}
                </div>
              </>
            </div>

            {/* Start Chat with  */}
            {/* <div className="chatList">
              <div className="chatHeader">
                <div className="chatSection">Start Chat </div>
                <div className="closeIco"><span className="closeIcon" ><CloseIcon onClick={() => setShowBox(false)} /></span></div>
              </div>
              <div className="AllChatUsers ">
                {userListData.map((person, i) => (userId === person.id ? null :
                  <div key={i}>
                    <div className="chat-sidebar">
                      <Avatar className="userChatAvaster" alt="Srikanth Ganji" sx={{ width: 50, height: 50 }} src={Dhoni} />
                      <div className="personModel" onClick={() => showBoxs(i, person.id, person.name)}>
                        <h4>{person.name}</h4>
                        <p className="userPara">Des</p>
                      </div>
                    </div>
                    <hr className="hrForChat" />
                  </div>))}
              </div>
             
            </div> */}

            {/* {userListData.map((person, i) => (userId === person.id ? null : */}
            <div>
              {/* <button onClick={() => showBoxs(i, person.id, person.name)}>{person.name}</button> */}
              {showBox ? (
                <div className="msg_box" style={{ right: '300px' }}>
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
                  <div style={hidden} className="msg_wrap">
                    <div className="msg_body">

                      {messages.map((message) => (
                        <div
                          key={message.id}
                        >
                          {console.log(message.body === null ? "No" : "Yes")}
                          {/* {message.body} */}
                          <Typography component={'span'} variant={'body2'}>
                            <span style={{ display: 'flex', marginTop: '20px' }}>
                              <span style={{ marginRight: '6px' }}>{message.author === userId ? null : <Avatar alt="Srikanth Ganji" src={Dhoni} />}</span>
                              <span className={message.author === userId ? 'textRight' : 'text'}><span className={message.author === userId ? 'Smsg' : 'Rmsg'}> {message?.body} </span> </span>
                              <span style={{ marginLeft: '6px' }}>{message.author === userId ? <Avatar alt="Srikanth Ganji" src={Ms} /> : null}</span>
                            </span>
                          </Typography>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />

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
            {/* ))} */}
          </ul>
        </div>
        : <Login handleSubmitLogin={handleSubmitLogin} />}
      {/*   </ApolloProvider> */}
    </>
  );
}

export default App;