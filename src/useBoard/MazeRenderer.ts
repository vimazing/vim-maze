import type { MazeData } from "../types";

export class MazeRenderer {
  private mazeData: MazeData;
  private numbered: boolean;
  private parentDiv?: HTMLElement;

  constructor(mazeData: MazeData, numbered: boolean = false) {
    this.mazeData = mazeData;
    this.numbered = numbered;
  }

  display(parentDiv: HTMLElement | null): boolean {
    this.parentDiv = parentDiv ?? undefined;

    if (!this.parentDiv) {
      console.error("Cannot initialise maze - parent element not provided.");
      return false;
    }

    while (this.parentDiv.firstChild) {
      this.parentDiv.removeChild(this.parentDiv.firstChild);
    }

    const container = document.createElement("div");
    container.id = "maze";
    container.dataset.steps = String(this.mazeData.totalSteps);

    const makeCell = (cls = "", text = "", attrs?: Record<string, string>) => {
      const d = document.createElement("div");
      d.className = cls;
      if (text) d.textContent = text;
      if (attrs) for (const k in attrs) d.setAttribute(k, attrs[k]);
      return d;
    };

    const rowLabel = (r: number) => (r > 0 && r < this.mazeData.rows ? String(r) : "");
    const colLabel = (c: number) => (c > 0 && c < this.mazeData.cols ? String(c) : "");

    if (this.numbered) {
      const topStrip = document.createElement("div");
      topStrip.className = "number-strip number-strip-top";
      topStrip.appendChild(makeCell("number corner", ""));
      for (let c = 0; c < this.mazeData.cols; c++) {
        topStrip.appendChild(makeCell("number col", colLabel(c), { "data-c": String(c) }));
      }
      topStrip.appendChild(makeCell("number corner", ""));
      container.appendChild(topStrip);
    }

    this.mazeData.maze.forEach((row, r) => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "maze-row";
      rowDiv.setAttribute("data-r", String(r));

      if (this.numbered) {
        rowDiv.appendChild(makeCell("number row", rowLabel(r), { "data-r": String(r) }));
      }

      row.forEach((cell, c) => {
        const cellDiv = document.createElement("div");
        if (cell) cellDiv.className = cell.join(" ");
        cellDiv.setAttribute("data-r", String(r));
        cellDiv.setAttribute("data-c", String(c));
        rowDiv.appendChild(cellDiv);
      });

      if (this.numbered) {
        rowDiv.appendChild(makeCell("number row", rowLabel(r), { "data-r": String(r) }));
      }

      container.appendChild(rowDiv);
    });

    if (this.numbered) {
      const bottomStrip = document.createElement("div");
      bottomStrip.className = "number-strip number-strip-bottom";
      bottomStrip.appendChild(makeCell("number corner", ""));
      for (let c = 0; c < this.mazeData.cols; c++) {
        bottomStrip.appendChild(makeCell("number col", colLabel(c), { "data-c": String(c) }));
      }
      bottomStrip.appendChild(makeCell("number corner", ""));
      container.appendChild(bottomStrip);
    }

    this.parentDiv.appendChild(container);
    return true;
  }

  getMazeEl(container: HTMLElement): HTMLElement | null {
    return container.querySelector("#maze");
  }

  getCellSelector(r: number, c: number): string {
    return `.maze-row > div[data-r="${r}"][data-c="${c}"]`;
  }

  getCellEl(container: HTMLElement, r: number, c: number): HTMLElement | null {
    const maze = this.getMazeEl(container);
    if (!maze) return null;
    return maze.querySelector(this.getCellSelector(r, c)) as HTMLElement | null;
  }

  addCellClass(container: HTMLElement, r: number, c: number, cls: string): void {
    this.getCellEl(container, r, c)?.classList.add(cls);
  }

  removeCellClass(container: HTMLElement, r: number, c: number, cls: string): void {
    this.getCellEl(container, r, c)?.classList.remove(cls);
  }

  toggleCellClass(container: HTMLElement, r: number, c: number, cls: string): void {
    this.getCellEl(container, r, c)?.classList.toggle(cls);
  }
}

