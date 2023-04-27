import './App.css';
import Profiles from './Saves';
import { useState, useEffect, useRef } from 'react';
import tmi from 'tmi.js';

function App() {
  const chatbox = useRef(null);

  const [name, setName] = useState('');
  const [client, setClient] = useState();
  const [loading, setLoading] = useState();

  const [includes, setIncludes] = useState('');
  const [includesArray, setIncludesArray] = useState([]);
  const [excludes, setExcludes] = useState('');
  const [excludesArray, setExcludesArray] = useState([]);

  const [whitelist, setWhitelist] = useState('');
  const [whitelistArray, setWhiteListArray] = useState([]);
  const [blacklist, setBlacklist] = useState('');
  const [blacklistArray, setBlacklistArray] = useState([]);

  const [subOnly, setSubOnly] = useState(false);

  const [scrolledBottom, setScrolledBottom] = useState(true);
  const [mousedOverChat, setMousedOverChat] = useState(false);

  const [startTime, setStartTime] = useState();
  const [messageCount, setMessageCount] = useState(0);
  const [messageRate, setMessageRate] = useState('0.00');

  const [profileColumn, setProfileColumn] = useState(false);

  const handleRelay = async (e) => {
    e.preventDefault();
    clearChat();
    setClient(new tmi.Client({
      channels: [name]
    }));
  };

  // Connect to channel
  useEffect(() => {
    if (!client)
      return;

    const connectToChannel = async () => {
      setLoading(true);
      await client.connect();
      setLoading(false);
    };

    connectToChannel();

    return () => {
      client.disconnect();
    };
  }, [client]);

  // Get chat messages
  useEffect(() => {
    if (!client)
      return;

    const handleNewMessage = (channel, tags, message, self) => {
      if (
        (subOnly && !tags.subscriber) ||

        (whitelistArray.length > 0 && !whitelistArray.some(username => username === tags.username)) ||
        (blacklistArray.length > 0 && blacklistArray.some(username => username === tags.username)) ||

        (includesArray.length > 0 && !includesArray.some(word => message.includes(word))) ||
        (excludesArray.length > 0 && excludesArray.some(word => message.includes(word)))
      )
        return console.log(`${tags.username}: ${message}`);

      setMessageCount(messageCount + 1);
      const elapsedTime = Date.now() - startTime;
      setMessageRate((messageCount / (elapsedTime / 1000)).toFixed(2));

      const newMessage = document.createElement('li');
      newMessage.setAttribute('id', tags.id);
      newMessage.innerHTML = `<span style='color:${tags.color};'>${tags['display-name']}</span>: <span>${message}</span>`;

      chatbox.current.appendChild(newMessage);
      if (scrolledBottom)
        chatbox.current.scrollTop = chatbox.current.scrollHeight;
    };

    client.on('message', handleNewMessage);

    return () => {
      client.off('message', handleNewMessage);
    };
  }, [client, scrolledBottom, includesArray, excludesArray, whitelistArray, blacklistArray, subOnly, startTime, messageCount]);

  const applyFilter = (state, stateFunction) => {
    if (state === '' || !state.replace(/\s/g, '').length)
      stateFunction([]);
    else
      stateFunction(state.replace(/\s*,\s*/g, ',').split(','));
  };

  const findRandomMessage = () => {
    const messages = chatbox.current.childNodes;

    if (messages.length > 0) {
      const previousRandom = chatbox.current.getElementsByClassName('highlight')[0];
      if (previousRandom)
        previousRandom.classList.remove('highlight');

      const message = messages[Math.floor(Math.random() * messages.length)];
      message.lastElementChild.classList.add('highlight');
      message.scrollIntoView();
    }
  };

  const clearChat = () => {
    chatbox.current.replaceChildren();
    setScrolledBottom(true);
    setStartTime(Date.now());
    setMessageCount(0);
    setMessageRate('0.00');
  };

  const handleScroll = (e) => {
    setScrolledBottom(Math.abs(e.scrollHeight - e.clientHeight - e.scrollTop) < 1);
  };

  const scrollToBottom = () => {
    chatbox.current.scrollTop = chatbox.current.scrollHeight;
  };

  return (
    <div className='flex-row align-content-center'>

      {/* Utility column */}
      <div className='util-column flex-column'>
        <h3>Twitch Chat Relay</h3>

        <div className={`${!profileColumn ? '' : 'd-none'}`}>
          {/* Channel search */}
          <form onSubmit={handleRelay}>
            <div className='flex-row'>
              <input type='text' value={name} onChange={(e) => setName(e.target.value)}
                placeholder='Channel Name' className='w-100 right-flat' />
              <input type='submit' value='Relay' className='btn submit-btn left-flat side-btn' />
            </div>
          </form>

          <h4>Messages</h4>

          {/* Includes/Excludes */}
          <div className='flex-row'>
            <div>
              <input type='text' value={includes} onChange={(e) => setIncludes(e.target.value)}
                placeholder='Includes' className='w-100 bottom-flat right-flat magnet-bottom' />
              <input type='text' value={excludes} onChange={(e) => setExcludes(e.target.value)}
                placeholder='Excludes' className='w-100 right-flat top-flat' />
            </div>
            <button type='button' className='btn left-flat side-btn'
              onClick={() => {
                applyFilter(includes, setIncludesArray);
                applyFilter(excludes, setExcludesArray);
              }}>Apply</button>
          </div>

          <h4>Users</h4>
          <div>
            {/* Whitelist/Blacklist */}
            <div className='flex-row'>
              <div>
                <input type='text' value={whitelist} onChange={(e) => setWhitelist(e.target.value)}
                  placeholder='Whitelist' className='w-100 bottom-flat right-flat magnet-bottom' />
                <input type='text' value={blacklist} onChange={(e) => setBlacklist(e.target.value)}
                  placeholder='Blacklist' className='w-100 right-flat top-flat' />
              </div>
              <button type='button'
                className='btn left-flat side-btn'
                onClick={() => {
                  applyFilter(whitelist, setWhiteListArray);
                  applyFilter(blacklist, setBlacklistArray);
                }}>Apply</button>
            </div>

            <div className='flex-row'>

              {/* Subscriber only */}
              <div>
                <input type='checkbox' value={subOnly} onChange={() => setSubOnly(!subOnly)} />
                <label>Subscriber Only</label>
              </div>

              {/* Save / Open */}
              <button type='button' className='row-end link-btn' onClick={() => setProfileColumn(true)}>
                {'\u{1f4be}'} Saves
              </button>
            </div>
          </div>
        </div>

        <div className={`${profileColumn ? '' : 'd-none'} flex-column`}>
          <Profiles
            channelName={name}
            includes={includes}
            excludes={excludes}
            whitelist={whitelist}
            blacklist={blacklist}
            subOnly={subOnly}
            cancelButton={() => setProfileColumn(false)} />
        </div>

        {/* Random / Clear */}
        <div className='flex-row align-content-center column-end'>
          <button type='button'
            className='btn margin-right mb-0' onClick={() => findRandomMessage()}>Find Random</button>
          <button type='button'
            className='btn align-self-center mb-0' onClick={() => clearChat()}>Clear Chat</button>
        </div>

        <p className='align-self-center mb-0 margin-top'>{messageRate} messages/sec</p>
      </div>

      {/* Chatbox */}
      <div className='flex-column'>
        <p className={`connect-msg ${loading ? '' : 'd-none'}`}>Connecting...</p>
        <ul
          ref={chatbox} className='chatbox' style={{ overflow: mousedOverChat ? 'auto' : 'hidden' }}
          onScroll={(e) => { handleScroll(e.target); }}
          onMouseEnter={() => setMousedOverChat(true)}
          onMouseLeave={() => setMousedOverChat(false)}
        />
        <button type='button'
          className={`btn scroll-bottom-btn align-self-center margin-top ${scrolledBottom ? 'd-none' : ''}`}
          onClick={() => scrollToBottom()}
        >
          {'\u{1F847}'} Scroll to Bottom
        </button>
      </div>

    </div>
  );
}

export default App;
