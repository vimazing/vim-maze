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
  const { containerRef, gameStatus } = gameManager;

  return (
    <div>
      <div className="relative mx-auto my-4 w-fit" id="maze_container">
        <div ref={containerRef} className="relative" />
      </div>
      <div className="text-center text-2xl text-muted-foreground">
        {gameStatus === "waiting" && <p>Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to start</p>}
        {gameStatus === "started" && <p>Use <kbd className="px-2 py-1 bg-muted rounded">hjkl</kbd> to change direction • Press <kbd className="px-2 py-1 bg-muted rounded">q</kbd> to quit</p>}
        {gameStatus === "game-over" && <p>Game Over! Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to restart</p>}
      </div>
    </div>
  );
};

export default App;
