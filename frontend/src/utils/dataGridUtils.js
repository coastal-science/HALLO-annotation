export function stopPropagation(event) {
  event.stopPropagation();
}

export const inputStopPropagation = (event) => {
  if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.stopPropagation();
  }
};

export const selectStopPropagation = (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
    event.stopPropagation();
  }
};