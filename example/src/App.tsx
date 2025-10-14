import { useGame } from "@vimazing/vim-maze";
import { useKeyBindings } from "./useKeyBindings";
import { useMounted } from "./useMounted";
import { useIsMobile } from "./useIsMobile";
import { GameOverlay } from "./GameOverlay";

function App() {
  const isMobile = useIsMobile();
  const mounted = useMounted();
  const cols = isMobile ? 12 : 32;
  const rows = isMobile ? 8 : 24;

  const gameManager = useGame(cols, rows, useKeyBindings);
  const { containerRef, gameStatus, scoreManager } = gameManager;

  return (
    <div className="relative mx-auto my-4 w-fit" id="maze_container">
      <div ref={containerRef} className="relative" />
      {mounted && <GameOverlay gameStatus={gameStatus} scoreManager={scoreManager} />}
    </div>
  );
};

export default App;
