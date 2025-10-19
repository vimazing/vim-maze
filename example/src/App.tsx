import { useGame } from "../../src/useGame";
import { useKeyBindings } from "./useKeyBindings";
import { useMounted } from "./useMounted";
import { useIsMobile } from "./useIsMobile";
import '../../src/game.css';

function App() {
  const isMobile = useIsMobile();
  const mounted = useMounted();
  const cols = isMobile ? 12 : 32;
  const rows = isMobile ? 8 : 24;

  const gameManager = useGame({ cols, rows }, useKeyBindings);
  const { containerRef, gameStatus, scoreManager } = gameManager;
  const { timeValue, keystrokes, efficiency, optimalSteps, finalScore } = scoreManager;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-around min-h-[100vh]">
      <h1 className="text-6xl">VIMazing vim-maze example</h1>
      <div className="mx-auto my-4 w-fit bg-muted rounded-lg p-4">
        {(gameStatus === "started" || gameStatus === "has-key" || gameStatus === "game-won") && (
          <div className="flex gap-8 text-sm font-mono items-center">
            <div>
              <div className="text-muted-foreground">Time</div>
              <div className="text-lg font-bold">{formatTime(timeValue)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Keystrokes</div>
              <div className="text-lg font-bold">{keystrokes}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Efficiency</div>
              <div className={`text-lg font-bold ${efficiency > 150 ? 'text-red-500' : efficiency > 100 ? 'text-yellow-500' : 'text-green-500'}`}>
                {efficiency}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Optimal</div>
              <div className="text-lg font-bold">{optimalSteps}</div>
            </div>
            {gameStatus === "game-won" && finalScore && (
              <>
                <div className="w-px h-12 bg-muted-foreground/20" />
                <div className="text-center">
                  <div className="text-muted-foreground">Final Score</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">{finalScore}</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="relative mx-auto my-4 w-fit" id="maze_container">
        <div ref={containerRef} className="relative" />
      </div>
      <div className="text-center text-2xl text-muted-foreground">
        {gameStatus === "waiting" && <p>Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to start</p>}
        {gameStatus === "started" && <p>Use <kbd className="px-2 py-1 bg-muted rounded">hjkl</kbd> to change direction • Press <kbd className="px-2 py-1 bg-muted rounded">q</kbd> to quit</p>}
        {gameStatus === "game-over" && <p>Game Over! Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to restart</p>}
        {gameStatus === "game-won" && <p>You Won! Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to play again</p>}
      </div>
    </div>
  );
};

export default App;
