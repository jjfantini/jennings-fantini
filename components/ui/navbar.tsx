"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { DATA } from "@/data/personal-details";
import { useIsMobile } from "@/lib/hooks/use-mobile-device";

const iconSizeClass = (compact: boolean) =>
  compact ? "size-8 rounded-full" : "size-12 rounded-full";

const dockContent = (compact?: boolean) => (
  <>
    {DATA.navbar.map((item) => (
      <DockIcon key={item.label}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              aria-label={item.label}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                iconSizeClass(!!compact),
              )}
            >
              <item.icon className={compact ? "size-3.5" : "size-4"} />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </DockIcon>
    ))}
    <Separator orientation="vertical" className="h-full" />
    {Object.entries(DATA.contact.social)
      .filter(([, social]) => social.navbar)
      .map(([name, social]) => (
        <DockIcon key={name}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={social.url}
                aria-label={social.name}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  iconSizeClass(!!compact),
                )}
              >
                <social.icon className={compact ? "size-3.5" : "size-4"} />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{name}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      ))}
    <Separator orientation="vertical" className={compact ? "h-6" : "h-full py-2"} />
    <DockIcon>
      <Tooltip>
        <TooltipTrigger asChild>
          <ModeToggle className={cn("rounded-full", compact && "size-8")} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Theme</p>
        </TooltipContent>
      </Tooltip>
    </DockIcon>
  </>
);

export default function Navbar() {
  const isMobile = useIsMobile("NavBar");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!isMobile) setExpanded(false);
  }, [isMobile]);

  if (!isMobile) {
    return (
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        onTouchMove={(e) => e.preventDefault()}
      >
        <TooltipProvider>
          <Dock
            direction="middle"
            className="pointer-events-auto bg-background/80 backdrop-blur-md border rounded-full p-1 sm:p-2 shadow-lg"
          >
            {dockContent(false)}
          </Dock>
        </TooltipProvider>
      </div>
    );
  }

  const springTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
  };

  const anchorPosition = "fixed bottom-8 right-6 z-50";

  return (
    <>
      <AnimatePresence>
        {!expanded && (
          <motion.button
            key="hamburger"
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Open navigation"
            aria-expanded={false}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 16,
              },
            }}
            exit={{
              scale: 0.3,
              opacity: 0,
              transition: { duration: 0.15 },
            }}
            style={{ transformOrigin: "right center" }}
            className={cn(
              anchorPosition,
              "flex size-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-md border shadow-lg pointer-events-auto",
            )}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="size-6" />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setExpanded(false)}
              className="fixed inset-0 z-40 bg-black/20"
              aria-hidden
            />
            <motion.div
              key="dock"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={springTransition}
              style={{ transformOrigin: "right center" }}
              className={cn(
                anchorPosition,
                "left-4 pointer-events-none flex justify-end overflow-hidden",
              )}
              onTouchMove={(e) => e.preventDefault()}
            >
              <TooltipProvider>
                <div className="pointer-events-auto w-full max-w-full overflow-hidden flex justify-end">
                  <Dock
                    direction="middle"
                    iconSize={24}
                    iconMagnification={36}
                    iconDistance={100}
                    className="bg-background/80 backdrop-blur-md border rounded-full p-1 gap-1 w-max max-w-full min-w-0 justify-end mt-0 ml-auto h-12"
                  >
                    {dockContent(true)}
                  </Dock>
                </div>
              </TooltipProvider>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
