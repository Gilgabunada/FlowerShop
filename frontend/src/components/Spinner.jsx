export default function Spinner({ size = 40 }) {
  return (
    <div className="spinner-wrap">
      <div
        className="spinner"
        style={{ width: size, height: size }}
        role="status"
        aria-label="Loading"
      />
      <style>{`
        .spinner-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem;
        }
        .spinner {
          border: 3px solid var(--primary-light);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
