import { useState } from 'react';
import './App.css';

function Profiles({ channelName, includes, excludes, whitelist, blacklist, subOnly, cancelButton }) {
    const [saveName, setSaveName] = useState('');

    const handleSave = (e) => {
        e.preventDefault();
        const value = {
            channelName,
            includes,
            excludes,
            whitelist,
            blacklist,
            subOnly
        };
        localStorage.setItem(saveName, JSON.stringify(value));
        setSaveName('');
    };

    return (
        <>
            <form onSubmit={handleSave}>
                <div className='flex-row'>
                    <input type='text' value={saveName} onChange={(e) => setSaveName(e.target.value)}
                        placeholder='New Save' className='w-100 right-flat' />
                    <input type='submit' value='Save' className='btn left-flat width' />
                </div>
            </form>

            <h4>Saved Filters</h4>

            <div className='flex-column'>
                {localStorage.length > 0 ? Object.keys(localStorage).map((key) => {
                    const item = localStorage.getItem(key);
                    return (
                        <button className='btn' key={key}>{key}</button>
                    );
                }) : <p>No filters saved</p>}
            </div>

            {/* <button onClick={() => window.localStorage.clear()}>Delete</button> */}
            <button type='button' className='link-btn row-end' onClick={() => { cancelButton(); setSaveName(''); }}>
                {'\u{1f844}'} Return
            </button >
        </>
    );
}

export default Profiles;