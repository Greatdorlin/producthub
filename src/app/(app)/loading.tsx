export default function AppLoading() {
  return (
    <div className="ld-page" aria-label="Loading workspace">
      <section className="ld-page-header">
        <div>
          <div className="ld-skeleton ld-skeleton-chip" />
          <div className="ld-skeleton ld-skeleton-title mt-4" />
          <div className="ld-skeleton ld-skeleton-line mt-3" />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="ld-stat-card">
            <div className="ld-skeleton ld-skeleton-line w-1/2" />
            <div className="ld-skeleton ld-skeleton-number mt-4" />
          </div>
        ))}
      </section>

      <section className="ld-glass-card ld-panel">
        <div className="ld-card-list">
          {[0, 1, 2].map((item) => (
            <div key={item} className="ld-item-card">
              <div className="flex flex-wrap gap-2">
                <span className="ld-skeleton ld-skeleton-chip" />
                <span className="ld-skeleton ld-skeleton-chip" />
              </div>
              <div className="ld-skeleton ld-skeleton-heading mt-4" />
              <div className="ld-skeleton ld-skeleton-line mt-3" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
