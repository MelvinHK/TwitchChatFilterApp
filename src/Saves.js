import { useState, useReducer } from 'react';
import './App.css';

function Profiles({ getSave, channelName, includes, excludes, whitelist, blacklist, subOnly, cancelButton }) {
    const [saveName, setSaveName] = useState('');

    const forceUpdate = useReducer(x => x + 1, 0)[1];

    const handleSave = (e) => {
        e.preventDefault();

        if (saveName === '' || !saveName.replace(/\s/g, '').length)
            return alert('Please input save name.');

        for (let key of Object.keys(localStorage))
            if (saveName.trim() === key && !window.confirm('Save name already exists. Overwrite?'))
                return;

        const value = {
            channelName,
            includes,
            excludes,
            whitelist,
            blacklist,
            subOnly
        };
        localStorage.setItem(saveName.trim(), JSON.stringify(value));
        setSaveName('');
    };

    const handleReturn = () => {
        cancelButton();
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
                    return (
                        <div key={key} className='flex-row'>
                            <button type='button' className='btn savelist-btn bg-white right-flat'
                                onClick={() => { getSave(JSON.parse(localStorage.getItem(key))); handleReturn(); }}>
                                {key}
                            </button>
                            <button type='button' className='btn delete-btn bg-white left-flat side-btn'
                                onClick={() => { localStorage.removeItem(key); forceUpdate(); }}>
                                {'\u{1F7AD}'}
                            </button>
                        </div>
                    );
                }) : <p>No filters saved</p>}
            </div>

            <button type='button' className='link-btn row-end' onClick={() => handleReturn()}>
                {'\u{1f844}'} Return
            </button >
        </>
    );
}

export default Profiles;