import React, { useEffect, useState, useRef } from 'react';

import Amplify from '@aws-amplify/core';
import API, { graphqlOperation } from '@aws-amplify/api';
import '@aws-amplify/pubsub';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { createMessage, createChat, updateChat } from './graphql/mutations';
import { onCreateMessage, onUpdateChat } from './graphql/subscriptions';
import { messagesByChannelID, listUsers, getChat } from './graphql/queries';
import { InputGroup, Button, FormControl, CloseButton } from 'react-bootstrap'
import Avatar from '@mui/material/Avatar';
import Dhoni from './assets/dhoni.jpg'
import  send  from './assets/send.png'
import  smiley  from './assets/smiley.jpg'
import Ms from './assets/ms.webp'
import SendIcon from '@mui/icons-material/Send';
import MoodIcon from '@mui/icons-material/Mood';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CloseIcon from '@mui/icons-material/Close';
import awsExports from './aws-exports';
import { userLoginByUsernamePassword, listChats } from "./graphql/queries"
import { Typography } from '@mui/material';
import Badge from '@mui/material/Badge';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import { alpha, makeStyles } from '@material-ui/core/styles';
import './App.css';
import Login from './Login';

Amplify.configure(awsExports);

// const client = new ApolloClient({
//   uri: "https://48p1r2roz4.sse.codesandbox.io"
// });

