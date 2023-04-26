import './App.css';

function Profiles({ cancelButton }) {
    return (
        <>
            <h4>Save Filter</h4>
            <button className='btn' onClick={cancelButton}>Cancel</button>
        </>
    );
}

export default Profiles;