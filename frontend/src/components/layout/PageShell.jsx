export default function PageShell({ title, description, children, action }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {(title || description || action) && (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </main>
  );
}
