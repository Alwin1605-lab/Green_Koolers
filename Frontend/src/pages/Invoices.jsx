function Invoices() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">Generate invoices and track payments.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">No invoices yet</h2>
        <p className="mt-2 text-sm text-slate-500">Invoices will appear once generated.</p>
      </div>
    </>
  )
}

export default Invoices
