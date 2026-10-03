import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="hero">
        <h2>Create phoneme activities</h2>

        <p>
          Use this site to make a phoneme Wordle or Word Search, test it in the browser, then download it as a standalone HTML file.
        </p>
      </section>

      <section className="activity-grid">
        <article className="activity-card">
          <h3>Phoneme Wordle</h3>
          <p>
            Choose a phoneme word, set the number of guesses and add pronunciation hints.
          </p>

          <Link href="/wordle" className="card-link">
            Create Wordle →
          </Link>
        </article>

        <article className="activity-card">
          <h3>Phoneme Word Search</h3>
          <p>
            Add five phoneme words and generate a simple classroom word search.
          </p>

          <Link href="/word-search" className="card-link">
            Create Word Search →
          </Link>
        </article>
      </section>
    </>
  );
}