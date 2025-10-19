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
    <div className="relative mx-auto my-4 w-fit" id="maze_container">
      <div ref={containerRef} className="relative" />
    </div>
  );
};

export default App;
