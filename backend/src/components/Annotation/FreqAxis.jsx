import React, { memo } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";

const FreqAxis = memo(({ freq_max, freq_min, type }) => {
  const ticks = [];

  const step = (freq_max - freq_min) / 10;

  for (let i = 1; i < 10; i++) {
    if (type === 0) {
      ticks.push({
        y: 400 - i * 40,
        text: freq_max - (10 - i) * step,
      });
    }
  }

  return (
    <Stage width={40} height={400}>
      <Layer>
        <Rect x={30} y={400 - 2} width={12} height={2} fill="black" />
        {ticks.map((tick) => {
          return (
            <Rect
              key={tick.y}
              x={30}
              y={tick.y}
              width={12}
              height={2}
              fill="black"
            />
          );
        })}
        <Text text="Freq(Hz)" x={0} y={0} fontSize={8} />
        <Text text={freq_min} x={0} y={400 - 10} fontSize={10} />
        {ticks.map((tick) => {
          return (
            <Text
              key={tick.y}
              text={tick.text}
              x={0}
              y={tick.y}
              fontSize={10}
            />
          );
        })}
      </Layer>
    </Stage>
  );
});

export default FreqAxis;
