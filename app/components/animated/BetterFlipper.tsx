import { motion } from "framer-motion";
import { ReactNode } from "react";

export const BetterFlipper = ({ children }: { children?: ReactNode }) => {
  return (
    <article>
      <div />
      {/* front */}
      <motion.div></motion.div>
      {/* back */}
      <motion.div></motion.div>
      <div />
    </article>
  );
};
