"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ComponentProps, ReactNode } from "react";

export function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />;
}

export function SelectValue(props: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} />;
}

export function SelectTrigger({
  children,
  className = "",
  startIcon,
  ...props
}: Omit<ComponentProps<typeof SelectPrimitive.Trigger>, "prefix"> & { startIcon?: ReactNode }) {
  return (
    <SelectPrimitive.Trigger className={`ui-select-trigger ${className}`} {...props}>
      {startIcon && <span className="ui-select-prefix">{startIcon}</span>}
      <span className="ui-select-value">{children}</span>
      <SelectPrimitive.Icon asChild>
        <span className="select-icon" aria-hidden="true">v</span>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  children,
  className = "",
  position = "popper",
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={`ui-select-content ${className}`}
        position={position}
        sideOffset={6}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="ui-select-scroll-button">
          <span aria-hidden="true">^</span>
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="ui-select-viewport">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="ui-select-scroll-button">
          <span aria-hidden="true">v</span>
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  children,
  className = "",
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item className={`ui-select-item ${className}`} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ui-select-indicator">
        <span aria-hidden="true">✓</span>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
