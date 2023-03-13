import './App.css';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearChat();
    setClient(new tmi.Client({
      channels: [name]
    }));
  }

  // Connect to channel
  useEffect(() => {
    if (!client)
      return;

    const connectToChannel = async () => {
      setLoading(true);
      await client.connect();
      setLoading(false);
    }

    connectToChannel();

    return () => {
      client.disconnect();
    }
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

      const newMessage = document.createElement('li');
      newMessage.setAttribute('id', tags.id);
      newMessage.innerHTML = `<span style='color:${tags.color};'>${tags['display-name']}</span>: <span>${message}</span>`;
      
      chatbox.current.appendChild(newMessage);
      if (scrolledBottom)
        chatbox.current.scrollTop = chatbox.current.scrollHeight;
    }

    client.on('message', handleNewMessage);

    return () => {
      client.off('message', handleNewMessage);
    }
  }, [client, scrolledBottom, includesArray, excludesArray, whitelistArray, blacklistArray, subOnly]);

  const applyFilter = (state, stateFunction) => {
    if (state === '' || !state.replace(/\s/g, '').length)
      stateFunction([]);
    else
      stateFunction(state.replace(/\s*,\s*/g, ',').split(','));
  }

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
  }

  const clearChat = () => {
    chatbox.current.replaceChildren();
    setScrolledBottom(true);
  }

  const handleScroll = (e) => {
    setScrolledBottom(Math.abs(e.scrollHeight - e.clientHeight - e.scrollTop) < 1);
  }

  const scrollToBottom = () => {
    chatbox.current.scrollTop = chatbox.current.scrollHeight;
  }

  return (
    <div className='flex-row align-content-center'>

      {/* Utility column */}
      <div className='util-column flex-column'>
        <h3>Twitch Chat Relay</h3>

        {/* Channel search */}
        <form onSubmit={handleSubmit}>
          <div className='flex-row'>
            <input type='text' value={name} onChange={(e) => setName(e.target.value)}
              placeholder='Channel Name' className='w-100 right-flat' />
            <input type='submit' value='Relay' className='btn submit-btn left-flat width' />
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
          <button type='button' className='btn left-flat width'
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
              className='btn left-flat width'
              onClick={() => {
                applyFilter(whitelist, setWhiteListArray);
                applyFilter(blacklist, setBlacklistArray);
              }}>Apply</button>
          </div>

          {/* Subscriber only */}
          <div className='margin-bottom'>
            <input type='checkbox' value={subOnly} onChange={() => setSubOnly(!subOnly)} />
            <label>Subscriber Only</label>
          </div>
        </div>

        {/* Random / Clear */}
        <div className='flex-row align-content-center'>
          <button type='button'
            className='btn margin-right' onClick={() => findRandomMessage()}>Find Random</button>
          <button type='button'
            className='btn align-self-center' onClick={() => clearChat()}>Clear Chat</button>
        </div>
      </div>

      {/* Chatbox */}
      <div className='flex-column'>
        <p className={`connect-msg ${loading ? '' : 'd-none'}`}>Connecting...</p>
        <ul
          ref={chatbox} className='chatbox' style={{ overflow: mousedOverChat ? 'auto' : 'hidden' }}
          onScroll={(e) => { handleScroll(e.target) }}
          onMouseEnter={() => setMousedOverChat(true)}
          onMouseLeave={() => setMousedOverChat(false)}
        />
        <button type="button"
          className={`btn scroll-bottom-btn align-self-center ${scrolledBottom ? 'd-none' : ''}`}
          onClick={() => scrollToBottom()}
        >
          {'\u{1F847}'} Scroll to Bottom
        </button>
      </div>

    </div>
  );
}

export default App;
