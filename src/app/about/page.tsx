export default function AboutPage() {
  return (
    <section className="about-page">
      <h2>About This Project</h2>

      <div className="about-card">
        <h3>Phoneme Activity Builder</h3>

        <p>
          This is a web application created for Speech Pathology students and
          teachers. It allows teachers to create phoneme-based activities,
          store and manage activity data, and generate standalone HTML files
          that can be used independently in a web browser.
        </p>

        <p>
          For Assessment 2, the project extends the frontend developed in
          Assessment 1 by adding a backend and database layer. The application
          uses Next.js server routes, Prisma and SQLite to save, retrieve,
          update and delete activity data and phoneme-based word lists.
        </p>

        <h3>Wordle</h3>

        <p>
          The Wordle builder allows a teacher to enter a phoneme word, its
          English equivalent, the number of guesses and whether pronunciation
          hints should be shown. Activities can be saved to the database,
          previewed in the browser and exported as standalone HTML files.
        </p>

        <h3>Word Search</h3>

        <p>
          The Word Search builder allows a teacher to create a list of
          phoneme-based words. The application stores the words and their
          phonemes in the database, generates a playable phoneme grid and can
          export the activity as a standalone HTML file.
        </p>

        <h3>Backend and Database</h3>

        <p>
          Saved activities can be viewed and managed through the application.
          Teachers can add, read, edit and delete stored words. Phonemes are
          stored separately so that symbols containing multiple characters,
          such as tʃ, can be treated as a single phoneme.
        </p>

        <p>
          Saved database records can also be used to generate new Wordle and
          Word Search HTML files. A health endpoint is provided at /health,
          and the completed application can run inside a Docker container.
        </p>

        <h3>Student Details</h3>

        <p>
          <strong>Name:</strong> Ahmed Syed
        </p>

        <p>
          <strong>Student Number:</strong> 21983308
        </p>

        <h3>Assessment 1 Frontend Walkthrough</h3>

        <p>
          This video demonstrates the original frontend developed in
          Assessment 1, which formed the foundation for the backend and
          database features added in Assessment 2.
        </p>

        <video
          controls
          width="100%"
          style={{
            marginTop: "12px",
            borderRadius: "10px",
          }}
        >
          <source
            src="/about-walkthrough.mp4"
            type="video/mp4"
          />
          Your browser does not support the video element.
        </video>
      </div>
    </section>
  );
}