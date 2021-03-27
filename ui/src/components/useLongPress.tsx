import { useState, useEffect, useCallback } from 'react';

export default function useLongPress(callback = () => {}, ms = 300) {
  const [startLongPress, setStartLongPress] = useState(false);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (startLongPress) {
      timerId = setTimeout(()=>{
        setStartLongPress(false);
        callback()
      }, ms);   
    } 

    return () => {
      clearTimeout(timerId);
    };
  }, [ms, startLongPress, callback]);

  const start = useCallback(() => {
    setStartLongPress(true);
  }, []);
  const stop = useCallback(() => {
    setStartLongPress(false);
  }, []);

  return (event:Event) => {
      if ((event.type==='touchstart')) {
        start();
      } else {
        stop();
      }
  }
}
