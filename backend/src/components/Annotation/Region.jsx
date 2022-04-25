import React, { useRef, useEffect } from "react";
import { Rect, Transformer, Text, Group } from "react-konva";

const Region = ({ shapeProps, isSelected, onSelect, onChange, draggable }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const groupRef = useRef();
  const textRef = useRef();
  const { x, y, width, height, name, stroke, id, sound_id_species } =
    shapeProps;

  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Group
        id={id}
        name={name}
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        onClick={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
            draggable: true,
          });
        }}
        draggable={draggable}
      >
        <Rect
          onTap={onSelect}
          ref={shapeRef}
          width={width}
          height={height}
          stroke={stroke}
          onTransformEnd={(e) => {
            // transformer is changing scale of the node
            // and NOT its width or height
            // but in the store we have only width and height
            // to match the data better we will reset scale on transform end
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            // we will reset it back
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              ...shapeProps,
              // set minimal value
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(node.height() * scaleY),
            });
          }}
        ></Rect>
        <Text
          text={id}
          fontSize={12}
          fill={stroke}
          padding={2}
          ref={textRef}
          align="left"
          verticalAlign="middle"
          listening={false}
        ></Text>
        <Text
          y={15}
          text={sound_id_species}
          fontSize={12}
          fill={stroke}
          padding={2}
          ref={textRef}
          align="left"
          verticalAlign="middle"
          listening={false}
        ></Text>
        {isSelected && (
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
      </Group>
    </React.Fragment>
  );
};

export default Region;
