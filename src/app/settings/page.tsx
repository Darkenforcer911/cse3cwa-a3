"use client";

export default function SettingsPage() {
  function changeTheme(newTheme: "light" | "dark") {
    document.documentElement.dataset.theme = newTheme;

    document.cookie =
      `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
  }

  return (
    <section>
      <h2>Settings</h2>

      <p>Change the appearance of the Phoneme Activity Builder.</p>

      <div className="settings-card">
        <h3>Theme</h3>

        <p>Choose between light and dark mode.</p>

        <div className="theme-buttons">
          <button
            type="button"
            onClick={() => changeTheme("light")}
            className="theme-light-button"
          >
            Light
          </button>

          <button
            type="button"
            onClick={() => changeTheme("dark")}
            className="theme-dark-button"
          >
            Dark
          </button>
        </div>
      </div>
    </section>
  );
}