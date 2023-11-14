import React, { useState, useEffect } from 'react';
import { StyleSheet,StatusBar, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import backgroundImage from './assets/aavamobile.jpg'; 


export default function App() {
  const [time, setTime] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [gameState, setGameState] = useState('ready');
  const [countdown, setCountdown] = useState(null);
  let gameResetTimeout;

  useEffect(() => {
    let interval = null;
  
    if (timerOn) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 0.1); // increment time
      }, 100);
    } else {
      clearInterval(interval);
    }
  
    return () => clearInterval(interval);
  }, [timerOn]);
  

  const startGame = () => {
    clearTimeout(gameResetTimeout);
    // Stop the current game and reset the clock
    setTimerOn(false);
    setTime(0);
    setGameState('ready');
  
    // Start the countdown for the new game
    let count = 3;
    setCountdown(count);
    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        setTimerOn(true);
        setCountdown(null);
        setGameState('playing');
      }
    }, 1000);
  };
  
  
  
  
  const stopClock = () => {
    setTimerOn(false);
    if (time >= 13.99 && time <= 14.01) {
      setGameState('won');
    } else {
      setGameState('lost');
    }
  
    // Set a timeout to reset the game after 10 seconds
    setTimeout(() => {
      resetGame();
    }, 15000); // 10000 milliseconds = 10 seconds
  };
  
  const resetGame = () => {
    setTime(0);
    setGameState('ready');
    // Ensure to clear countdown or any other state you need to reset
  };
  
  const formatTime = (timeInSeconds) => {
    const seconds = Math.floor(timeInSeconds);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);  // Get two digits for milliseconds
  
    return `${seconds < 10 ? '0' : ''}${seconds}:${milliseconds < 10 ? '0' : ''}${milliseconds}`;
  };
  
  
  
  return (
    <>
    <StatusBar hidden={true} />
    <TouchableOpacity style={styles.container} onPress={stopClock} activeOpacity={1}>
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      
      {/* Message container at the top */}
      <View style={styles.messageContainerTop}>
        {gameState === 'won' && <Text style={styles.messagewinner}>SUCCESS!</Text>}
        {gameState === 'lost' && <Text style={styles.messagefailure}>FAILURE</Text>}
      </View>

      {/* Main content */}
      <View style={styles.mainContent}>
        {countdown !== null ? (
          <Text style={styles.countdownText}>{countdown}</Text>
        ) : (
          <>
            {(gameState === 'playing' || gameState === 'won' || gameState === 'lost') && (
              <Text style={styles.clock}>{formatTime(time)}</Text>
            )}
            {gameState !== 'playing' && (
              <TouchableOpacity onPress={startGame} style={styles.button}>
                <Text style={styles.buttonText}>Play</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Message container at the bottom */}
      {gameState !== 'playing' && (
        <View style={styles.messageContainerBottom}>
          <Text style={styles.messageguide}>Tap the Screen to stop the clock at 14 seconds!</Text>
        </View>
      )}

    </ImageBackground>
  </TouchableOpacity>
    </>

  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2, // Width of the border
    borderColor: 'gray', // Color of the border
    borderRadius: 10, // Rounded corners for the border
    padding: 0, // Padding inside the border
    margin: 0.1, // Margin around the border
    
  },
  button: {
    padding: 10,
    backgroundColor: 'blue',
    margin: 5,
    borderRadius: 10,

  },
  clock: {
    fontSize: 80,
    marginBottom: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.01)', // Semi-transparent black background
    color: 'black', // White color for the text
    paddingHorizontal: 20, // Horizontal padding
    paddingVertical: 10, // Vertical padding
    borderRadius: 10, // Rounded corners
    overflow: 'hidden', // Ensures the background respects the border radius
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainerBottom: {
    position: 'absolute',
    bottom: 20, // Place the container 20 pixels from the bottom
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  messageguide: {
    fontSize: 35,
    color: 'blue',
    textAlign: 'center',
  },
  messageContainerTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 20, // Adjust this value as needed
  },
  messagewinner: {
    fontSize: 75,
    color: 'green',
  },
  messagefailure: {
    fontSize: 84,
    color: 'red',
  },
  countdownText: {
    fontSize: 84,
  },
  buttonText: {
    color: 'white',
    fontSize: 34,
  alignItems: 'center',
  },
  mainContent: {
    // Adjust layout as needed
    alignItems: 'center',
    justifyContent: 'center',
  },
});
