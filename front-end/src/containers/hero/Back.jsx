import { useRef, useEffect } from 'react';

const Squares = ({
  mouseEventTarget,
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  squareSize = 40,
  hoverFillColor = '#222',
  trailLength = 4, // maximum number of trail squares
}) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const gridOffset = useRef({ x: 0, y: 0 });
  const trailSquares = useRef([]); // {x, y, opacity}

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const eventTarget = mouseEventTarget?.current || canvas;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const offsetX = gridOffset.current.x;
      const offsetY = gridOffset.current.y;

      for (let x = -squareSize; x < canvas.width + squareSize; x += squareSize) {
        for (let y = -squareSize; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x + offsetX;
          const squareY = y + offsetY;
          const indexX = Math.floor(x / squareSize);
          const indexY = Math.floor(y / squareSize);

          // Draw trail squares with fading effect
          trailSquares.current.forEach(trail => {
            if (trail.x === indexX && trail.y === indexY) {
              ctx.fillStyle = `rgba(${parseInt(hoverFillColor.slice(1, 3), 16)}, ${parseInt(hoverFillColor.slice(3, 5), 16)}, ${parseInt(hoverFillColor.slice(5, 7), 16)}, ${trail.opacity})`;
              ctx.fillRect(squareX, squareY, squareSize, squareSize);
            }
          });

          ctx.strokeStyle = borderColor;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case 'right':
          gridOffset.current.x += effectiveSpeed; break;
        case 'left':
          gridOffset.current.x -= effectiveSpeed; break;
        case 'up':
          gridOffset.current.y -= effectiveSpeed; break;
        case 'down':
          gridOffset.current.y += effectiveSpeed; break;
        case 'diagonal':
          gridOffset.current.x += effectiveSpeed;
          gridOffset.current.y += effectiveSpeed; break;
        default: break;
      }

      gridOffset.current.x = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
      gridOffset.current.y = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;

      // Reduce opacity for all trail squares
      trailSquares.current = trailSquares.current
        .map(trail => ({ ...trail, opacity: trail.opacity - 0.15 })) // adjust fade speed
        .filter(trail => trail.opacity > 0);

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event) => {
      const rect = eventTarget.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const adjustedX = mouseX - gridOffset.current.x;
      const adjustedY = mouseY - gridOffset.current.y;

      const hoveredSquare = {
        x: Math.floor(adjustedX / squareSize),
        y: Math.floor(adjustedY / squareSize),
        opacity: 1, // start fully opaque
      };

      trailSquares.current.push(hoveredSquare);

      if (trailSquares.current.length > trailLength * 2) {
        trailSquares.current.shift(); // keep array manageable
      }
    };

    const handleMouseLeave = () => {
      trailSquares.current = [];
    };

    eventTarget.addEventListener('mousemove', handleMouseMove);
    eventTarget.addEventListener('mouseleave', handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      eventTarget.removeEventListener('mousemove', handleMouseMove);
      eventTarget.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseEventTarget, direction, speed, borderColor, hoverFillColor, squareSize, trailLength]);

  return <canvas ref={canvasRef} className="w-full h-full border-none block" />;
};

export default Squares;
