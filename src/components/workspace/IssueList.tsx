import { CircleAlertIcon, TriangleAlertIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { SettingsIssue } from '../../types/batch';
import { TOOL_LABEL } from '../../utils/planning';

interface IssueListProps {
  issues: SettingsIssue[];
  showTool?: boolean;
  className?: string;
}

export function IssueList({ issues, showTool, className }: IssueListProps) {
  if (!issues.length) return null;
  return (
    <ul className={twMerge('space-y-2', className)}>
      {issues.map((issue) => {
        const isError = issue.level === 'error';
        return (
          <li
            key={issue.id}
            className={twMerge(
              'flex gap-2.5 rounded-lg px-3 py-2.5 text-[13px] leading-snug',
              isError ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-[#5C4A2A]'
            )}>
            
            {isError ?
            <CircleAlertIcon className="mt-px h-4 w-4 shrink-0" aria-hidden="true" /> :

            <TriangleAlertIcon className="mt-px h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            }
            <span>
              <span className="sr-only">{isError ? 'Error: ' : 'Warning: '}</span>
              {showTool && issue.tool !== 'batch' && <span className="font-semibold">{TOOL_LABEL[issue.tool]}: </span>}
              {issue.message}
            </span>
          </li>);

      })}
    </ul>);

}