const useStyles = makeStyles((theme) => ({

  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'gray'
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

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

  const [ChatBoxList, setChatBoxList] = useState(false)
  const [newMsg, setNewMsg] = useState()
  const [message, setMessage] = useState([]);
  const [showBox, setShowBox] = useState(false);
  const [shownToggle, setShownToggle] = useState(true);

  const [currentRec, setCurrentRec] = useState(undefined);
  const [emojiPickerState, SetEmojiPicker] = useState(false);

  const classes = useStyles();

  //For sample login
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
        console.log(response)
        const items = response?.data?.userLoginByUsernamePassword?.items[0];
        setUserId(items.id);
        setUserName(items.name);

      })
      .catch((error) => {
        console.log("UserName/Password is Wrong!")
      })
    handleLogin();
  }

  //Fetching list of users
  useEffect(() => {
    if (login) {
      API
        .graphql(graphqlOperation(listUsers))
        .then((response) => {
          const userList = response?.data?.listUsers?.items;
          console.log(userList)
          setUserListData(userList)

        })
      // console.log(userListData.length)
    }
  }, [login])

  // Fetching listChats and combining the listChats and listUsers
  useEffect(() => {
    console.log(userListData.length)
    console.log(userId)
    if (userListData.length > 0 && userId) {
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
          console.log(userListData)
          // console.log(response?.data?.listChats?.items)
          const ComboObj = response?.data?.listChats?.items;
          console.log(ComboObj)
          const temp = [];
          if (userListData.length > 0) {
            {
              userListData.map((uData) => {
                if (ComboObj.length > 0) {
                  {
                    ComboObj.map((singleObj) => {
                      if (uData.id == singleObj.user1 || uData.id == singleObj.user2) {
                        if (userId !== uData.id) {
                          temp.push({ ...uData, UChannelId: singleObj.id, notificationStatus: singleObj.status, sender: singleObj.sender, chatUpdatedAt: singleObj.updatedAt, chatMsgCount: singleObj.messageCount })
                        }
                      }
                    })

                  }
                }
              })
              const sortedData = temp.sort((a, b) => new Date(b.chatUpdatedAt) - new Date(a.chatUpdatedAt))

              console.log(sortedData, "sorted Data")
              console.log(temp)
              setComboData(sortedData)
              return temp
            }
          }

        })
        .catch(error => {
          console.log(error)
        })
    }
  }, [userListData,userId])



  // useEffect(() => {
  //   if (chatId) {
  //     API
  //       .graphql(graphqlOperation(messagesByChannelID, {
  //         channelID: chatId,
  //         sortDirection: 'ASC'
  //       }))
  //       .then((response) => {
  //         const items = response?.data?.messagesByChannelID?.items;

  //         if (items) {
  //           // console.log(items)
  //           setMessages(items);
  //         }
  //       })
  //   }
  // }, [chatId]);

  //Subscription for messages
  useEffect(() => {
    const subscription = API
      .graphql(graphqlOperation(onCreateMessage))
      .subscribe({
        next: (event) => {
          if (chatId == event.value.data.onCreateMessage.channelID) {
            console.log(event.value.data.onCreateMessage)
            setMessages([...messages, event.value.data.onCreateMessage]);
          }
          // console.log(event.value.data.onCreateMessage.channelID)
        }
      });
    return () => {
      subscription.unsubscribe();
    }
  }, [messages]);
  console.log(messages)

  //Subscription for Status
  useEffect(() => {
    const subscription = API
      .graphql(graphqlOperation(onUpdateChat))
      .subscribe({
        next: (event) => {
          console.log(event.value.data.onUpdateChat)
          const subsStatus = event.value.data.onUpdateChat;
          statusChange(event.value.data)
        }
      });
    return () => {
      subscription.unsubscribe();
    }
  }, [comboData]);
  //Loading updated status
  const statusChange = (newStatus) => {
    const hollyStatus = [];
    console.log(newStatus.onUpdateChat.sender)
    const lacoData = comboData.map((users) =>
      (users.UChannelId == newStatus.onUpdateChat.id && userId !== newStatus.onUpdateChat.sender) ?
        { ...users, notificationStatus: newStatus.onUpdateChat.status, sender: newStatus.onUpdateChat.sender, chatUpdatedAt: newStatus.onUpdateChat.updatedAt, chatMsgCount: newStatus.onUpdateChat.messageCount }
        : users
    );
    // console.log('lacoData', lacoData)
    if (lacoData.length > 0) {
      const sortedDatalist = lacoData.sort((a, b) => new Date(b.chatUpdatedAt) - new Date(a.chatUpdatedAt))
      console.log('lacoData', lacoData)
      console.log('sortedDatalist', sortedDatalist)
      setComboData(sortedDatalist)
    }
  }
  //for testing
  // useEffect(() => {
  //   console.log(messages)
  //   setNewMsgs(messages);
  // }, [messages])
  // console.log(newMsgs)

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
      getMessageCount(chatId, userId);

    } catch (error) {
      console.warn(error);
    }
  };

  const getMessageCount = async (chatId, userId) => {
    // console.log("status block", chatId)

    try {
      await API.graphql(graphqlOperation(getChat, { id: chatId }))
        .then((response) => {
          console.log(response, "Message Response")
          var messgCount = response.data.getChat.messageCount;

          if (messgCount === null) {
            var messgCount = 0;
          }
          statusTrue(chatId, userId, messgCount + 1);
        })
    } catch (error) {
      console.warn(error);
    }
  }

  const statusTrue = async (chatId, userId, messgCount) => {
    // console.log("status block", chatId)
    const input = {
      id: chatId,
      status: "true",
      sender: userId,
      messageCount: messgCount
    };
    try {
      await API.graphql(graphqlOperation(updateChat, { input }))
    } catch (error) {
      console.warn(error);
    }
  }

  const statusFalse = async (chatIds, userId) => {
    const input = {
      id: chatIds,
      status: "false",
      sender: userId,
      messageCount: 0
    };
    try {
      await API.graphql(graphqlOperation(updateChat, { input }))
    } catch (error) {
      console.warn(error);
    }
  }



  //Opening chat box
  const showBoxs = (i, pid, name, person) => {
    setCurrentRec(person);
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
          setChatId(UserChatId.id);
        }
        else {

          const input = {
            user1: userId,
            user2: pid,
          };
          try {
            API.graphql(graphqlOperation(createChat, { input }))
              .then((response) => {
                setChatId(response.data.createChat.id);
              })
          } catch (error) {
            console.warn(error);
          }
        }

      })
  }
  //Fetching old messages
  useEffect(() => {
    if (chatId) {
      API
        .graphql(graphqlOperation(messagesByChannelID, {
          channelID: chatId,
          sortDirection: 'ASC'
        }))
        .then((response) => {
          const items = response?.data?.messagesByChannelID?.items;

          if (items) {
            // console.log(items)
            setMessages(items);
          }
        })
    }
  }, [chatId]);


  // const toggle = () => {
  //   setShownToggle({
  //     shownToggle: !shownToggle
  //   });
  // }


  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
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

  let emojiPicker;
  if (emojiPickerState) {
    emojiPicker = (
      <Picker
        title="Pick your emoji…"
        emoji="point_up"
        style={{ position: 'absolute', width: "300px", bottom: "45px" }}
        onSelect={emoji => setMessageBody(messageBody + emoji.native)}
      />
    );
  }
  function triggerPicker(event) {
    event.preventDefault();
    SetEmojiPicker(!emojiPickerState);
  }

  return (
    <>
      {/*  <ApolloProvider client={client}> */}
      {login ?
        <div>
          <center><h3>Welcome {userName}</h3></center>

          {/* Chat Icon  */}
          {!ChatBoxList ?
            <div className="Chatlogo">
              <div className="pink-circle" onClick={() => setChatBoxList(!ChatBoxList)}>
                <div className="white-circle">
                  <MoreHorizIcon style={{ fontSize: 28 }} />
                </div>
              </div>
            </div>
            : null}

          <ul >
            <div className="connectedUsersList">
              {ChatBoxList ?
                <div className="chatList">

                  <>
                    <div className="chatHeader">
                      <div className="chatSection"> Chat </div>
                      <div className="chatListClose"><CloseIcon onClick={() => setChatBoxList(false)} /></div>
                      {/* <div className="closeIco"><span className="closeIcon" ><CloseIcon onClick={() => setShowBox(false)} /></span></div> */}
                    </div>

                    <div className="AllChatUsers ">

                      <div className={classes.search} id="chatSearch">
                        <div className={classes.searchIcon}>
                          <SearchIcon />
                        </div>
                        <InputBase
                          placeholder="Search"
                          classes={{
                            root: classes.inputRoot,
                            input: classes.inputInput,
                          }}
                          inputProps={{ 'aria-label': 'search' }}
                        />
                      </div>


                      {comboData.map((person, i) => (userId === person.id ? null :
                        <div key={i}>
                          <div className="chat-sidebar" onClick={() => { showBoxs(i, person.id, person.name, person); scrollToBottom(); statusFalse(person.UChannelId, person.id) }}>

                            {/* <Badge variant={(person.notificationStatus == "true" && person.id == person.sender && person.id != userId) ? "dot" : null} color="info" className="userChatAvaster"> */}
                            <Avatar alt="Srikanth Ganji" className="userChatAvaster" sx={{ width: 48, height: 48 }} src={Dhoni} />
                            {/* </Badge> */}

                            <div className="personModel">
                              <h4>
                                {person.name}
                                <span className="numberOfMessages">
                                  <Badge badgeContent={(person.notificationStatus == "true" && person.id == person.sender && person.id != userId) ? person.chatMsgCount : null} sx={{
                                    "& .MuiBadge-badge": {
                                      color: "white",
                                      backgroundColor: "#ee357e",
                                      width: "26px",
                                      height: "21px",
                                    }
                                  }}  >
                                  </Badge>
                                </span>
                              </h4>
                              <p className="userPara">Artist (Hair specialist - NYC)</p>
                            </div>
                          </div>
                          <hr className="hrForChat" />
                        </div>))
                      }
                    </div>
                  </>
                </div>
                : null
              }
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
                <div className="msg_box" style={{ right: '320px' }}>
                  <div className="msg_head"
                  //  onClick={this.toggle.bind(this)}
                  >

                    <div className="one">
                      <b>
                        {/* {console.log(currentRec.notificationStatus)} */}
                        {currentRec !== undefined &&
                          <div className="modal-body">
                            <span><Avatar alt="Srikanth Ganji" sx={{ width: 32, height: 32 }} src={Dhoni} /></span>
                          </div>
                        }
                      </b>
                    </div>
                    <div className="two">
                      {currentRec !== undefined &&
                        <div>
                          {currentRec.name}
                        </div>
                      }
                    </div>
                    <div className="three"><span className="calender"><EventNoteIcon /></span></div>
                    {/* <div ><span className="min" onClick={this.toggle.bind(this)}>_</span></div> */}
                    <div className="four"><span className="closeIcon" ><CloseIcon onClick={() => setShowBox(false)} /></span></div>

                  </div>
                  <div style={hidden} className="msg_wrap">
                    <div className="msg_body"
                      onClick={() => statusFalse(currentRec?.UChannelId, currentRec?.id)}
                    // onClick = {(currentRec.notificationStatus == "true") ? () => statusFalse(currentRec?.UChannelId, currentRec?.id) : null}
                    >

                      {messages.map((message) => (
                        <div
                          key={message.id}
                        >
                          {/* {message.body} */}
                          <Typography component={'span'} variant={'body2'}>
                            <span style={{ display: 'flex', marginTop: '20px' }}>
                              <span style={{ marginRight: '6px' }}>{message.author === userId ? null : <Avatar alt="Srikanth Ganji" src={Dhoni} sx={{ width: 32, height: 32 }} />}</span>
                              <span className={message.author === userId ? 'textRight' : 'text'}><span className={message.author === userId ? 'Smsg' : 'Rmsg'}> {message?.body} </span> </span>
                              <span style={{ marginLeft: '6px' }}>{message.author === userId ? <Avatar alt="Srikanth Ganji" src={Ms} sx={{ width: 32, height: 32 }} /> : null}</span>
                            </span>
                          </Typography>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />

                    </div>
                  </div>
                  {emojiPicker}

                  <hr />
                  <div className="msgBtm">
                    <InputGroup className="inputGroup">
                      <FormControl
                        className="formControl"
                        placeholder="Type or Ask something "
                        onChange={handleChange}
                        value={messageBody}
                        required
                      // aria-label="Recipient's username with two button addons"
                      />
                      {/* <img src={smiley} className="emoji" onClick={triggerPicker} /> */}
                      <span className="emoji" onClick={triggerPicker}>😀</span>
                      <img className="send" src={send} onClick={handleSubmit} />
                      {/* <span className="send"><SendIcon onClick={handleSubmit} style={{ color: 'pink' }} /></span> */}
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