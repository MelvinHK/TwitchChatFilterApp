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

  const [scrolledBottom, setScrolledBottom] = useState(true);
  const [mousedOverChat, setMousedOverChat] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearChat();
    setClient(new tmi.Client({
      channels: [name]
    }));
  }

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

  useEffect(() => {
    if (!client)
      return;

    const handleNewMessage = (channel, tags, message, self) => {
      if ((includesArray.length > 0 && !includesArray.some(word => message.includes(word))) || excludesArray.some(word => message.includes(word)))
        return //console.log(message)
      const newMessage = document.createElement('li');
      newMessage.setAttribute('id', tags.id);
      newMessage.innerHTML = `<span style='color:${tags.color};'>${tags['display-name']}</span>: ${message}`;
      chatbox.current.appendChild(newMessage);
      if (scrolledBottom)
        chatbox.current.scrollTop = chatbox.current.scrollHeight;
    }

    client.on('message', handleNewMessage);

    return () => {
      client.off('message', handleNewMessage);
    }
  }, [client, scrolledBottom, includesArray, excludesArray]);

  useEffect(() => {
    if (includes !== '')
      setIncludesArray(includes.replace(/\s/g, '').split(','));
    else
      setIncludesArray([])
  }, [includes]);

  useEffect(() => {
    if (excludes !== '')
      setExcludesArray(excludes.replace(/\s/g, '').split(','));
    else
      setExcludesArray([])
  }, [excludes]);

  const clearChat = () => {
    chatbox.current.replaceChildren();
  }

  const handleScroll = (e) => {
    setScrolledBottom(Math.abs(e.scrollHeight - e.clientHeight - e.scrollTop) < 1)
  }

  const scrollToBottom = () => {
    chatbox.current.scrollTop = chatbox.current.scrollHeight;
  }

  return (
    <div className='flex-row'>

      {/* Utility column */}
      <div className='util-column flex-column'>
        <h3>Twitch Chat Relay</h3>
        {/* Channel search */}
        <form onSubmit={handleSubmit}>
          <div className='flex-row'>
            <input type='text' value={name} onChange={(e) => setName(e.target.value)}
              placeholder='Channel Name' className='flex-grow right-flat' />
            <input type='submit' className='btn submit-btn left-flat' />
          </div>
        </form>
        <h4>Filters</h4>
        {/* Includes/Excludes */}
        <div className='flex-row'>
          <input type='text' value={includes} onChange={(e) => { setIncludes(e.target.value) }}
            placeholder='Includes' className='w-50 right-flat' />
          <input type='text' value={excludes} onChange={(e) => setExcludes(e.target.value)}
            placeholder='Excludes' className='w-50 left-flat' />
        </div>
        <button type="button"
          className='btn align-center' onClick={() => clearChat()}>Clear Chat</button>
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
          className={`btn scroll-bottom-btn align-center ${scrolledBottom ? 'd-none' : ''}`}
          onClick={() => scrollToBottom()}
        >
          {'\u{1F847}'} Scroll to Bottom
        </button>
      </div>

    </div>
  );
}

export default App;
