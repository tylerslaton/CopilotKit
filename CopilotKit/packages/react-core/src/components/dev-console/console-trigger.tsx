"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCopilotContext } from "../../context/copilot-context";
import { CopilotKitIcon } from "./icons";
import { DeveloperConsoleModal } from "./developer-console-modal";

// Storage key for hiding the Inspector trigger/modal
const INSPECTOR_HIDE_KEY = "cpk:inspector:hidden";
const HIDE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getHideUntil(): number | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(INSPECTOR_HIDE_KEY);
    if (!raw) return null;
    // legacy values
    if (raw === "1" || raw === "true") return Number.MAX_SAFE_INTEGER;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function hideForDuration(ms: number) {
  try {
    if (typeof window === "undefined") return;
    const until = Date.now() + ms;
    localStorage.setItem(INSPECTOR_HIDE_KEY, String(until));
  } catch {
    // ignore
  }
}

interface ConsoleTriggerProps {
  position?: "bottom-left" | "bottom-right";
}

export function ConsoleTrigger({ position = "bottom-right" }: ConsoleTriggerProps) {
  const context = useCopilotContext();
  const hasApiKey = Boolean(context.copilotApiConfig.publicApiKey);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    buttonX: number;
    buttonY: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize on client side only
  useEffect(() => {
    setMounted(true);
    try {
      const until = getHideUntil();
      if (until && Date.now() < until) {
        setIsHidden(true);
      } else if (until && Number.isFinite(until) && until !== Number.MAX_SAFE_INTEGER) {
        // expired -> clear
        localStorage.removeItem(INSPECTOR_HIDE_KEY);
      }
    } catch {
      // ignore
    }
    if (typeof window !== "undefined" && !buttonPosition) {
      const buttonSize = 48;
      const margin = 16;

      const initialPosition = {
        x: margin,
        y: margin, // top-left by default
      };

      setButtonPosition(initialPosition);
    }
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!buttonPosition) return;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      buttonX: buttonPosition.x,
      buttonY: buttonPosition.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!dragRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      // Calculate new position
      let newX = dragRef.current.buttonX + deltaX;
      let newY = dragRef.current.buttonY + deltaY;

      // Keep button within viewport bounds
      newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 60));

      setButtonPosition({ x: newX, y: newY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragRef.current = null;
    };

    // Use capture phase to intercept events before they reach other handlers
    document.addEventListener("mousemove", handleMouseMove, { capture: true, passive: false });
    document.addEventListener("mouseup", handleMouseUp, { capture: true, passive: false });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove, { capture: true });
      document.removeEventListener("mouseup", handleMouseUp, { capture: true });
    };
  }, [isDragging]);

  // Don't render until mounted and position is initialized
  if (!mounted || !buttonPosition || isHidden) {
    return null;
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          if (!isDragging) {
            // Modifier-click hides for 24h
            if (e.metaKey || e.altKey) {
              hideForDuration(HIDE_DURATION_MS);
              setIsHidden(true);
              return;
            }
            setIsModalOpen(true);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          hideForDuration(HIDE_DURATION_MS);
          setIsHidden(true);
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: "fixed",
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
          zIndex: 2147483647,
          width: "48px",
          height: "48px",
          background: isDragging ? "#0b0b0b" : isHovered ? "#101010" : "#0b0b0b",
          color: "white",
          borderRadius: "12px",
          boxShadow: isDragging
            ? "0 6px 18px rgba(0,0,0,0.22)"
            : isHovered
              ? "0 4px 12px rgba(0,0,0,0.18)"
              : "0 2px 8px rgba(0,0,0,0.15)",
          transition: isDragging ? "none" : "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: isDragging ? "grabbing" : "grab",
          opacity: 0.96,
          userSelect: "none",
          transform: isDragging ? "scale(1.02)" : isHovered ? "scale(1.04)" : "scale(1)",
          backdropFilter: "blur(6px)",
          pointerEvents: "auto",
          isolation: "isolate",
        }}
        title={
          hasApiKey
            ? "Open Inspector (Drag to move, right-click to hide 24h)"
            : "Inspector (License Key Required, drag to move, right-click to hide 24h)"
        }
      >
        <div
          style={{
            width: "22px",
            height: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: "none",
          }}
        >
          <CopilotKitIcon />
        </div>
        {!hasApiKey && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "14px",
              height: "14px",
              background: "#ef4444",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 4px rgba(239,68,68,0.35)",
              border: "1px solid white",
            }}
          >
            <span style={{ fontSize: "9px", color: "white", fontWeight: "bold" }}>!</span>
          </div>
        )}
      </button>

      <DeveloperConsoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hasApiKey={hasApiKey}
      />
    </>
  );
}
