import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, ArrowLeft, Crown, Medal, Award, Gamepad2, RotateCw } from 'lucide-react';

// Telegram WebApp API
const initTelegramUser = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.ready();
    return {
      id: tg.initDataUnsafe?.user?.id,
      username: tg.initDataUnsafe?.user?.username || 'Player',
      first_name: tg.initDataUnsafe?.user?.first_name || 'Guest'
    };
  }
  return null;
};

// Snake Game Component
const SnakeGame = ({ onGameEnd, onRestart, user }) => {
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState('RIGHT');
  const [nextDirection, setNextDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gridSize = 15;
  const gameEndedRef = useRef(false);

  const generateFood = useCallback(() => {
    let newFood;
    let attempts = 0;
    do {
      newFood = [
        Math.floor(Math.random() * gridSize),
        Math.floor(Math.random() * gridSize)
      ];
      attempts++;
    } while (
      attempts < 100 &&
      snake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1])
    );
    return newFood;
  }, [snake]);

  useEffect(() => {
    if (gameOver || !snake.length) return;

    const moveSnake = () => {
      setDirection(nextDirection);
      
      setSnake(prev => {
        const newSnake = [...prev];
        const head = [...newSnake[0]];

        switch (nextDirection) {
          case 'UP': head[1] -= 1; break;
          case 'DOWN': head[1] += 1; break;
          case 'LEFT': head[0] -= 1; break;
          case 'RIGHT': head[0] += 1; break;
        }

        if (head[0] < 0 || head[0] >= gridSize || head[1] < 0 || head[1] >= gridSize) {
          if (!gameEndedRef.current) {
            gameEndedRef.current = true;
            setGameOver(true);
          }
          return prev;
        }

        for (let segment of newSnake) {
          if (segment[0] === head[0] && segment[1] === head[1]) {
            if (!gameEndedRef.current) {
              gameEndedRef.current = true;
              setGameOver(true);
            }
            return prev;
          }
        }

        newSnake.unshift(head);

        if (head[0] === food[0] && head[1] === food[1]) {
          setScore(s => s + 50);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [nextDirection, food, gameOver, generateFood, snake.length]);

  useEffect(() => {
    if (gameOver && !gameEndedRef.current) {
      gameEndedRef.current = true;
      setTimeout(() => {
        onGameEnd('snake', score);
      }, 100);
    }
  }, [gameOver, score, onGameEnd]);

  const handleRestart = () => {
    setSnake([[10, 10]]);
    setFood([15, 15]);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    gameEndedRef.current = false;
    onRestart();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div className="flex gap-6 items-center justify-center w-full">
        <div className="text-2xl md:text-3xl font-bold text-yellow-400">🏆 {score}</div>
        <div className="text-base md:text-lg text-gray-300">Длина: {snake.length}</div>
      </div>
      
      <div className="bg-gray-900 p-1 md:p-2 rounded-xl shadow-2xl w-full">
        <div 
          className="mx-auto"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gap: '1px',
            background: '#0a0a0a',
            padding: '2px',
            maxWidth: '400px',
            aspectRatio: '1/1'
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const isSnake = snake.some(s => s[0] === x && s[1] === y);
            const isFood = food[0] === x && food[1] === y;
            const isHead = snake[0][0] === x && snake[0][1] === y;

            return (
              <div
                key={i}
                className="transition-colors duration-100"
                style={{
                  width: '100%',
                  paddingBottom: '100%',
                  position: 'relative',
                  backgroundColor: isHead ? '#10b981' : isSnake ? '#34d399' : isFood ? '#ef4444' : '#1f2937',
                  borderRadius: isFood ? '50%' : isSnake ? '2px' : '1px'
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        <div />
        <button 
          onClick={() => direction !== 'DOWN' && setNextDirection('UP')} 
          className="bg-gradient-to-br from-blue-500 to-blue-600 active:from-blue-600 active:to-blue-700 p-4 md:p-5 rounded-lg text-2xl md:text-3xl font-bold shadow-lg active:scale-95 transition touch-manipulation"
        >
          ↑
        </button>
        <div />
        <button 
          onClick={() => direction !== 'RIGHT' && setNextDirection('LEFT')} 
          className="bg-gradient-to-br from-blue-500 to-blue-600 active:from-blue-600 active:to-blue-700 p-4 md:p-5 rounded-lg text-2xl md:text-3xl font-bold shadow-lg active:scale-95 transition touch-manipulation"
        >
          ←
        </button>
        <div />
        <button 
          onClick={() => direction !== 'LEFT' && setNextDirection('RIGHT')} 
          className="bg-gradient-to-br from-blue-500 to-blue-600 active:from-blue-600 active:to-blue-700 p-4 md:p-5 rounded-lg text-2xl md:text-3xl font-bold shadow-lg active:scale-95 transition touch-manipulation"
        >
          →
        </button>
        <div />
        <button 
          onClick={() => direction !== 'UP' && setNextDirection('DOWN')} 
          className="bg-gradient-to-br from-blue-500 to-blue-600 active:from-blue-600 active:to-blue-700 p-4 md:p-5 rounded-lg text-2xl md:text-3xl font-bold shadow-lg active:scale-95 transition touch-manipulation"
        >
          ↓
        </button>
      </div>

      {gameOver && (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 md:p-6 text-center w-full">
          <div className="text-xl md:text-2xl font-bold text-red-400 mb-2">Игра окончена!</div>
          <div className="text-lg md:text-xl text-white mb-2">Финальный счёт: {score}</div>
          <div className="text-sm text-gray-300 mb-4">+{score} очков в рейтинг</div>
          <button
            onClick={handleRestart}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-6 py-3 rounded-lg font-bold shadow-lg active:scale-95 transition touch-manipulation w-full"
          >
            🔄 Играть снова
          </button>
        </div>
      )}
    </div>
  );
};

// Tetris Pieces
const PIECES = {
  I: [[1,1,1,1]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1]],
  S: [[0,1,1],[1,1,0]],
  Z: [[1,1,0],[0,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]]
};

const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
};

const TetrisGame = ({ onGameEnd, onRestart, user }) => {
  const [board, setBoard] = useState(Array(20).fill().map(() => Array(10).fill(0)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [currentType, setCurrentType] = useState(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const gameLoopRef = useRef(null);
  const lastMoveTime = useRef(Date.now());
  const gameEndedRef = useRef(false);

  const getRandomPiece = useCallback(() => {
    const types = Object.keys(PIECES);
    const type = types[Math.floor(Math.random() * types.length)];
    return { type, shape: PIECES[type] };
  }, []);

  const checkCollision = useCallback((piece, pos, currentBoard) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newY = pos.y + y;
          const newX = pos.x + x;
          if (newY >= 20 || newX < 0 || newX >= 10 || (newY >= 0 && currentBoard[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const mergePiece = useCallback(() => {
    if (gameEndedRef.current) return;

    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[y].length; x++) {
        if (currentPiece[y][x] && currentPos.y + y >= 0) {
          newBoard[currentPos.y + y][currentPos.x + x] = currentType;
        }
      }
    }

    let linesCleared = 0;
    const clearedBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (clearedBoard.length < 20) {
      clearedBoard.unshift(Array(10).fill(0));
    }

    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800][linesCleared] * level;
      setScore(s => s + points);
      setLines(l => {
        const newLines = l + linesCleared;
        if (newLines >= level * 10) {
          setLevel(lv => lv + 1);
        }
        return newLines;
      });
    }

    setBoard(clearedBoard);

    const { type, shape } = getRandomPiece();
    const startPos = { x: 4, y: 0 };
    
    if (checkCollision(shape, startPos, clearedBoard)) {
      if (!gameEndedRef.current) {
        gameEndedRef.current = true;
        setGameOver(true);
      }
      return;
    }

    setCurrentPiece(shape);
    setCurrentType(type);
    setCurrentPos(startPos);
  }, [board, currentPiece, currentPos, currentType, level, getRandomPiece, checkCollision]);

  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver || gameEndedRef.current) return;

    const now = Date.now();
    const timeSinceLastMove = now - lastMoveTime.current;
    const minInterval = Math.max(100, 800 - (level - 1) * 50);

    if (timeSinceLastMove < minInterval) {
      return;
    }

    lastMoveTime.current = now;

    const newPos = { ...currentPos, y: currentPos.y + 1 };
    if (checkCollision(currentPiece, newPos, board)) {
      mergePiece();
    } else {
      setCurrentPos(newPos);
    }
  }, [currentPiece, currentPos, board, gameOver, level, checkCollision, mergePiece]);

  const moveHorizontal = useCallback((direction) => {
    if (!currentPiece || gameOver || gameEndedRef.current) return;

    const newPos = { ...currentPos, x: currentPos.x + direction };
    if (!checkCollision(currentPiece, newPos, board)) {
      setCurrentPos(newPos);
    }
  }, [currentPiece, currentPos, board, gameOver, checkCollision]);

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || gameEndedRef.current) return;

    const rotated = currentPiece[0].map((_, i) =>
      currentPiece.map(row => row[i]).reverse()
    );

    if (!checkCollision(rotated, currentPos, board)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, currentPos, board, gameOver, checkCollision]);

  useEffect(() => {
    const { type, shape } = getRandomPiece();
    setCurrentPiece(shape);
    setCurrentType(type);
    setCurrentPos({ x: 4, y: 0 });
  }, [getRandomPiece]);

  useEffect(() => {
    if (gameOver || gameEndedRef.current) return;

    const interval = setInterval(() => {
      moveDown();
    }, 50);

    return () => clearInterval(interval);
  }, [moveDown, gameOver]);

  useEffect(() => {
    if (gameOver && !gameEndedRef.current) {
      gameEndedRef.current = true;
      setTimeout(() => {
        onGameEnd('tetris', score);
      }, 100);
    }
  }, [gameOver, score, onGameEnd]);

  const handleRestart = () => {
    setBoard(Array(20).fill().map(() => Array(10).fill(0)));
    const { type, shape } = getRandomPiece();
    setCurrentPiece(shape);
    setCurrentType(type);
    setCurrentPos({ x: 4, y: 0 });
    setScore(0);
    setLines(0);
    setGameOver(false);
    setLevel(1);
    lastMoveTime.current = Date.now();
    gameEndedRef.current = false;
    onRestart();
  };

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece && !gameOver) {
      for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
          if (currentPiece[y][x] && currentPos.y + y >= 0 && currentPos.y + y < 20) {
            displayBoard[currentPos.y + y][currentPos.x + x] = currentType;
          }
        }
      }
    }

    return displayBoard;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div className="flex gap-4 md:gap-6 text-center justify-center w-full flex-wrap">
        <div>
          <div className="text-2xl md:text-3xl font-bold text-yellow-400">{score}</div>
          <div className="text-xs text-gray-400">Очки</div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-blue-400">{lines}</div>
          <div className="text-xs text-gray-400">Линии</div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-purple-400">{level}</div>
          <div className="text-xs text-gray-400">Уровень</div>
        </div>
      </div>

      <div className="bg-gray-900 p-1 md:p-2 rounded-xl shadow-2xl w-full max-w-xs mx-auto">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: '1px',
          background: '#0a0a0a',
          padding: '2px',
          aspectRatio: '10/20'
        }}>
          {renderBoard().map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                style={{
                  width: '100%',
                  paddingBottom: '100%',
                  backgroundColor: cell ? COLORS[cell] : '#1f2937',
                  border: cell ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  borderRadius: '2px'
                }}
              />
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        <button 
          onClick={() => moveHorizontal(-1)}
          className="bg-gradient-to-br from-blue-500 to-blue-600 active:from-blue-600 active:to-blue-700 p-4 md:p-5 rounded-lg text-xl md:text-2xl font-bold shadow-lg active:scale-95 transition touch-manipulation"
        >
          ←
        </button>
        <button 
          onClick={rotate}
          className="bg-gradient-to-br from-purple-500 to-purple-600 active:from-purple-600 active:to-purple-700 p-4 md:p-5 rounded-lg shadow-lg active:scale-95 transition touch-manipulation flex items-center justify-center"
        >
          <RotateCw className="w-6 h-6 md:w-7 md:h-7" />
        </button>
        <button 
          onClick={() => moveHorizontal(1)}
          className="bg-gradient-to-br from-blue-500 to-blue-600 active:from-blue-600 active:to-blue-700 p-4 md:p-5 rounded-lg text-xl md:text-2xl font-bold shadow-lg active:scale-95 transition touch-manipulation"
        >
          →
        </button>
        <button 
          onClick={moveDown}
          className="bg-gradient-to-br from-green-500 to-green-600 active:from-green-600 active:to-green-700 p-4 md:p-5 rounded-lg text-xl md:text-2xl font-bold shadow-lg active:scale-95 transition touch-manipulation col-span-3"
        >
          ↓ Ускорить
        </button>
      </div>

      {gameOver && (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 md:p-6 text-center w-full">
          <div className="text-xl md:text-2xl font-bold text-red-400 mb-2">Игра окончена!</div>
          <div className="text-lg md:text-xl text-white mb-2">Финальный счёт: {score}</div>
          <div className="text-sm text-gray-300 mb-4">+{score} очков в рейтинг</div>
          <button
            onClick={handleRestart}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-6 py-3 rounded-lg font-bold shadow-lg active:scale-95 transition touch-manipulation w-full"
          >
            🔄 Играть снова
          </button>
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('menu');
  const [currentGame, setCurrentGame] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState({
    totalScore: 0,
    gamesPlayed: 0,
    snakeGames: 0,
    tetrisGames: 0,
    snakeHighScore: 0,
    tetrisHighScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      const tgUser = initTelegramUser();
      
      if (!tgUser || !tgUser.id) {
        setError('Приложение должно быть запущено через Telegram Mini App');
        setLoading(false);
        return;
      }

      setUser(tgUser);
      await loadUserData(tgUser.id);
      await loadLeaderboard();
      setLoading(false);
    };
    initApp();
  }, []);

  const loadUserData = async (userId) => {
    try {
      const result = await window.storage.get(`user_${userId}`);
      if (result) {
        setUserStats(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Новый пользователь:', error);
    }
  };

  const saveUserData = async (userId, stats) => {
    try {
      await window.storage.set(`user_${userId}`, JSON.stringify(stats));
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const result = await window.storage.get('leaderboard', true);
      if (result) {
        setLeaderboard(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Leaderboard пуст:', error);
    }
  };

  const updateLeaderboard = async (userId, username, totalScore) => {
    try {
      let lb = [];
      try {
        const result = await window.storage.get('leaderboard', true);
        if (result) {
          lb = JSON.parse(result.value);
        }
      } catch (error) {
        lb = [];
      }

      const existingIndex = lb.findIndex(entry => entry.userId === userId);
      if (existingIndex >= 0) {
        lb[existingIndex].score = totalScore;
        lb[existingIndex].username = username;
      } else {
        lb.push({ userId, username, score: totalScore });
      }

      lb.sort((a, b) => b.score - a.score);
      lb = lb.slice(0, 100);

      await window.storage.set('leaderboard', JSON.stringify(lb), true);
      setLeaderboard(lb);
    } catch (error) {
      console.error('Ошибка обновления leaderboard:', error);
    }
  };

  const handleGameEnd = async (gameType, score) => {
    const newStats = { ...userStats };
    newStats.totalScore += score;
    newStats.gamesPlayed += 1;

    if (gameType === 'snake') {
      newStats.snakeGames += 1;
      if (score > newStats.snakeHighScore) {
        newStats.snakeHighScore = score;
      }
    } else if (gameType === 'tetris') {
      newStats.tetrisGames += 1;
      if (score > newStats.tetrisHighScore) {
        newStats.tetrisHighScore = score;
      }
    }

    setUserStats(newStats);
    await saveUserData(user.id, newStats);
    await updateLeaderboard(user.id, user.username, newStats.totalScore);
  };

  const handleRestart = () => {
    // Просто сбрасываем состояние для рестарта игры
  };

  const getUserRank = () => {
    const rank = leaderboard.findIndex(entry => entry.userId === user?.id);
    return rank >= 0 ? rank + 1 : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-white text-xl md:text-2xl animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-6 md:p-8 text-center max-w-md">
          <div className="text-4xl md:text-5xl mb-4">⚠️</div>
          <div className="text-lg md:text-xl font-bold text-red-400 mb-2">Ошибка запуска</div>
          <div className="text-sm md:text-base text-white">{error}</div>
          <div className="text-xs md:text-sm text-gray-300 mt-4">
            Откройте приложение через Telegram бота
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-3 md:p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-4 md:mb-6">
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-3 md:p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg md:text-xl font-bold">{user.first_name}</div>
              <div className="text-xs md:text-sm text-gray-400">@{user.username}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">{userStats.totalScore}</div>
              <div className="text-xs text-gray-400">
                {getUserRank() ? `#${getUserRank()} в рейтинге` : 'Начни играть!'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {screen === 'menu' && (
          <div className="space-y-4 md:space-y-6">
            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={() => { setScreen('game'); setCurrentGame('snake'); }}
                className="bg-gradient-to-br from-green-600 to-green-700 active:from-green-700 active:to-green-800 p-5 md:p-6 rounded-xl shadow-xl transform active:scale-95 transition-all duration-200 touch-manipulation"
              >
                <div className="flex items-center gap-3 md:gap-4 mb-3">
                  <div className="text-4xl md:text-5xl">🐍</div>
                  <div className="text-left flex-1">
                    <div className="text-xl md:text-2xl font-bold">Змейка</div>
                    <div className="text-xs md:text-sm text-green-200">Классическая игра</div>
                  </div>
                </div>
                <div className="bg-green-800/40 rounded-lg p-2 md:p-3 mt-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>Рекорд:</span>
                    <span className="font-bold">{userStats.snakeHighScore}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm mt-1">
                    <span>Игр:</span>
                    <span className="font-bold">{userStats.snakeGames}</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { setScreen('game'); setCurrentGame('tetris'); }}
                className="bg-gradient-to-br from-blue-600 to-blue-700 active:from-blue-700 active:to-blue-800 p-5 md:p-6 rounded-xl shadow-xl transform active:scale-95 transition-all duration-200 touch-manipulation"
              >
                <div className="flex items-center gap-3 md:gap-4 mb-3">
                  <div className="text-4xl md:text-5xl">🎮</div>
                  <div className="text-left flex-1">
                    <div className="text-xl md:text-2xl font-bold">Тетрис</div>
                    <div className="text-xs md:text-sm text-blue-200">Собирай линии</div>
                  </div>
                </div>
                <div className="bg-blue-800/40 rounded-lg p-2 md:p-3 mt-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>Рекорд:</span>
                    <span className="font-bold">{userStats.tetrisHighScore}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm mt-1">
                    <span>Игр:</span>
                    <span className="font-bold">{userStats.tetrisGames}</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Leaderboard Button */}
            <button
              onClick={() => setScreen('leaderboard')}
              className="w-full bg-gradient-to-br from-yellow-600 to-yellow-700 active:from-yellow-700 active:to-yellow-800 p-5 md:p-6 rounded-xl shadow-xl transform active:scale-95 transition-all duration-200 touch-manipulation"
            >
              <div className="flex items-center justify-center gap-3 md:gap-4">
                <Trophy className="w-8 h-8 md:w-10 md:h-10" />
                <div>
                  <div className="text-xl md:text-2xl font-bold">Таблица лидеров</div>
                  <div className="text-xs md:text-sm text-yellow-200">
                    {getUserRank() ? `Ваше место: #${getUserRank()}` : 'Посмотри топ игроков'}
                  </div>
                </div>
              </div>
            </button>

            {/* Stats */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 md:p-6 shadow-xl">
              <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 md:w-7 md:h-7 text-purple-400" />
                Ваша статистика
              </h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-purple-900/30 rounded-lg p-3 md:p-4">
                  <div className="text-2xl md:text-3xl font-bold text-purple-400">{userStats.gamesPlayed}</div>
                  <div className="text-xs md:text-sm text-gray-300">Всего игр</div>
                </div>
                <div className="bg-yellow-900/30 rounded-lg p-3 md:p-4">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400">{userStats.totalScore}</div>
                  <div className="text-xs md:text-sm text-gray-300">Всего очков</div>
                </div>
                <div className="bg-green-900/30 rounded-lg p-3 md:p-4">
                  <div className="text-2xl md:text-3xl font-bold text-green-400">{userStats.snakeGames}</div>
                  <div className="text-xs md:text-sm text-gray-300">Змейка</div>
                </div>
                <div className="bg-blue-900/30 rounded-lg p-3 md:p-4">
                  <div className="text-2xl md:text-3xl font-bold text-blue-400">{userStats.tetrisGames}</div>
                  <div className="text-xs md:text-sm text-gray-300">Тетрис</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {screen === 'game' && (
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 md:p-6 shadow-xl">
            <button
              onClick={() => { setScreen('menu'); setCurrentGame(null); }}
              className="flex items-center gap-2 mb-4 md:mb-6 text-gray-300 hover:text-white transition bg-gray-700/50 px-3 md:px-4 py-2 rounded-lg hover:bg-gray-700 touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Назад в меню</span>
            </button>
            
            {currentGame === 'snake' && <SnakeGame onGameEnd={handleGameEnd} onRestart={handleRestart} user={user} />}
            {currentGame === 'tetris' && <TetrisGame onGameEnd={handleGameEnd} onRestart={handleRestart} user={user} />}
          </div>
        )}

        {screen === 'leaderboard' && (
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 md:p-6 shadow-xl">
            <button
              onClick={() => setScreen('menu')}
              className="flex items-center gap-2 mb-4 md:mb-6 text-gray-300 hover:text-white transition bg-gray-700/50 px-3 md:px-4 py-2 rounded-lg hover:bg-gray-700 touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Назад в меню</span>
            </button>

            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
              <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
              Таблица лидеров
            </h2>

            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="text-center text-gray-400 py-8 md:py-12 bg-gray-700/30 rounded-xl">
                  <Trophy className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-30" />
                  <div className="text-lg md:text-xl">Рейтинг пока пуст</div>
                  <div className="text-xs md:text-sm mt-2">Сыграй первым и займи лидирующую позицию!</div>
                </div>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl transition-all ${
                      entry.userId === user.id 
                        ? 'bg-purple-600/40 border-2 border-purple-400 shadow-lg scale-105' 
                        : 'bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12">
                      {index === 0 && <Crown className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />}
                      {index === 1 && <Medal className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />}
                      {index === 2 && <Award className="w-8 h-8 md:w-10 md:h-10 text-orange-400" />}
                      {index > 2 && (
                        <span className="text-xl md:text-2xl font-bold text-gray-400">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-base md:text-lg">{entry.username}</div>
                      {entry.userId === user.id && (
                        <div className="text-xs text-purple-300 font-semibold">👤 Это вы</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl md:text-2xl font-bold text-yellow-400">{entry.score}</div>
                      <div className="text-xs text-gray-400">очков</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {getUserRank() && getUserRank() > 10 && (
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-purple-900/30 rounded-xl border border-purple-500/50">
                <div className="text-center">
                  <div className="text-xs md:text-sm text-gray-300 mb-1">Ваша позиция</div>
                  <div className="text-2xl md:text-3xl font-bold text-purple-400">#{getUserRank()}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
