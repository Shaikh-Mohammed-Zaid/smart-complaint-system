import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const useAnimatedCounter = (endValue, duration = 2) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      let ctx = gsap.context(() => {
        const obj = { value: 0 };
        gsap.to(obj, {
          value: endValue,
          duration,
          ease: 'power2.out',
          onUpdate() {
            if (ref.current) {
              ref.current.textContent = Math.ceil(obj.value);
            }
          }
        });
      });
      return () => ctx.revert();
    }
  }, [endValue, duration]);

  return ref;
};
