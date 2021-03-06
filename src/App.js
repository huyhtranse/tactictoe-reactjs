/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Form from "./components/Form";
import Player from "./components/Player";
import Board from "./components/Board";
import Alert from "./components/Alert";
import History from "./components/History";
import { database } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const App = () => {
  const [toggleForm, setToggleForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(0);
  const [activatedPlayers, setActivatedPlayer] = useState(1);
  const [validationName, setValidationName] = useState(false);
  const [startGame, setStartGame] = useState(false);
  const [alert, setAlert] = useState(false);
  const [endGame, setEndGame] = useState(false);
  const [playerWin, setPlayerWin] = useState(0);
  let [countTick, setCountTick] = useState(0);
  const [matrix, setMatrix] = useState([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [players, setPlayers] = useState([
    {
      name: "",
      symbol: "X",
    },
    {
      name: "",
      symbol: "O",
    },
  ]);
  const collectionRef = collection(database, "historyGame");

  useEffect(() => {
    if (endGame) {
      addDoc(collectionRef, {
        playerWin: players[playerWin - 1].name,
        playerLose: players[(playerWin === 1 ? 2 : 1) - 1].name,
      })
        .then(() => console.log("Success"))
        .catch(() => console.log("Fail"));
    }
  }, [endGame]);

  useEffect(() => {
    if (matrix) {
      checkGame();
    }
  }, [matrix]);

  const onConfirm = (name, e) => {
    e.preventDefault();
    const numberPlayer = selectedPlayer - 1;

    if (name.trim() === "") {
      setValidationName(true);
      return;
    }

    if (numberPlayer > -1) {
      const mainPlayers = [...players];
      const updatingPlayer = { ...mainPlayers[numberPlayer] };

      updatingPlayer.name = name;
      mainPlayers[numberPlayer] = updatingPlayer;
      setPlayers([...mainPlayers]);
    }
    setToggleForm(false);
    setValidationName(false);
  };

  const onEdit = (numberPlayer) => {
    setToggleForm(true);
    setSelectedPlayer(numberPlayer);
  };

  const onCancel = () => {
    setToggleForm(false);
    setValidationName(false);
  };

  const onStart = () => {
    if ((players[0].name || players[1].name) === "") {
      setAlert(true);
      return;
    }

    setStartGame(true);
    setEndGame(false);
    setPlayerWin(0);
    setActivatedPlayer(1);
    setCountTick(0);
    setMatrix([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
  };

  const onClose = () => {
    setAlert(false);
  };

  const onTick = (r, c, e) => {
    const col = +c;
    const row = +r;
    if (matrix[row][col] !== 0 || e.target.innerText !== "" || endGame) {
      return;
    }
    const mainMatrix = [...matrix];
    const updatingRow = [...mainMatrix[row]];

    updatingRow[col] = activatedPlayers;
    mainMatrix[row] = updatingRow;

    setMatrix([...mainMatrix]);
    setCountTick(countTick + 1);
    if (activatedPlayers === 1) {
      setActivatedPlayer(2);
    } else {
      setActivatedPlayer(1);
    }
  };

  const checkGame = () => {
    for (let i = 0; i < 3; i++) {
      if (
        matrix[i][0] === matrix[i][1] &&
        matrix[i][1] === matrix[i][2] &&
        matrix[i][1] !== 0
      ) {
        setEndGame(true);
        setPlayerWin(matrix[i][2]);
      }

      if (
        matrix[0][i] === matrix[1][i] &&
        matrix[1][i] === matrix[2][i] &&
        matrix[1][i] !== 0
      ) {
        setEndGame(true);
        setPlayerWin(matrix[2][1]);
      }

      if (
        ((matrix[0][0] === matrix[1][1] && matrix[1][1] === matrix[2][2]) ||
          (matrix[2][0] === matrix[1][1] && matrix[0][2] === matrix[1][1])) &&
        matrix[1][1] !== 0
      ) {
        setEndGame(true);
        setPlayerWin(matrix[1][1]);
      }

      if (countTick === 9) {
        setPlayerWin(-1);
      }
    }
  };

  return (
    <Router>
      <Header onCancel={onCancel} toggleForm={toggleForm} />
      <nav>
        <ul>
          <NavLink to="/" className={(navData) => navData.isActive ? "active" : "" }>Game</NavLink>
          <NavLink to="/history" className={(navData) => navData.isActive ? "active" : "" }>History</NavLink>
        </ul>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <main>
                <Form
                  toggleForm={toggleForm}
                  onConfirm={onConfirm}
                  onCancel={onCancel}
                  validationName={validationName}
                />
                <Player players={players} onEdit={onEdit} onStart={onStart} />
                <Board
                  startGame={startGame}
                  activatedPlayers={activatedPlayers}
                  players={players}
                  matrix={matrix}
                  playerWin={playerWin}
                  countTick={countTick}
                  onTick={onTick}
                />
                {alert && <Alert onClose={onClose} />}
              </main>
            </>
          }
        />
        <Route path="history" element={<History collectionRef={collectionRef}/>} />
      </Routes>
    </Router>
  );
};

export default App;
