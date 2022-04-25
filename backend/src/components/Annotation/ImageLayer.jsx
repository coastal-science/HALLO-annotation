import React, { useEffect } from "react";
import { Image, Layer } from "react-konva";
import useImage from "use-image";

const ImageLayer = ({ image, zoomLevel, width, setImageStatus }) => {
  const [imageObj, status] = useImage(image);

  useEffect(() => {
    setImageStatus(status);
    // eslint-disable-next-line
  }, [status]);

  const handleMouseEnter = (e) => {
    if (!zoomLevel) {
      return;
    }

    const layer = e.target.getLayer();

    layer.scale({ x: 2, y: 2 });
  };

  const handleMouseMove = (e) => {
    if (!zoomLevel) {
      return;
    }

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    const layer = e.target.getLayer();
    layer.x(-pos.x);
    layer.y(-pos.y);
  };

  const handleMouseLeave = (e) => {
    if (!zoomLevel) {
      return;
    }

    const layer = e.target.getLayer();
    layer.x(0);
    layer.y(0);
    layer.scale({
      x: 1,
      y: 1,
    });
  };

  return (
    <Layer>
      <Image
        image={imageObj}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        width={width}
        height={400}
      />
    </Layer>
  );
};

export default ImageLayer;
