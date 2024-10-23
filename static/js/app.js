// app.js

const { useState } = React;

function App() {
    const [inputValue, setInputValue] = useState("");

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSearch = () => {
        console.log("Szukasz:", inputValue);
        // Tu dodaj logikę do wyszukiwania
    };

    return (
        <div>
            <h1>Witaj w aplikacji!</h1>
            <input type="text" value={inputValue} onChange={handleInputChange} />
            <button onClick={handleSearch}>Szukaj</button>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
