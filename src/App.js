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

  const [subOnly, setSubOnly] = useState(false);

  const [scrolledBottom, setScrolledBottom] = useState(true);
  const [mousedOverChat, setMousedOverChat] = useState(false);

  // Initialise client
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
        (includesArray.length > 0 && !includesArray.some(word => message.includes(word))) ||
        excludesArray.some(word => message.includes(word))
      )
        return console.log(message)
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
  }, [client, scrolledBottom, includesArray, excludesArray, subOnly]);

  // Includes/Excludes filter
  const applyCludes = () => {
    if (includes === '' || !includes.replace(/\s/g, '').length)
      setIncludesArray([]);
    else
      setIncludesArray(includes.replace(/\s*,\s*/g, ',').split(','));

    if (excludes === '' || !excludes.replace(/\s/g, '').length)
      setExcludesArray([]);
    else
      setExcludesArray(excludes.replace(/\s*,\s*/g, ',').split(','));
  }

  const clearChat = () => {
    chatbox.current.replaceChildren();
  }

  const handleScroll = (e) => {
    setScrolledBottom(Math.abs(e.scrollHeight - e.clientHeight - e.scrollTop) < 1)
  }

  const scrollToBottom = () => {
    chatbox.current.scrollTop = chatbox.current.scrollHeight;
  }

  const findRandomMessage = () => {
    const messages = chatbox.current.childNodes;
    if (messages.length > 0) {
      const message = messages[Math.floor(Math.random() * messages.length)];
      message.lastElementChild.classList.add('highlight')
      message.scrollIntoView();
    }
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

        <h4>Filters</h4>

        {/* Includes/Excludes */}
        <div className='flex-row'>
          <div>
            <input type='text' value={includes} onChange={(e) => { setIncludes(e.target.value) }}
              placeholder='Includes' className='w-100 bottom-flat right-flat magnet-bottom' />
            <input type='text' value={excludes} onChange={(e) => setExcludes(e.target.value)}
              placeholder='Excludes' className='w-100 right-flat top-flat' />
          </div>
          <button type='button'
            className='btn left-flat width' onClick={() => applyCludes()}>Apply</button>
        </div>

        {/* Subscriber only */}
        <div className='margin-bottom'>
          <input type='checkbox' value={subOnly} onChange={() => setSubOnly(!subOnly)} />
          <label>Subscriber Only</label>
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
