import './App.css';
import { useState, useEffect, useRef } from 'react';
import tmi from 'tmi.js';

function App() {
  const chatbox = useRef(null);
  const [name, setName] = useState('');
  const [client, setClient] = useState();
  const [loading, setLoading] = useState();
  const [scrolledBottom, setScrolledBottom] = useState(true);
  const [mousedOverChat, setMousedOverChat] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    chatbox.current.replaceChildren();
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
  }, [client, scrolledBottom])

  const handleScroll = (e) => {
    if (Math.abs(e.scrollHeight - e.clientHeight - e.scrollTop) < 1)
      setScrolledBottom(true)
    else
      setScrolledBottom(false)
  }

  const scrollToBottom = () => {
    chatbox.current.scrollTop = chatbox.current.scrollHeight;
  }

  return (
    <div className='flex-container'>
      <div className='util-column'>
        <form onSubmit={handleSubmit}>
          <h3>Twitch Chat Relay</h3>
          <div className='flex-container'>
            <input type='text' value={name} onChange={(e) => setName(e.target.value)}
              placeholder='Channel Name' className='channel-search' />
            <input type='submit' className='btn submit-btn' />
          </div>
        </form>
      </div>
      <div className='chatbox-div'>
        <p className={`connect-msg ${loading ? '' : 'd-none'}`}>Connecting...</p>
        <ul
          ref={chatbox} className='chatbox' style={{ overflow: mousedOverChat ? 'auto' : 'hidden' }}
          onScroll={(e) => { handleScroll(e.target) }}
          onMouseEnter={() => setMousedOverChat(true)}
          onMouseLeave={() => setMousedOverChat(false)}
        />
        <button
          className={`btn scroll-bottom-btn ${scrolledBottom ? 'd-none' : ''}`}
          onClick={() => scrollToBottom()}
        >
          {'\u{1F847}'} Scroll to bottom
        </button>
      </div>
    </div>
  );
}

export default App;
