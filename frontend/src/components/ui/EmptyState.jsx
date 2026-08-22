import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-full bg-gray-100 p-4">
        <Inbox className="h-8 w-8 text-gray-400" />
      </div>
      <div>
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
