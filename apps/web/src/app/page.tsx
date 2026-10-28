export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeContent: 'center',
        gap: 8,
        padding: 16,
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 64,
          fontWeight: 800,
          letterSpacing: -2,
          color: 'var(--color-accent-text)',
        }}
      >
        089
      </h1>
      <p style={{ margin: 0, fontSize: 18, color: 'var(--color-text-secondary)' }}>
        München entdecken. Bald verfügbar.
      </p>
    </main>
  );
}
