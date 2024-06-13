export function getInitPageContent(): string {
  return `
<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300&display=swap');

body {
    margin: 0;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: #f0f0f0;
    // font-family: 'Montserrat', sans-serif;
    text-align: center;
}

.centered {
    font-weight: 700;
    font-size: 5rem;
    color: #333;
    margin: 0;
}

.subtitle {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.0rem;
    color: #555;
    margin-top: 0.5rem;
}

.emoji {
    font-size: 0.7rem;
    margin-top: 1rem;
}
</style>
<div class="centered">
    Darwin
</div>
<div class="subtitle">
    There is grandeur in this view of life...
</div>
<div class="emoji">
    🧬 🧪 🦠 🦋
</div>
`
}
