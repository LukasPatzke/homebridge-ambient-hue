
interface ISwipeEvent {
  event: TouchEvent;
  xDown: number;                                                        
  yDown: number;
  xDiff: number;
  yDiff: number;
  direction: SwipeDirection;
}

type SwipeHandler = (event: ISwipeEvent)=>void | undefined
type SwipeDirection = 'left'|'right'|'up'|'down'

export interface IUseSwipe {
  onSwiped?: SwipeHandler, 
  onSwiping?: SwipeHandler, 
  onSwipedLeft?: SwipeHandler, 
  onSwipingLeft?: SwipeHandler, 
  onSwipedRight?: SwipeHandler, 
  onSwipingRight?: SwipeHandler, 
  onSwipedUp?: SwipeHandler, 
  onSwipingUp?: SwipeHandler, 
  onSwipedDown?: SwipeHandler, 
  onSwipingDown?: SwipeHandler,
  swipeThreshold?: number,  //default 10px
  swipeTimeout?: number,  //default 1000ms
}


export const useSwipe = (config: IUseSwipe) => {
  var xDown: number|null = null;                                                        
  var yDown: number|null = null;
  var xDiff: number|null = null;
  var yDiff: number|null = null;
  var timeDown: number|null = null;

  const handleTouchStart = (e: TouchEvent) => {
      timeDown = Date.now();

      const firstTouch = e.touches[0];                                      
      xDown = firstTouch.clientX;                                      
      yDown = firstTouch.clientY; 
      xDiff = 0;
      yDiff = 0;                                     
  };                                                

  const handleTouchMove = (e: TouchEvent) => {
      if ( ! xDown || ! yDown || ! timeDown ) return;

      var xUp = e.touches[0].clientX;                                    
      var yUp = e.touches[0].clientY;

      xDiff = xDown - xUp;
      yDiff = yDown - yUp;

      var swipeThreshold = config.swipeThreshold || 20;
      var swipeTimeout = config.swipeTimeout || 500;
      var timeDiff = Date.now() - timeDown;
      var direction: SwipeDirection|'' = '';

      if (Math.abs(xDiff) > Math.abs(yDiff)) { // most significant
        if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
          if (xDiff > 0) {
            direction = 'left';
          }
          else {
            direction = 'right';
          }
        }
      }
      else {
        if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
          if (yDiff > 0) {
            direction = 'up';
          }
          else {
            direction = 'down';
          }
        }
      }
      
      if (direction !== '') {
        const swipeEvent: ISwipeEvent = {
          event: e,
          xDown: xDown,
          yDown: yDown,
          xDiff: xDiff,
          yDiff: yDiff,
          direction: direction 
        }
        if (config.onSwiping) config.onSwiping(swipeEvent)
        if (config.onSwipingLeft && direction==='left') config.onSwipingLeft(swipeEvent)
        if (config.onSwipingRight && direction==='right') config.onSwipingRight(swipeEvent)
        if (config.onSwipingUp && direction==='up') config.onSwipingUp(swipeEvent)
        if (config.onSwipingDown && direction==='down') config.onSwipingDown(swipeEvent)
      }                                    
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if ( ! xDown || ! yDown || !xDiff || !yDiff || ! timeDown ) return;

    var swipeThreshold = config.swipeThreshold || 20;
    var swipeTimeout = config.swipeTimeout || 500;
    var timeDiff = Date.now() - timeDown;
    var direction: SwipeDirection|'' = '';

    if (Math.abs(xDiff) > Math.abs(yDiff)) { // most significant
      if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
        if (xDiff > 0) {
          direction = 'left';
        }
        else {
          direction = 'right';
        }
      }
    }
    else {
      if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
        if (yDiff > 0) {
          direction = 'up';
        }
        else {
          direction = 'down';
        }
      }
    }

    if (direction !== '') {
      const swipeEvent: ISwipeEvent = {
        event: e,
        xDown: xDown,
        yDown: yDown,
        xDiff: xDiff,
        yDiff: yDiff,
        direction: direction 
      }
      if (config.onSwiped) config.onSwiped(swipeEvent)
      if (config.onSwipedLeft && direction==='left') config.onSwipedLeft(swipeEvent)
      if (config.onSwipedRight && direction==='right') config.onSwipedRight(swipeEvent)
      if (config.onSwipedUp && direction==='up') config.onSwipedUp(swipeEvent)
      if (config.onSwipedDown && direction==='down') config.onSwipedDown(swipeEvent)
    }
    /* reset values */
    xDown = null;
    yDown = null;   
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }

}

