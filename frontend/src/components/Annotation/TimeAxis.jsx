import React, { memo } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import moment from "moment";

const TimeAxis = memo(({ width, start, end }) => {
  const duration = end - start;
  const ticks = [];

  for (let i = 1; i < Math.floor(duration / 5); i++) {
    ticks.push({
      x: 200 * i,
      text:
        `${(+start + 5 * i).toFixed(3)} ` +
        `(${moment.utc((+start + 5 * i) * 1000).format("HH:mm:ss")})`,
    });
  }

  return (
    <Stage width={width} height={25}>
      <Layer>
        <Rect x={0} y={0} width={2} height={12} fill="black" />
        {duration >= 5 &&
          ticks.map((tick) => {
            return (
              <Rect
                key={tick.x}
                x={tick.x}
                y={0}
                width={2}
                height={12}
                fill="black"
              />
            );
          })}
        <Rect x={width - 2} y={0} width={2} height={12} fill="black" />
        <Text
          text={`${start} (${moment.utc(start * 1000).format("HH:mm:ss")})`}
          x={0}
          y={15}
          fontSize={10}
        />
        {duration >= 5 &&
          ticks.map((tick) => {
            return (
              <Text
                text={tick.text}
                key={tick.x}
                x={tick.x - 15}
                y={15}
                fontSize={10}
              />
            );
          })}
        <Text text="Time(s)" x={width - 34} y={15} fontSize={10} />
      </Layer>
    </Stage>
  );
});

export default TimeAxis;
