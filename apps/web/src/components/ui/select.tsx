"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ComponentProps, ReactNode } from "react";
import { AltArrowDown, AltArrowUp, CheckCircle } from "@/components/solar-icons";

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
        <span className="select-icon" aria-hidden="true">
          <AltArrowDown size={16} weight="duotone" aria-hidden="true" />
        </span>
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
          <AltArrowUp size={15} weight="duotone" aria-hidden="true" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="ui-select-viewport">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="ui-select-scroll-button">
          <AltArrowDown size={15} weight="duotone" aria-hidden="true" />
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
        <CheckCircle size={16} weight="fill" aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
