import { useState, useReducer } from 'react';
import './App.css';

function Profiles({ channelName, includes, excludes, whitelist, blacklist, subOnly, cancelButton }) {
    const [saveName, setSaveName] = useState('');

    const forceUpdate = useReducer(x => x + 1, 0)[1];

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
                    <input type='submit' value='Save' className='btn left-flat side-btn' />
                </div>
            </form>

            <h4>Saved Filters</h4>

            <div className='flex-column overflow'>
                {localStorage.length > 0 ? Object.keys(localStorage).map((key) => {
                    const item = localStorage.getItem(key);
                    return (
                        <div key={key} className='flex-row'>
                            <button className='btn w-100 right-flat'>{key}</button>
                            <button className='btn left-flat side-btn' onClick={() => { localStorage.removeItem(key); forceUpdate(); }}>
                                {'\u{1F7AD}'}
                            </button>
                        </div>
                    );
                }) : <p>No filters saved</p>}
            </div>

            <button type='button' className='link-btn row-end' onClick={() => { cancelButton(); setSaveName(''); }}>
                {'\u{1f844}'} Return
            </button >
        </>
    );
}

export default Profiles;