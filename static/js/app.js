const { useState, useEffect } = React;

function App() {
    const [inputValue, setInputValue] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = React.useRef(null);

    useEffect(() => {

        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; 
            recognitionRef.current.interimResults = false; 
            recognitionRef.current.lang = 'pl-PL';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript; 

                
                setInputValue(transcript); 
                console.log('Wynik rozpoznawania: ', transcript);
                setIsListening(false); 
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Błąd rozpoznawania: ", event.error);
                setIsListening(false);
            };
        } else {
            console.error("Rozpoznawanie mowy nie jest obsługiwane w tej przeglądarce.");
        }

        return () => {
            
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };


    const handleVoiceSearch = () => {
        if (isListening) {
            recognitionRef.current.stop(); 
        } else {
            recognitionRef.current.start();
            setIsListening(true) 
        }
    };

    return (
        <div>
            <h1>Witaj w aplikacji!</h1>
            <div className="two_inputs">
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={handleInputChange} 
                    placeholder="Wprowadź tekst" 
                    style={{ flex: 1, marginRight: '10px' }} 
                />
                <button onClick={handleVoiceSearch} className={`mic-toggle ${isListening ? 'pulsating' : ''}`}>
                <span class="material-symbols-outlined">mic</span> 
                </button>
            </div>
        </div>
    );
}

// Renderuj aplikację
ReactDOM.render(<App />, document.getElementById('root'));
