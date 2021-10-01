import React, { useEffect, useState } from 'react';

import Amplify from '@aws-amplify/core';
import API, { graphqlOperation } from '@aws-amplify/api';
import '@aws-amplify/pubsub';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { createMessage } from './graphql/mutations';
import { onCreateMessage } from './graphql/subscriptions';
import { messagesByChannelID } from './graphql/queries';
import { InputGroup, Button, FormControl, CloseButton } from 'react-bootstrap'
import Avatar from '@mui/material/Avatar';
import Dhoni from './assets/dhoni.jpg'
import Ms from './assets/ms.webp'
import SendIcon from '@mui/icons-material/Send';
import MoodIcon from '@mui/icons-material/Mood';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CloseIcon from '@mui/icons-material/Close';
import awsExports from './aws-exports';
import './App.css';
import Login from './Login';

Amplify.configure(awsExports);

const client = new ApolloClient({
  uri: "https://48p1r2roz4.sse.codesandbox.io"
});

function App() {
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [login, setLogin] = useState(false);

  useEffect(() => {
    API
      .graphql(graphqlOperation(messagesByChannelID, {
        channelID: '3',
        sortDirection: 'ASC'
      }))
      .then((response) => {
        const items = response?.data?.messagesByChannelID?.items;

        if (items) {
          setMessages(items);
        }
      })
  }, []);

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
      channelID: '3',
      author: 'Dave',
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
  const [Udata, setData] = useState([
    { id: "1", name: "Srikanth" },
    { id: "2", name: "Ravi" },
    { id: "3", name: "Aniket" }
  ]);
  const [currentRec, setCurrentRec] = useState(undefined);

  const showBoxs = (i, pid, name) => {
    setCurrentRec(i);
    console.log(`Selected record index: ${i}`);
    setShowBox({ showBox: true }
      //     , () => {
      //     document.addEventListener('click', closeBox);
      // }
    );
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
    // <div>
    //   {(login ?

    // <div className="container">
    //   <div className="messages">
    //     <div className="messages-scroller">
    //       {messages.map((message) => (
    //         <div
    //           key={message.id}
    //           className={message.author === 'Dave' ? 'message me' : 'message'}>{message.body}</div>
    //       ))}
    //     </div>
    //   </div>
    //   <div className="chat-bar">
    //     <form onSubmit={handleSubmit}>
    //       <input
    //         type="text"
    //         name="message"
    //         placeholder="Type your message here..."
    //         onChange={handleChange}
    //         value={messageBody} />
    //     </form>
    //   </div>
    // </div>
    // : <Login handleLogin={handleLogin} />
    // )}
    // </div>
    <ApolloProvider client={client}>
{login ? 
    <div>
      <ul style={{ float: "right" }}>
        {Udata.map((person, i) => (
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
                        {Udata[currentRec].name}
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
                          <span style={{ marginRight: '6px' }}>{message.author === 'Dave' ? <Avatar alt="Srikanth Ganji" sx={{ width: 30, height: 30 }} src={Dhoni} /> : null}</span>
                          <span className={message.author === 'Dave' ? 'text' : 'textRight'}> {message.body} </span>
                          <span style={{ marginLeft: '6px' }}>{message.author === 'Dave' ? null : <Avatar alt="Srikanth Ganji" src={Ms} />}</span>

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
     : <Login handleLogin={handleLogin} />}
     </ApolloProvider>
  );
}

export default App;