const { useState, useEffect } = React;

function App() {
    const sessionID = uuid.v4();
    const [inputValue, setInputValue] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = React.useRef(null);
    const [transcript, setTranscript] = useState("");
    const [response, setResponse] = useState("")

    const [isTalking, setIsTalking] = useState(true);

    useEffect(() => {

        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; 
            recognitionRef.current.interimResults = false; 
            recognitionRef.current.lang = 'pl-PL';

            recognitionRef.current.onresult = (event) => {
                const recognizedText = event.results[0][0].transcript; 
                console.log('Wynik rozpoznawania: ', recognizedText);
                setTranscript(recognizedText); 
                setIsListening(false); 
                sendTextToServer(recognizedText); 
                sendNothingToServer();
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
    }, [transcript]);
    

    const sendTextToServer = (text) => {
        fetch("/prompt_ttt", {  
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                prompt: text,         
                session_id: sessionID 
            }),
        })
        .then(response => response.text()) 
        .then(data => {
            console.log("Odpowiedź z serwera:", data);
            setResponse(data);
            
            setTranscript(""); 
            setInputValue(""); 

        })
        .catch(error => {
            console.error("Błąd podczas wysyłania do serwera:", error);
        });
    };

    const sendNothingToServer = () => {
        fetch("/prompt_tts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ session_id: sessionID }),
        })
        .then(response => {
            if (response.ok) {
                return response.blob();  
            } else {
                throw new Error("Błąd podczas odbierania odpowiedzi audio");
            }
        })
        .then(blob => {
            const audioUrl = URL.createObjectURL(new Blob([blob], { type: "audio/opus" })); 
            const audio = new Audio(audioUrl);
            audio.play()
        .then(() => console.log("Odtwarzanie audio rozpoczęte"))
        .catch(err => console.error("Problem z odtwarzaniem audio:", err));
        })
        .catch(error => {
            console.error("Błąd podczas odbierania odpowiedzi audio:", error);
        });
    };

    const handleArrowClick = () => {
        sendTextToServer(inputValue);
        sendNothingToServer();
    };

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
            <div className="wrap"> 
              <div className="face">
                <div className="eye left-eye">
                  <div className="ratina"></div>
                </div>
                <div className="eye right-eye">
                  <div className="ratina"></div>
                </div>
                <div className="mouth">
                  <div className={`mouth_impression ${isTalking ? "talking" : ""}`}></div>
                </div>
                {response && (
                    <div className="response-bubble">
                        {response}
                        <button className="close-button" onClick={() => setResponse('')}>
                            X
                        </button>
                    </div>
                )}
              </div>
            </div>
            <div className="two_inputs">
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={handleInputChange} 
                    placeholder="Wprowadź tekst"  
                />
                <button className="arrow-button" onClick={handleArrowClick}>
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button onClick={handleVoiceSearch} className={`mic-toggle ${isListening ? 'pulsating' : ''}`}>
                    <span class="material-symbols-outlined">mic</span> 
                </button>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
