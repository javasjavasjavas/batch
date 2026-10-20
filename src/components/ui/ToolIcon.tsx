import { RefreshCwIcon, ScalingIcon, ShrinkIcon, TextCursorInputIcon } from "lucide-react";
import type { LucideIcon } from 'lucide-react';
import { ToolId } from "../../types/batch";
export const TOOL_ICONS: Record<ToolId, LucideIcon> = {
  resize: ScalingIcon,
  compress: ShrinkIcon,
  convert: RefreshCwIcon,
  rename: TextCursorInputIcon
};
export function ToolIcon({
  tool,
  className = 'h-[18px] w-[18px]'



}: {tool: ToolId;className?: string;}) {
  const Icon = TOOL_ICONS[tool];
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}
