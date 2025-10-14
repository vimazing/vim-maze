import { useEffect } from "react";
import type { UseMazeType } from "./useMaze";
import type { UsePlayerType } from "./usePlayer";

type UseHeroRenderParams = {
  mazeManager: UseMazeType;
  playerManager: UsePlayerType;
  relative?: boolean;
};

export function useHeroRender(params: UseHeroRenderParams) {
  const { mazeManager, playerManager, relative = true } = params;
  const { containerRef } = mazeManager;
  const { playerPos } = playerManager;

  const applyRelativeNumbers = (mazeDiv: HTMLElement, R: number, C: number) => {
    // counts provided by caller
    const rows = Number(mazeDiv.dataset.rows || 0);
    const cols = Number(mazeDiv.dataset.cols || 0);

    // rows: borders blank; active row shows its ABSOLUTE number (r), others show |r-R|
    const rowNums = mazeDiv.querySelectorAll<HTMLElement>(".number.row[data-r]");
    rowNums.forEach((el) => {
      const r = Number(el.getAttribute("data-r"));
      if (r <= 0 || r >= rows) {
        el.textContent = "";
        el.classList.remove("is-active");
        return;
      }
      el.textContent = r === R ? String(r) : String(Math.abs(r - R));
      el.classList.toggle("is-active", r === R);
    });

    // cols (top & bottom): borders blank; active col shows ABSOLUTE number (c), others show |c-C|
    const colNums = mazeDiv.querySelectorAll<HTMLElement>(".number.col[data-c]");
    colNums.forEach((el) => {
      const c = Number(el.getAttribute("data-c"));
      if (c <= 0 || c >= cols) {
        el.textContent = "";
        el.classList.remove("is-active");
        return;
      }
      el.textContent = c === C ? String(c) : String(Math.abs(c - C));
      el.classList.toggle("is-active", c === C);
    });

    mazeDiv.classList.add("is-relative");
  };

  useEffect(() => {
    if (!playerPos) return;

    const container = containerRef.current;
    if (!container) return;

    const mazeDiv = container.querySelector("#maze") as HTMLElement | null;
    if (!mazeDiv) return;

    // Remove any previous hero marker
    mazeDiv.querySelectorAll(".hero").forEach((el) => el.classList.remove("hero"));

    // Place hero (select exact cell by coordinates)
    const selector = `.maze-row > div[data-r="${playerPos.r}"][data-c="${playerPos.c}"]`;
    const cell = mazeDiv.querySelector(selector) as HTMLElement | null;
    if (cell) cell.classList.add("hero");

    // Relative numbering (absolute on the active line/col)
    if (relative) {
      // Provide counts so helper can know borders
      mazeDiv.dataset.rows = String(mazeDiv.querySelectorAll(".maze-row").length);
      mazeDiv.dataset.cols = String(
        mazeDiv
          .querySelector(".maze-row > div[data-r][data-c]")
          ?.parentElement?.querySelectorAll(':scope > div[data-r][data-c]').length || 0
      );
      applyRelativeNumbers(mazeDiv, playerPos.r, playerPos.c);
    }
  }, [playerPos, containerRef]);
}

export type UseHeroRenderType = ReturnType<typeof useHeroRender>;
