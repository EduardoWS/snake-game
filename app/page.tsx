'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

const GRID_SIZE = 20;
const INITIAL_GAME_SPEED = 200; // ms
const MIN_GAME_SPEED = 128; // ms
const SPEED_INCREMENT = 2; // ms
const INITIAL_SNAKE_POSITION = [{x:10, y:9}, {x:10, y:10}];

export default function Home() {

  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE });

  // GAME STATES
  const [snake_size, set_snake_size] = useState(INITIAL_SNAKE_POSITION)
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState('UP');
  const [gameSpeed, setGameSpeed] = useState(INITIAL_GAME_SPEED);
  const [gameState, setGameState] = useState('IDLE'); // IDLE, RUNNING, GAME_OVER
  const [timeSinceFood, setTimeSinceFood] = useState(0); // Contador de ticks para pontuação bônus
  const [score, setScore] = useState(0);

  // FUNÇÃO PARA GERAR COMIDA FORA DA COBRA
  const generateFood = (snakeBody: any[]) => {
    let newFoodPosition: any;
    do {
      newFoodPosition = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snakeBody.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
    
    setFood(newFoodPosition);
  };


  useEffect(() => {
    if(gameState !== 'RUNNING') return;

    const interval = setInterval(() => { 
      setTimeSinceFood(prev => prev + 1); // Incrementa o tempo para o bônus de velocidade

      const snake = [...snake_size]
      const snake_head = snake[0];
      let snake_newhead = {x:0, y:0}

      if(direction === 'UP'){
        snake_newhead = {x: snake_head.x, y: snake_head.y - 1}
      } 
      else if(direction === 'DOWN'){
        snake_newhead = {x: snake_head.x, y: snake_head.y + 1}
      }
      else if(direction === 'LEFT'){
        snake_newhead = {x: snake_head.x - 1, y: snake_head.y}
      }
      else if(direction === 'RIGHT'){
        snake_newhead = {x: snake_head.x + 1, y: snake_head.y}
      }
      
      if(snake_newhead.x < 0) {setGameState('GAME_OVER'); return};
      if(snake_newhead.x >= GRID_SIZE) {setGameState('GAME_OVER'); return};
      if(snake_newhead.y < 0) {setGameState('GAME_OVER'); return};
      if(snake_newhead.y >= GRID_SIZE) {setGameState('GAME_OVER'); return};

      if(snake.some(segment => segment.x === snake_newhead.x && segment.y === snake_newhead.y)) {setGameState('GAME_OVER'); return};
      
      snake.unshift(snake_newhead);
      
      if(snake_newhead.x === food.x && snake_newhead.y === food.y) {
        // Aumenta a pontuação (bônus por rapidez)
        const bonus = Math.max(0, 50 - timeSinceFood); // Bônus de até 50 pontos
        setScore(prev => prev + 100 + bonus);
        setTimeSinceFood(0); // Reseta o contador de tempo

        // Aumenta a velocidade
        setGameSpeed(prevSpeed => Math.max(MIN_GAME_SPEED, prevSpeed - SPEED_INCREMENT));
        
        // Gera nova comida
        generateFood(snake);
      }
      else {
        snake.pop();
      }
      set_snake_size(snake)

    }, gameSpeed);

    return () => clearInterval(interval);
    

  }, [snake_size, direction, gameState, gameSpeed])

  useEffect(() => {
    const handleKeyDown: any = (e: any) => {
      switch (e.key){
        case 'ArrowUp':
          if (direction !== 'DOWN') { setDirection('UP'); }
          break;
        case 'ArrowDown':
          if (direction !== 'UP') { setDirection('DOWN'); }
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') { setDirection('LEFT'); }
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') { setDirection('RIGHT'); }
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [direction])


  const handleStartGame = () => {
    set_snake_size(INITIAL_SNAKE_POSITION);
    setDirection('UP');
    setScore(0);
    setGameSpeed(INITIAL_GAME_SPEED);
    setTimeSinceFood(0);
    generateFood(INITIAL_SNAKE_POSITION);
    setGameState('RUNNING');
  };

  const handleRestart = () => {
    handleStartGame();
  };


  return (
    <main className="flex flex-col min-h-screen p-4 items-center justify-center bg-retro-screen-darker font-retro">
      
      {/* PAINEL DE INFORMAÇÕES E PONTUAÇÃO */}
      <div className="w-full max-w-[700px] bg-retro-screen text-retro-text p-4 border-4 border-retro-border mb-4 flex justify-between items-center">
        <h1 className="text-3xl uppercase tracking-widest">Snake</h1>
        <div className="text-right">
          <div className="text-lg">SCORE</div>
          <div className="text-4xl font-bold">{score.toString().padStart(5, '0')}</div>
        </div>
      </div>

      {/* ÁREA DO JOGO */}
      <div className="relative grid grid-cols-20 gap-px bg-retro-screen w-full max-w-[700px] aspect-square border-4 border-retro-border">
        
        {/* TELA DE INÍCIO E GAME OVER */}
        {gameState !== 'RUNNING' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-retro-screen bg-opacity-90 z-10">
            {gameState === 'IDLE' && (
              <>
                <h2 className="text-5xl font-bold text-retro-text mb-8">READY?</h2>
                <button
                  onClick={handleStartGame}
                  className="bg-retro-snake text-retro-screen-darker font-bold py-3 px-6 rounded-md hover:bg-green-400 transition-colors text-2xl"
                >
                  START GAME
                </button>
              </>
            )}
            {gameState === 'GAME_OVER' && (
              <>
                <h2 className="text-6xl font-bold text-retro-food mb-2">GAME OVER</h2>
                <p className="text-2xl text-retro-text mb-8">FINAL SCORE: {score}</p>
                <button
                  onClick={handleRestart}
                  className="bg-retro-snake text-retro-screen-darker font-bold py-3 px-6 rounded-md hover:bg-green-400 transition-colors text-2xl"
                >
                  PLAY AGAIN
                </button>
              </>
            )}
          </div>
        )}
        
        {/* RENDERIZAÇÃO DO GRID */}
        {cells.map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          // A cobra e a comida só aparecem se o jogo estiver rodando
          const isSnakeCell = gameState === 'RUNNING' && snake_size.some(segment => segment.x === x && segment.y === y);
          const isFoodCell = gameState === 'RUNNING' && food.x === x && food.y === y;
          const isHeadCell = isSnakeCell && snake_size[0].x === x && snake_size[0].y === y;

          return (
            <div
              key={index}
              className={`
                h-full w-full
                ${isHeadCell ? 'bg-retro-snake-head' : 
                  isSnakeCell ? 'bg-retro-snake' : 
                  isFoodCell ? 'bg-retro-food' : 'bg-retro-screen'
                }
              `}
            ></div>
          );
        })}
      </div>
      
      <div className="text-retro-text mt-4 text-center text-sm">
        Use Arrow Keys to Move
      </div>
    </main>
  );
}
