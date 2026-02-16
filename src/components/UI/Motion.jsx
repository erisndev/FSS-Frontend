import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Centralized motion presets to keep animations consistent across the app.
 * Tuned for a "premium" feel: subtle movement, fast but not snappy, no overshoot.
 */
export const motionTokens = {
  ease: [0.22, 1, 0.36, 1], // premium ease-out
  easeSoft: [0.25, 0.9, 0.25, 1],
  duration: {
    fast: 0.16,
    base: 0.26,
    slow: 0.34,
  },
  distance: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 22,
  },
};

export function PageTransition({ children, className = "", variant = "fadeUp" }) {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    fadeUp: {
      initial: { opacity: 0, y: motionTokens.distance.md, filter: "blur(8px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      exit: { opacity: 0, y: -motionTokens.distance.xs, filter: "blur(8px)" },
      transition: { duration: motionTokens.duration.base, ease: motionTokens.ease },
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: motionTokens.duration.base, ease: motionTokens.easeSoft },
    },
    slideLeft: {
      initial: { opacity: 0, x: motionTokens.distance.lg, filter: "blur(8px)" },
      animate: { opacity: 1, x: 0, filter: "blur(0px)" },
      exit: { opacity: 0, x: -motionTokens.distance.sm, filter: "blur(8px)" },
      transition: { duration: motionTokens.duration.base, ease: motionTokens.ease },
    },
  };

  const chosen = variants[variant] ?? variants.fadeUp;

  if (shouldReduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={chosen.initial}
      animate={chosen.animate}
      exit={chosen.exit}
      transition={chosen.transition}
    >
      {children}
    </motion.div>
  );
}

/**
 * Wrap <Routes/> with this to get correct exit animations.
 * It relies on react-router location.key for transitions.
 */
export function AnimatedRouteContainer({ children, locationKey }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <React.Fragment key={locationKey}>{children}</React.Fragment>
    </AnimatePresence>
  );
}

/**
 * Generic appear animation for components (cards, panels, sections, etc.)
 * Usage: <Appear><YourComponent/></Appear>
 */
export function Appear({
  children,
  className = "",
  as: Comp = motion.div,
  variant = "rise",
  delay = 0,
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    const Plain = typeof Comp === "string" ? Comp : "div";
    return <Plain className={className}>{children}</Plain>;
  }

  const variants = {
    rise: {
      initial: { opacity: 0, y: motionTokens.distance.sm, filter: "blur(8px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    },
    pop: {
      initial: { opacity: 0, scale: 0.98, filter: "blur(8px)" },
      animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    },
  };

  const chosen = variants[variant] ?? variants.rise;

  return (
    <Comp
      className={className}
      initial={chosen.initial}
      animate={chosen.animate}
      transition={{
        duration: motionTokens.duration.base,
        ease: motionTokens.ease,
        delay,
      }}
    >
      {children}
    </Comp>
  );
}

/**
 * Lightweight "stagger in" for lists/cards.
 */
export function Stagger({ children, className = "", delayChildren = 0.02, staggerChildren = 0.05 }) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 1 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: motionTokens.distance.sm, filter: "blur(8px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration: motionTokens.duration.base,
            ease: motionTokens.ease,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
