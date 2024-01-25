//import necessary modules

import React, { useState, useEffect,useRef  } from 'react';
import { StyleSheet, StatusBar, Animated, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import backgroundImage from './assets/aavamobile.jpg'; 
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

//define the App function and variables 
export default function App() {
  const clockOpacity = useRef(new Animated.Value(1)).current; // Initial opacity is 1
  const [time, setTime] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [gameState, setGameState] = useState('ready');
  const [countdown, setCountdown] = useState(null);
  const [playCount, setPlayCount] = useState(0);
  const gameResetTimeout = useRef(null);
  const [winCount, setWinCount] = useState(0);
  const [lastTouch, setLastTouch] = useState(0);

//define the playSound function to play the sound files
  async function playSound(soundFile) {
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        await sound.unloadAsync();
      }
    });
  }
  //define the updatePlayCount and updateWinCount functions to update the playCount and winCount variables
  const updatePlayCount = async (newCount) => {
    setPlayCount(newCount);
    await AsyncStorage.setItem('playCount', JSON.stringify(newCount));
  };
  
  const updateWinCount = async (newCount) => {
    setWinCount(newCount);
    await AsyncStorage.setItem('winCount', JSON.stringify(newCount));
  };
  //define the useEffect function to load the playCount and winCount variables from the AsyncStorage
  useEffect(() => {
    const loadCounts = async () => {
      const savedPlayCount = await AsyncStorage.getItem('playCount');
      const savedWinCount = await AsyncStorage.getItem('winCount');
  
      if (savedPlayCount !== null) {
        setPlayCount(JSON.parse(savedPlayCount));
      }
  
      if (savedWinCount !== null) {
        setWinCount(JSON.parse(savedWinCount));
      }
    };
  
    loadCounts();
  }, []);
  //define the useEffect function to update the time variable
  useEffect(() => {
    let interval = null;
  
    if (timerOn) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 0.01); // increment time
      }, 10);
    } else {
      clearInterval(interval);
    }
  
    return () => clearInterval(interval);
  }, [timerOn]);
  
//define the startGame function to start the game
  const startGame = () => {
    // Increment the play count
    updatePlayCount(playCount + 1);

    // Clear any existing timeout to reset the game
    clearTimeout(gameResetTimeout.current);
  
    // Reset the clock opacity for a new game
    clockOpacity.setValue(1);
  
    // Reset the game state and start a new game
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
  
        // Start fading out the clock as the game starts
        Animated.timing(clockOpacity, {
          toValue: 0, // Fade to completely transparent
          duration: 23000, // Duration of the fade 23 real time seconds
          useNativeDriver: true, // Enable native driver for better performance
        }).start();
      }
    }, 1000);
  };
  
  
  
  
  //define the stopClock function to stop the clock
  const stopClock = async () => {
    setTimerOn(false);
  
    // Check if the time is within the hidden tolerance range
    if (time >= 14.95 && time <= 15.05) {
      setGameState('won');
      updateWinCount(winCount + 1);
      await playSound(require('./assets/sounds/winSound.mp3'));
      setTime(15.00); // Display 15:00 regardless of actual stop time
    } else {
      setGameState('lost');
      await playSound(require('./assets/sounds/loseSound.mp3'));
      // Display the actual stop time if the player loses
    }
    
    // Stop the fading animation and reset opacity
    clockOpacity.stopAnimation();
    clockOpacity.setValue(1);
  
    // Set a timeout to reset the game after 10 seconds
    gameResetTimeout.current = setTimeout(() => {
      resetGame();
    }, 10000); // 10000 milliseconds = 10 seconds
  };
  
  
  

  
  //define the resetGame function to reset the game automatically if not reset by the player
  const resetGame = () => {
    setTime(0);
    setGameState('ready');
    clockOpacity.setValue(1); // Ensure the clock is visible again for the next game
    // Ensure to clear countdown or any other state you need to reset
    gameResetTimeout.current = null;
  };
  //define the formatTime function to format the time variable to display in the clock
  const formatTime = (timeInSeconds) => {
    const seconds = Math.floor(timeInSeconds);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);  // Get two digits for milliseconds
  
    return `${seconds < 10 ? '0' : ''}${seconds}:${milliseconds < 10 ? '0' : ''}${milliseconds}`;
  };
  //define the resetPlayCount function to reset the playCount counter
  const resetPlayCount = () => {
    setPlayCount(0);
    setWinCount(0);
  };
  
  //define the return function to return the JSX code
  return (
    <>
    <StatusBar hidden={true} />
    <TouchableOpacity 
  style={styles.container} 
  onPress={() => {
    const now = Date.now();
    if (now - lastTouch > 4000) { // Debounce touch period of 4000 milliseconds to prevent accidental taps
      setLastTouch(now);

      if (gameState === 'playing') {
        stopClock();
      } else {
        startGame();
      }
    }
  }} 
  activeOpacity={1}
>
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      
      {/* Message container at the top */}
      <View style={styles.messageContainerTop}>
        {gameState === 'won' && <Text style={styles.messagewinner}>SUCCESS!</Text>}
        {gameState === 'lost' && <Text style={styles.messagefailure}>FAILURE</Text>}
      </View>
{/* Message container at the bottom, hidden when game is running */}
<View style={styles.messageContainerBottoms}>
  {gameState !== 'playing' && (
    <>
      {/* Display the number of games played */}
      <Text style={styles.playCounter}>Games Played: {playCount}</Text>
      <Text style={styles.winCounter}>Games Won: {winCount}</Text> 

      {/* Reset counter button */}
      <TouchableOpacity onPress={resetPlayCount} style={styles.counterResetButton}>
      <Text style={styles.resetButtonText}>Reset{"\n"}Counters</Text>
      </TouchableOpacity>
    </>
  )}
</View>


{/* Main content */}
<View style={styles.mainContent}>
  {countdown !== null ? (
    <Text style={styles.countdownText}>{countdown}</Text>
  ) : (
    <>
      {(gameState === 'playing' || gameState === 'won' || gameState === 'lost') && (
        <Animated.Text style={[styles.clock, { opacity: clockOpacity }]}>
          {formatTime(time)}
        </Animated.Text>
      )}
    </>
  )}
</View>


      {/* Message container at the bottom, containing the main objective */}
      
        <View style={styles.messageContainerBottom}>
          <Text style={styles.messageguide}>Tap the Screen to stop the Timer at 15:00!</Text>
        </View>
      

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
    backgroundColor: 'rgba(0, 0, 0, 0.001)', // Semi-transparent black background
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
  messageContainerBottoms: {
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
    paddingBottom: 50,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCounter: {
    position: 'absolute',
    textAlign: 'center',
    bottom: 10, 
    fontSize: 18, 
    color: 'black',
  },
  
  winCounter: {
    position: 'absolute',
    bottom: -10, 
    textAlign: 'center',
    fontSize: 18,
    color: 'black',
  },
  
  counterResetButton: {
    position: 'absolute',
    bottom: -20,
    right: 5,
    padding: 5, 
    backgroundColor: 'transparent', 
  },
  
  resetButtonText: {
    fontSize: 6, 
    color: 'white',
  },
  


});