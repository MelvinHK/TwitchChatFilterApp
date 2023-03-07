import './App.css';
import { useState, useEffect, useRef } from 'react';
import tmi from 'tmi.js';

function App() {
  const chatbox = useRef(null);
  const [name, setName] = useState('');
  const [client, setClient] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    chatbox.current.innerHTML = '';
    setClient(new tmi.Client({
      channels: [name]
    }));
  }

  useEffect(() => {
    if (!client)
      return;

    client.connect();

    const handleNewMessage = (channel, tags, message, self) => {
      const newMessage = document.createElement('li');
      newMessage.setAttribute('id', tags.id)
      console.log(tags.color)
      newMessage.innerHTML = `<span style='color:${tags.color};'>${tags['display-name']}</span>: ${message}`;
      chatbox.current.insertBefore(newMessage, chatbox.current.firstChild);
    }

    client.on('message', handleNewMessage);

    return () => {
      client.disconnect();
      client.off('message', handleNewMessage)
    }
  }, [client]);

  return (
    <div className='flex-container'>
      <div className='util-column'>
        <form onSubmit={handleSubmit}>
          <h3>Twitch Chat Relay</h3>
          <div className='flex-container'>
            <input type='text' value={name} onChange={(e) => setName(e.target.value)}
              placeholder='Channel Name' className='channel-search' />
            <input type='submit' className='submit-btn' />
          </div>
        </form>
      </div>
      <ul ref={chatbox} className='chatbox' />
    </div>
  );
}

export default App;
